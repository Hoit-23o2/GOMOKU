#ifndef SERVER_H
#define SERVER_H

#include <libwebsockets.h>
#include <string.h>
#include <stdio.h>
#include <iostream>
//#include "sql_connection/sql_connection_pool.h"
#include "chess/chess.h"


#define REGISTER_PAGE   '0'
#define REGISTER_REQ    '5'
#define LOGIN_PAGE      '1'
#define LOGIN_REQ       '6'
#define CRATE_ROOM      '2'
#define CHECK_ROOM      '3'
#define JOIN_ROOM       '4'

struct msg
{
    /*内存地址*/
    void *payload;

    /*大小*/
    size_t len;
};

struct server_meta
{
    /*服务器，可由vhost与protocol获取该结构体*/
    struct lws_vhost *vhost;

    /*使用的协议*/
    const struct lws_protocols *protocol;

    /*客户端链表*/
    struct user_meta *user_list;

    /*接收到的消息，缓存大小为一条数据*/
    struct msg amsg;

    /*当前消息编号，用来同步所有客户端的消息*/
    int current;
};

typedef struct user_meta
{
    /*客户端连接句柄*/
    struct lws *wsi;

    char*   msg_to_send;
    int     msg_len;
    
    char*   user_name;
} user_meta;

#define EXAMPLE_RX_BUFFER_BYTES (256)
//定义的一个payload结构,用于存储ws发送和接收的数据
struct payload
{
    unsigned char data[LWS_SEND_BUFFER_PRE_PADDING + EXAMPLE_RX_BUFFER_BYTES + LWS_SEND_BUFFER_POST_PADDING];
    size_t len;
};

enum msg_type {
    TYPE_CREATE_ROOM = 0,
    TYPE_JOIN_ROOM,
    TYPE_GAME_START,
    TYPE_MOVE,
    TYPE_ESCAPE,
    TYPE_ROOM,
    TYPE_RESET_GAME
 };


#endif