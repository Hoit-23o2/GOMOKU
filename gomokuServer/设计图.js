/* 
    {
        Type: 0
        Title: "dddd"
        Desc: "xxx"
        Username: "xxx"
    }
return:
    {
        Type: 0
        roomid: x
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
        Type: 2
        Opponentname: "xx"
        Youfirst:  true or false
    }
*/
const GAME_START = 2;

/* 
    {
        Type: 3
        X: x
        Y: y
    }
*/
const TYPE_MOVE = 3;   


/* 
    {
        Type: 4
    }
*/
const TYPE_ESCAPE = 4;          

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
const TYPE_ROOM = 5;

/* 
    {
        Type: 6
    }
*/
const RESET_GAME = 6;

function APICreate(type, content) {
    
}