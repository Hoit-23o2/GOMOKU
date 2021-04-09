#ifndef CHESS_H
#define CHESS_H

#include <map>
#include "../server.h"

#define CHESS_ERROR -1
#define CHESS_NONE 0

using namespace std;

class Chess
{
    static int global_game_id;
public:
    Chess();

    long player1_id;
    long player2_id;
    int game_id;
    int life_time;
    
    char* title;
    char* desc;
};

int add_player_to_new_room(long player_id);
int add_player_to_old_room(long player_id, int game_id);
long get_oppenent_id(long player_id);
int player_quit(long player_id);
extern map<long, int> playerid_to_gameid;
extern map<int, Chess*> gameid_to_game;

#endif // !CHESS_H