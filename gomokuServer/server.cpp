#include "server.h"
#include "rapidjson/document.h"
#include "rapidjson/stringbuffer.h"
#include "rapidjson/writer.h"
extern LWS_VISIBLE LWS_EXTERN struct lws_vhost *
lws_get_vhost(struct lws *wsi);
//当浏览器出现连接重置时，可能是网站根目录出错或http响应格式出错或者访问的文件中内容完全为空
const char *doc_root = "/GOMOKU/gomokuServer/root/";
using namespace std;
using namespace rapidjson;
//创建html文件的路径
static char example_html_file_path[512] = {0};

static void
send_document_to_opponent(Document& new_doc, long player_id){
    cout << "SEND TO OPPONENT" << endl;
    // 转成字符串
    StringBuffer strBuffer;  
    Writer<StringBuffer> writer(strBuffer);  
    new_doc.Accept(writer);  

    long opponent_id = get_oppenent_id(player_id);
    if(opponent_id == CHESS_ERROR){
        return;
    }
    user_meta* opponent = (user_meta*) opponent_id;

    int msg_len = strlen(strBuffer.GetString());
    char* msg_to_send = (char*)malloc(msg_len + LWS_PRE);
    memcpy(msg_to_send + LWS_PRE, strBuffer.GetString(), msg_len);

    if(opponent->msg_to_send){
        free(opponent->msg_to_send);
    }
    opponent->msg_to_send = msg_to_send;
    opponent->msg_len = msg_len;
    lws_callback_on_writable(opponent->wsi);
}

static void
send_document_to_player(Document& new_doc, long player_id){
    cout << "send_document_to_player" << endl;
    // 转成字符串
    StringBuffer strBuffer;  
    Writer<StringBuffer> writer(strBuffer);  
    new_doc.Accept(writer);

    user_meta* player = (user_meta*) player_id;

    int msg_len = strlen(strBuffer.GetString());
    char* msg_to_send = (char*)malloc(msg_len + LWS_PRE);
    memcpy(msg_to_send + LWS_PRE, strBuffer.GetString(), msg_len);
    if(player->msg_to_send){
        free(player->msg_to_send);
    }
    player->msg_to_send = msg_to_send;
    player->msg_len = msg_len;

    lws_callback_on_writable(player->wsi);
}

static void
send_document_to_room(Document& new_doc, long player_id){
    if(playerid_to_gameid.find(player_id) == playerid_to_gameid.end()){
        cout << "Could not get game_id." << endl;
        return;
    }
    int game_id = playerid_to_gameid[player_id];
    if(gameid_to_game.find(game_id) == gameid_to_game.end()){
        cout << "Could not get game." << endl;
        return;
    }
    Chess* game = gameid_to_game[game_id];

    if(game->player1_id == -1 || game->player2_id == -1){
        cout << "Gamer lost." << endl;
        return;
    }

    // 转成字符串
    StringBuffer strBuffer;  
    Writer<StringBuffer> writer(strBuffer);  
    new_doc.Accept(writer);

    user_meta* player1 = (user_meta*) game->player1_id;
    user_meta* player2 = (user_meta*) game->player2_id;

    int msg_len = strlen(strBuffer.GetString());
    char* msg1_to_send = (char*)malloc(msg_len + LWS_PRE);
    char* msg2_to_send = (char*)malloc(msg_len + LWS_PRE);
    memcpy(msg1_to_send + LWS_PRE, strBuffer.GetString(), msg_len);
    memcpy(msg2_to_send + LWS_PRE, strBuffer.GetString(), msg_len);

    if(player1->msg_to_send){
        free(player1->msg_to_send);
    }
    if(player2->msg_to_send){
        free(player2->msg_to_send);
    }
    player1->msg_to_send = msg1_to_send;
    player2->msg_to_send = msg2_to_send;
    player1->msg_len = msg_len;
    player2->msg_len = msg_len;
    lws_callback_on_writable(player1->wsi);
    lws_callback_on_writable(player2->wsi);
}

