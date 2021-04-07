const SERVER_DOMAIN = "172.20.10.10";
const SERVER_PORT = "8000"

/* 
    {
        Type: 0
        Title: "dddd"
        Desc: "xxx"
        Username: "xxx"
    }
*/
const TYPE_CREATE_ROOM = 0;

/* 
    {
        Type: 1    
        RoomId: xx
        Username: "xx"
    }
*/
const TYPE_JOIN_ROOM = 1;

/* 
    {
        Type: 3
        X: x
        Y: y
    }
*/
const TYPE_MOVE_INFO = 3;
/* 
    {
        Type: 4
    }
*/
const TYPE_ESCAPE = 4;          

const TYPE_ROOM = 5;
/* 
    {
        Type: 6
    }
*/
const TYPE_RESET_GAME = 6;



function APICreate(type, jsonContent) {
    var api = {};
    switch (type) {
        case TYPE_MOVE_INFO:{
            api.type = type;
            api.x = jsonContent.x;
            api.y = jsonContent.y;
            break;
        }
        case TYPE_CREATE_ROOM:{
            api.type = type;
            api.title = jsonContent.title;
            api.desc = jsonContent.desc;
            api.username = jsonContent.username;
            break;
        }
        case TYPE_JOIN_ROOM:{
            api.type = type;
            api.roomid = jsonContent.roomid;
            api.username = jsonContent.username;
            break;
        }
        case TYPE_ROOM: {
            api.type = type;
            break;
        }
        case TYPE_RESET_GAME:{
            api.type = type;
            break;
        }
        case TYPE_ESCAPE:{
            api.type = type;
            break;
        }
        default:
            break;
    }

    return JSON.stringify(api);
}

/* 信息 */

/* 
    {
        Type: 3
        X: x
        Y: y
    }
*/
const MSG_TYPE_MOVE_INFO = 3;

/* 
    {
        Type: 4
    }
*/
const MSG_TYPE_ESCAPE = 4;
/* 
    {
        Type: 2
    }
*/
const MSG_GAME_START = 2;
/* 
    {
        Type: 5
        RoomList: {
            {
                RoomId:
                RoomTitle:
                RoomDesc:
                
            },
            {

            }
        }
    }
*/
const MSG_TYPE_ROOM = 5;
/* 
    {
        Type: 0
        RoomId: xx
    }
*/
const MSG_TYPE_ROOM_CREATED = 0;

/**
 * 
 * @param {String} msg 
 * @returns [msgType, msgInfo]
 */
function ParseMsg(msg){
    var msgJson = JSON.parse(msg);
    var msgType = msgJson.type;
    var msgInfo = msgJson;
    return [msgType, msgInfo];
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {String} message 
 * @param {Function} callback 
 */
function SendMsg(ws, message, callback) {
    console.log(ws);
    WaitForConnection(ws, function () {
        ws.send(message);
        if (callback) {
          callback();
        }
    }, 1000);
};

function WaitForConnection(ws, callback, interval) {
    console.log(ws.readyState);
    if (ws.readyState === 1) {
        callback();
    } else {
        // optional: implement backoff for interval here
        setTimeout(function () {
            WaitForConnection(ws, callback, interval);
        }, interval);
    }
};
export {
    SERVER_DOMAIN,
    SERVER_PORT,

    TYPE_CREATE_ROOM,
    TYPE_JOIN_ROOM,
    TYPE_MOVE_INFO,
    TYPE_ESCAPE,
    TYPE_RESET_GAME,
    APICreate,

    MSG_GAME_START,
    MSG_TYPE_MOVE_INFO,
    MSG_TYPE_ROOM,
    MSG_TYPE_ESCAPE,
    MSG_TYPE_ROOM_CREATED,
    ParseMsg,

    SendMsg
}