#include <string.h>
#include <time.h>
#include <sys/time.h>
#include <stdarg.h>
#include "chess.h"
#include <pthread.h>

map<long, int> playerid_to_gameid;
map<int, Chess*> gameid_to_game;

using namespace std;

int Chess::global_game_id = 0;

Chess::Chess(){
    game_id = Chess::global_game_id++;
    player1_id = -1;
    player2_id = -1;
    life_time = 1;
}

int add_player_to_new_room(long player_id){
    Chess* new_chess = new Chess();
    if(!new_chess){
        return CHESS_ERROR;
    }
    new_chess->player1_id = player_id;

    playerid_to_gameid[player_id] = new_chess->game_id;
    gameid_to_game[new_chess->game_id] = new_chess;
    return new_chess->game_id;
}

int add_player_to_old_room(long player_id, int game_id){
    if(gameid_to_game.count(game_id) == 0){
        return CHESS_ERROR;
    }

    playerid_to_gameid[player_id] = game_id;
    auto it = gameid_to_game.find(game_id);
    Chess* chess_game = it->second;

    if(chess_game->player2_id != -1 && chess_game->player1_id != -1){
        return CHESS_ERROR;
    }
    if(chess_game->player1_id == -1){
        chess_game->player1_id = player_id;
    }else if(chess_game->player2_id == -1){
        chess_game->player2_id = player_id;
    }else{
        return CHESS_ERROR;
    }

    return CHESS_NONE;
}

long get_oppenent_id(long player_id){
    if(playerid_to_gameid.find(player_id) == playerid_to_gameid.end()){
        cout << "Get move msg, but dont have game_id in dict." << endl;
        return -1;
    }
    int game_id = playerid_to_gameid[player_id];
    if(gameid_to_game.find(game_id) == gameid_to_game.end()){
        cout << "Get move msg and game_id, but dont have game in dict." << endl;
        return -1;
    }
    Chess* game = gameid_to_game[game_id];
    if(!game || (game->player1_id != player_id && game->player2_id != player_id)){
        cout << "Error in get_opponent_id." << endl;
        return -1;
    }
    long opponent_id;
    if(game->player1_id != player_id){
        opponent_id = game->player1_id;
    }else{
        opponent_id = game->player2_id;
    }
    return opponent_id;
}

int player_quit(long player_id){
    if(playerid_to_gameid.count(player_id) == 0){
        return CHESS_ERROR;
    }
    auto it = playerid_to_gameid.find(player_id);
    int game_id = it->second;
    if(gameid_to_game.count(game_id) == 0){
        return CHESS_ERROR;
    }
    auto it2 = gameid_to_game.find(game_id);
    Chess* chess_game = it2->second;

    if(player_id == chess_game->player1_id){
        chess_game->player1_id = -1;
    }else if(player_id == chess_game->player2_id){
        chess_game->player2_id = -1;
    }else{
        return CHESS_ERROR;
    }

    if(chess_game->player1_id == -1 && chess_game->player2_id == -1){
        delete chess_game;
        gameid_to_game.erase(game_id);
    }
    playerid_to_gameid.erase(player_id);
    return CHESS_NONE;
}