//消息释放
static void
__minimal_destroy_message(void *_msg)
{
    struct msg *msg = (struct msg *)_msg;

    free(msg->payload);
    msg->payload = NULL;
    msg->len = 0;
}

//返回html文件的路径,会自动获取当前运行的路径
static const char *get_html_file_path(const char *file_name)
{
    memset(example_html_file_path, 0, sizeof(example_html_file_path));
    strcpy(example_html_file_path, doc_root);
    strcat(example_html_file_path, file_name);
    cout << "\033[36m" << example_html_file_path << "\033[0m" << endl;
    return (const char *)example_html_file_path;
}

//html协议的回调函数 此时in传入的是文件路径
static int callback_http(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len)
{
    struct user_meta *pss = (struct user_meta *)user;
    char *pchar = (char *)in;
    switch (reason)
    {
    case LWS_CALLBACK_HTTP:
    {
        cout << "LWS_CALLBACK_HTTP " << (char *)in << endl;
        if (strcmp(pchar, "/") == 0)
        {
            lws_serve_http_file(wsi, get_html_file_path("judge.html"), "text/html", NULL, 0);
        }
        else
        {
            pchar++;
            switch (*pchar)
            {
            case REGISTER_PAGE: //注册
            {
                lws_serve_http_file(wsi, get_html_file_path("register.html"), "text/html", NULL, 0);
            }
            break;
            case LOGIN_PAGE: //登录
            {
                lws_serve_http_file(wsi, get_html_file_path("log.html"), "text/html", NULL, 0);
            }
            break;
            case REGISTER_REQ: //注册请求
            case LOGIN_REQ: //登录请求
            {
                //先处理user=123&password=123
                //将用户名和密码提取出来
                char old_case = *pchar;

                pchar += 2;
                string name, password;
                int i;
                for (i = 5; pchar[i] != '&'; ++i)
                    name += pchar[i];

                int j = 0;
                for (i = i + 10; pchar[i] != '\0'; ++i, ++j)
                    password += pchar[i];

                cout << "user:, password:" << name << ' ' << password << endl;
                printf("%d\n", old_case);
                //同步线程登录校验
                if (old_case == REGISTER_REQ)
                {
                    printf("fff33\n");
                    // MYSQL* mysql;
                    // connectionRAII mysqlcon(&mysql, connPool);
                    // //如果是注册，先检测数据库中是否有重名的
                    // //没有重名的，进行增加数据
                    // char *sql_insert = (char *)malloc(sizeof(char) * 200);
                    // strcpy(sql_insert, "INSERT INTO user(username, passwd) VALUES(");
                    // strcat(sql_insert, "'");
                    // strcat(sql_insert, name.c_str());
                    // strcat(sql_insert, "', '");
                    // strcat(sql_insert, password.c_str());
                    // strcat(sql_insert, "')");

                    // if (users.find(name) == users.end())
                    // {

                    //     m_lock.lock();
                    //     int res = mysql_query(mysql, sql_insert);
                    //     users.insert(pair<string, string>(name, password));
                    //     m_lock.unlock();

                    //     if (!res)
                    //         lws_serve_http_file(wsi, get_html_file_path("log.html"), "text/html", NULL, 0);
                    //     else
                    //         lws_serve_http_file(wsi, get_html_file_path("registerError.html"), "text/html", NULL, 0);
                    // }
                    // else
                    //     lws_serve_http_file(wsi, get_html_file_path("registerError.html"), "text/html", NULL, 0);
                    
                    // free(sql_insert);
                }
                //如果是登录，直接判断
                //若浏览器端输入的用户名和密码在表中可以查找到，返回1，否则返回0
                else if (old_case == LOGIN_REQ)
                {
                    // for(auto pa : users){
                    //     cout << pa.first << ' ' << pa.second << endl;
                    // }
                    // if (users.find(name) != users.end() && users[name] == password){
                    //     printf("fff3\n");
                    //     // MYSQL* mysql;
                    //     // connectionRAII mysqlcon(&mysql, connPool);
                    //     // string sql_query = "SELECT id FROM user WHERE username = " + name;

                    //     // //进行数据库查询用户的id
                    //     // int res = mysql_query(mysql, sql_query.c_str());
                    //     // MYSQL_RES *result = mysql_store_result(mysql);

                    //     // if(MYSQL_ROW row = mysql_fetch_row(result)){
                    //     //     cout << row[0] <<endl;
                    //     //     if(pss)
                    //     //         pss->user_id = atoi(row[0]);
                    //     //     else
                    //     //         cout << "fuck" << endl;
                    //     // }

                    //     // users.insert(pair<string, string>(name, password));
                    //     // m_lock.unlock();

                    //     lws_serve_http_file(wsi, get_html_file_path("welcome.html"), "text/html", NULL, 0);}
                    // else{
                    //     printf("fff2\n");
                    //     lws_serve_http_file(wsi, get_html_file_path("logError.html"), "text/html", NULL, 0);}
                }else{
                    printf("fff333\n");
                    cout << old_case << " " << LOGIN_REQ << endl;
                    cout << old_case - LOGIN_REQ << endl;
                }
            }
            break;
            default:{
                lws_serve_http_file(wsi, get_html_file_path("test.html"), "text/html", NULL, 0);
            }
            break;
            }
        }
    }
    break;
    default:
        break;
    }

    return 0;
}

struct payload server_received_payload;

//ws服务端的ws(ws-protocol-example)协议的回调函数
static int callback_example_server(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len)
{
    /*获取客户端结构*/
    struct user_meta **ppss, *pss = (struct user_meta *)user;

    /*由vhost与protocol还原lws_protocol_vh_priv_zalloc申请的结构*/
    struct server_meta *vhd = (struct server_meta *)lws_protocol_vh_priv_get(lws_get_vhost(wsi), lws_get_protocol(wsi));
    int m;
    switch (reason)
    {
    /*初始化*/
    case LWS_CALLBACK_PROTOCOL_INIT:
    {
        cout << "LWS_CALLBACK_PROTOCOL_INIT" << endl;
        /*申请内存*/
        vhd = (struct server_meta *)lws_protocol_vh_priv_zalloc(lws_get_vhost(wsi), lws_get_protocol(wsi), sizeof(struct server_meta));
        vhd->protocol = lws_get_protocol(wsi);
        vhd->vhost = lws_get_vhost(wsi);
    }
    break;

    /*建立连接，将客户端放入客户端链表*/
    case LWS_CALLBACK_ESTABLISHED:
    {
        cout << "LWS_CALLBACK_ESTABLISHED" << endl;
        pss->wsi = wsi;
    }
    break;

    /*连接关闭*/
    case LWS_CALLBACK_CLOSED:
    {
        cout << "LWS_CALLBACK_CLOSED " << endl;
        long player_id = (long)pss;
        if(pss->msg_to_send){
            free(pss->msg_to_send);
        }
        if(pss->user_name){
            free(pss->user_name);
        }
        int game_id;
        if(playerid_to_gameid.find(player_id) != playerid_to_gameid.end()){
            game_id = playerid_to_gameid[player_id];
            playerid_to_gameid.erase(player_id);
        }else{
            cout << "Error in LWS_CALLBACK_CLOSED." << endl;
            return CHESS_ERROR;
        }

        if(gameid_to_game.find(game_id) != gameid_to_game.end()){
            Chess* game = gameid_to_game[game_id];
            if(game && game->player1_id != player_id && game->player2_id != player_id){
                cout << "Error in LWS_CALLBACK_CLOSED." << endl;
                return CHESS_ERROR;
            }

            if(game->player1_id == player_id){
                game->player1_id = -1;
                if(game->player2_id == -1){
                    // 房间销毁
                    if(game->life_time == 1){
                        game->life_time = 0;
                    }else{
                        free(game->desc);
                        free(game->title);
                        gameid_to_game.erase(game_id);
                        free(game);
                    }
                }else{
                    //通知另一个玩家
                    Document new_doc;
                    new_doc.SetObject();
                    new_doc.AddMember("type", (int)TYPE_ESCAPE, new_doc.GetAllocator());
                    send_document_to_player(new_doc, game->player2_id);
                }
            }else{
                game->player2_id = -1;
                if(game->player1_id == -1){
                    //房间销毁
                    if(game->life_time == 1){
                        game->life_time = 0;
                    }else{
                        free(game->desc);
                        free(game->title);
                        gameid_to_game.erase(game_id);
                        free(game);
                    }
                }else{
                    //通知另一个玩家
                    Document new_doc;
                    new_doc.SetObject();
                    new_doc.AddMember("type", (int)TYPE_ESCAPE, new_doc.GetAllocator());
                    send_document_to_player(new_doc, game->player1_id);
                }
            }
        }else{
            cout << "Error in LWS_CALLBACK_CLOSED." << endl;
            return CHESS_ERROR;
        }
    }
    break;

    /*客户端可写*/
    case LWS_CALLBACK_SERVER_WRITEABLE:
    {
        cout << "LWS_CALLBACK_SERVER_WRITEABLE" << endl;
        if (!pss->msg_to_send)
            break;
        if(pss) cout << "get" << endl;
    
        cout << pss->msg_len << endl;

        cout << "yes" << endl;
        /* notice we allowed for LWS_PRE in the payload already */
        m = lws_write(wsi, (unsigned char *)pss->msg_to_send + LWS_PRE, pss->msg_len,
                      LWS_WRITE_TEXT);
        if (m < pss->msg_len)
        {
            printf("ERROR %d writing to di socket\n", errno);
            return -1;
        }
    }
    break;

    /*从客户端收到数据*/
    case LWS_CALLBACK_RECEIVE:
    {
        cout << "LWS_CALLBACK_RECEIVE" << endl;

        if(len == 0) return -1;
        char* rec_buf = (char*)in;
        rec_buf[len] = '\0';

        if(in) cout << (char*)in << endl;

        cout << "xxx" << endl;
        Document document;
        document.Parse((char*)in);
        switch(document["type"].GetInt()){
            case TYPE_CREATE_ROOM:
            {
                const char* temp_title = document["title"].GetString();
                const char* temp_desc = document["desc"].GetString();
                const char* temp_username = document["username"].GetString();
                
                char* title = (char*)malloc(strlen(temp_title) + 1);
                char* desc = (char*)malloc(strlen(temp_desc) + 1);
                char* username = (char*)malloc(strlen(temp_username) + 1);
                memcpy(title, temp_title, strlen(temp_title));
                memcpy(desc, temp_desc, strlen(temp_desc));
                memcpy(username, temp_username, strlen(temp_username));
                title[strlen(temp_title)] = '\0';
                desc[strlen(temp_desc)] = '\0';
                username[strlen(temp_username)] = '\0';

                Chess* new_room = new Chess();
                new_room->title = title;
                new_room->desc = desc;
                if(pss) pss->user_name = username;
                else free(username);
                new_room->player1_id = (long)pss;
                new_room->player2_id = -1;
                playerid_to_gameid[(long)pss] = new_room->game_id;
                gameid_to_game[new_room->game_id] = new_room;
                cout << "创建了房间号为" << new_room->game_id << "的房间" << endl;
                Document new_doc;
                new_doc.SetObject();
                new_doc.AddMember("type", (int)TYPE_CREATE_ROOM, new_doc.GetAllocator());
                new_doc.AddMember("roomid", new_room->game_id, new_doc.GetAllocator());
                send_document_to_player(new_doc, (long)pss);

            }break;
            case TYPE_JOIN_ROOM:
            {
                if(pss && !pss->user_name){
                    const char* temp_username = document["username"].GetString();
                    char* username = (char*)malloc(strlen(temp_username) + 1);
                    memcpy(username, temp_username, strlen(temp_username));
                    username[strlen(temp_username)] = '\0';
                    pss->user_name = username;
                }
                
                int game_id = document["roomid"].GetInt();
                cout << "尝试加入房间号为" << game_id << "的房间" << endl;

                Chess* game = NULL;
                if(gameid_to_game.find(game_id) != gameid_to_game.end()){
                    game = gameid_to_game[game_id];
                    if      (game->player1_id == -1) game->player1_id = (long)pss;
                    else if (game->player2_id == -1) game->player2_id = (long)pss;
                    else    return -1;
                    playerid_to_gameid[(long)pss] = game_id;
                }else{
                    cout << "JOIN NULL ROOM" << endl;
                }

                if(game && game->player1_id != -1 && game->player2_id != -1){
                    cout << "SEND_ROOM" << endl;
                    Document new_doc;
                    new_doc.SetObject();
                    new_doc.AddMember("type", (int)TYPE_GAME_START, new_doc.GetAllocator());
                    user_meta* opponent = (user_meta*)get_oppenent_id((long)pss);

                    Value _temp_string;
                    new_doc.AddMember("opponentname", _temp_string.SetString(opponent->user_name, new_doc.GetAllocator()), new_doc.GetAllocator());

                    new_doc.AddMember("youfirst", true, new_doc.GetAllocator());
                    send_document_to_player(new_doc, (long)pss);

                    new_doc.RemoveMember("youfirst");
                    new_doc.RemoveMember("opponentname");
                    new_doc.AddMember("opponentname", _temp_string.SetString(pss->user_name, new_doc.GetAllocator()), new_doc.GetAllocator());
                    new_doc.AddMember("youfirst", false, new_doc.GetAllocator());
                    send_document_to_opponent(new_doc, (long)pss);
                }


            }break;
            case TYPE_GAME_START:
            {
                return -1;
            }break;
            case TYPE_MOVE:
            {
                int x = document["x"].GetInt();
                int y = document["y"].GetInt();
                Document new_doc;
                new_doc.SetObject();
                new_doc.AddMember("type", (int)TYPE_MOVE, new_doc.GetAllocator());
                new_doc.AddMember("x", x, new_doc.GetAllocator());
                new_doc.AddMember("y", y, new_doc.GetAllocator());
                send_document_to_opponent(new_doc, (long)pss);
            }break;
            case TYPE_ESCAPE:
            {
                Document new_doc;
                new_doc.SetObject();
                new_doc.AddMember("type", (int)TYPE_ESCAPE, new_doc.GetAllocator());
                send_document_to_opponent(new_doc, (long)pss);
            }break;
            case TYPE_ROOM:
            {
                cout << "TYPE_ROOM " << endl;
                Document new_doc;
                new_doc.SetObject();
                Document::AllocatorType& allocator = new_doc.GetAllocator();

                new_doc.AddMember("type", (int)TYPE_ROOM, allocator);

                Value room_array(kArrayType);
                bool has_room = false;
                cout << "目前存在的房间有" << endl;
                for(auto it : gameid_to_game){
                    
                    Chess* game = it.second;
                    cout << "房间:" << game->game_id << endl;
                    if(!game){
                        cout << "Roomlist error." << endl;
                        return -1;
                    }
                    has_room = true;
                    cout << "Has room." << endl;
                    Value room_object(kObjectType);
                    room_object.SetObject();
                    room_object.AddMember("roomid", game->game_id, allocator);

                    Value temp_string1;
                    room_object.AddMember("roomtitle", temp_string1.SetString(game->title, new_doc.GetAllocator()), new_doc.GetAllocator());
                    Value temp_string2;
                    room_object.AddMember("roomdesc", temp_string2.SetString(game->desc, new_doc.GetAllocator()), new_doc.GetAllocator());

                    room_array.PushBack(room_object, allocator);
                }
                new_doc.AddMember("roomlist", room_array, allocator);
                send_document_to_player(new_doc, (long)pss);
            }break;
            case TYPE_RESET_GAME:   //收到RESET消息, 向双方发送GAME_START消息
            {
                Document new_doc;
                new_doc.SetObject();
                new_doc.AddMember("type", (int)TYPE_GAME_START, new_doc.GetAllocator());
                user_meta* opponent = (user_meta*)get_oppenent_id((long)pss);

                if(!opponent || !pss) return CHESS_ERROR;

                Value _temp_string;
                new_doc.AddMember("opponentname", _temp_string.SetString(opponent->user_name, new_doc.GetAllocator()), new_doc.GetAllocator());

                new_doc.AddMember("youfirst", true, new_doc.GetAllocator());
                send_document_to_player(new_doc, (long)pss);

                new_doc.RemoveMember("youfirst");
                new_doc.RemoveMember("opponentname");
                new_doc.AddMember("opponentname", _temp_string.SetString(pss->user_name, new_doc.GetAllocator()), new_doc.GetAllocator());
                new_doc.AddMember("youfirst", false, new_doc.GetAllocator());
                send_document_to_opponent(new_doc, (long)pss);
            }break;
        }
    }break;
        // if (vhd->amsg.payload)
        //     __minimal_destroy_message(&vhd->amsg);

        // vhd->amsg.len = len;

        // /* notice we over-allocate by LWS_PRE */
        // vhd->amsg.payload = malloc(LWS_PRE + len);
        // if (!vhd->amsg.payload)
        // {
        //     printf("OOM: dropping\n");
        //     break;
        // }
        // memcpy((char *)vhd->amsg.payload + LWS_PRE, in, len);
        // vhd->current++;

        
        // cout << "receive type: " <<  << endl;
        // cout << "receive msg: " << string((char*)vhd->amsg.payload + LWS_PRE) << endl;
        // cout << "receive len: " << len << endl;

        // /*
        //  *遍历所有的客户端，将数据放入写入回调
        //  */
        // struct user_meta *pTemp = vhd->user_list;
        // while (pTemp)
        // {
        //     lws_callback_on_writable(pTemp->wsi);
        //     pTemp = pTemp->user_next;
        // }
        // break;
    }

    return 0;
}

//ws服务端在同一个端口支持2种协议,http和ws(具体是ws-protocol-example,实际上可以再多几个ws协议)
static struct lws_protocols server_protocols[] =
    {
        /* The first protocol must always be the HTTP handler */
        {
            "http-only",   /* name */
            callback_http, /* callback */
            0,             /* No per session data. */
            0,             /* max frame size / rx buffer */
        },
        {
            "ws-protocol-example",
            callback_example_server,
            sizeof(struct user_meta),
            EXAMPLE_RX_BUFFER_BYTES,
        },
        {NULL, NULL, 0, 0} /* terminator */
};

//s停止服务器
static int stop_server = 0;
int main_server()
{

    //创建数据库连接池
    //connPool = connection_pool::GetInstance();

    //connPool->init("localhost", "root", "root", "chessdb", 3306, 8);

    //initmysql_result(connPool);
    //cout << "users init:" << endl;
    // for(auto pa : users){
    //     cout << pa.first << ' ' << pa.second << endl;
    // }
    struct lws_context_creation_info info;
    memset(&info, 0, sizeof(info));

    info.port = 8000;                  //监听端口
    info.protocols = server_protocols; //支持哪些协议
    info.gid = -1;
    info.uid = -1;

    struct lws_context *context = lws_create_context(&info);
    printf("websockets server starts at %d \n", info.port);
    while (stop_server == 0)
    {
        lws_service(context, /* timeout_ms = */ 1000000);
    }

    lws_context_destroy(context);

    return 0;
}

int main(int argc, char *argv[])
{
    main_server();
}