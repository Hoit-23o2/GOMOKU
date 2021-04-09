import React, { Component } from 'react'
import Board from '../components/Board';
import Card from '../components/Card';
import * as FaIcons from 'react-icons/fa' 


import "./Game.css"
import AIEngine from './utils/AIEngine';
import BaseLayout from '../components/BaseLayout';
import * as LocalIO from './utils/LocalIO';
import {withRouter} from 'react-router-dom';
import * as API from './utils/API'

/* 提示类型 */
const TIP_MODE_WIN = 1;
const TIP_MODE_DESC = 2;

/* 胜利状态 */
const WIN_WHITE = 'white_win';                /* 白棋赢了 */
const WIN_BLACK = 'black_win';                /* 黑棋赢了 */
const WIN_DRAW = 'draw_win';                  /* 平局 */
const WIN_NOBODY = 'nobody_win'               /* 暂时没有人胜利 */

/* 身份标识 */
const ME = '我';
const OPPONENT = '对手';

/* 游戏模式 */
const GAME_MODE_SINGLE = "single";
const GAME_MODE_MULTI = "multi"; 


function DevideIndex(index, rowCount) {
    return [Math.trunc(index /rowCount), index % rowCount]; 
}

function ComposeIndex(x, y, rowCount) {
    return x * rowCount + y;
}

/* i = 0, i = 1 ... */
function JudgeIfWin(rowCount, colCount, colorState, index) {
    var lines = ['', '', '', ''];               
    
    var [curi, curj] = DevideIndex(index, rowCount);
    var curColor = colorState[index];
    console.log(curi);
    console.log(curj);
    var remainCount = rowCount * colCount;
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            var piece = colorState[i * rowCount + j];
            if(i === curi) {
                lines[0] += piece;
            }        
            if(j === curj){
                lines[1] += piece;
            }
            if((j === curj && i === curi) || (j - curj) / (i - curi) === 1){
                lines[2] += piece;
            }
            if((j === curj && i === curi) || (j - curj) / (i - curi) === -1){
                lines[3] += piece;
            }
            if(piece != null)
                remainCount--;
        }
    }
    if(remainCount === 0){
        return WIN_DRAW;
    }
    console.log(lines);
    var judge = curColor === 'w' ? 'wwwww' : 'bbbbb';
    for(var i = 0; i < lines.length; i++){
        if(lines[i].indexOf(judge) >=0){
            return curColor === 'w' ? WIN_WHITE : WIN_BLACK; 
        }
    }
    return WIN_NOBODY;
}

class Game extends Component {
    constructor(props){
        super(props);
        /* 获取参数 */
        var mode = this.props.match.params.mode;
        this.targetRoomId = this.props.match.params.targetRoomId;
        console.log(mode);
        console.log(this.targetRoomId);
        /* 初始化棋盘，游戏模式 */
        this.gameMode = mode;
        this.rowCount = 10;
        this.colCount = 10;
        this.initState = Array(this.rowCount * this.colCount).fill(null);
        
        /* 获取用户名 */
        this.myName = LocalIO.GetItem(LocalIO.KEY_USERNAME);
        /* 单人模式 */
        if(mode === GAME_MODE_SINGLE || this.targetRoomId === '127.0.0.1'){
            this.webSocket = null;
            this.whosFirst = ME;
            this.opponentName = "HoitAI";
            this.opponentAvatar = <FaIcons.FaRobot/>;
            this.isGameStart = true;    
        }
        /* 多人模式 */
        else if(mode === GAME_MODE_MULTI) {
            // this.whosFirst = (ip) , if ip == myIp , then me first
            // 在这里注册监听动作函数
            // = new WebSocket('ws://localhost:8080');
            
            this.opponentName = "未连接";
            this.opponentAvatar = <FaIcons.FaUserAlt/>;
            /* 检查是否登录 */
            if(LocalIO.GetItem(LocalIO.KEY_USERNAME) == null 
            || LocalIO.GetItem(LocalIO.KEY_PASSWORD) == null){
                alert("请先登录");
                this.props.history.goBack();
            }
            /* 建立socket连接 */
            else {
                try {
                    var targetDomain = API.SERVER_DOMAIN;
                    var targetPort = API.SERVER_PORT;
                    this.webSocket = new WebSocket("ws://" + targetDomain + ':' + targetPort, "ws-protocol-example");
                    this.webSocket.onopen = this.onWebSocketOpen;
                    this.webSocket.onclose = this.onWebSocketClose;
                    this.webSocket.onmessage = (msg) => this.onWebSocketMessage(msg);
                } catch (error) {
                    console.log(error);
                    this.webSocket = null;
                    alert("无法连接服务器");   
                }
                /* 等待 Game Start 包 */
                this.isGameStart = false;
                this.whosFirst = "未开始";

                if(this.targetRoomId){                      /* -1 代表创建房间 */
                    /* Do Nothing */
                }
                this.targetRoomId = parseInt(this.targetRoomId, 10);
                var api = API.APICreate(API.TYPE_JOIN_ROOM, {
                    roomid: this.targetRoomId,
                    username: this.myName
                });
                API.SendMsg(this.webSocket, api, () => {});
                // setTimeout(() => {
                //     console.log(api);
                //     this.webSocket.send(api);
                // }, 1000);
            }   
           
        }

        this.myColor = this.whosFirst === ME ? 'w' : 'b'; 
        this.opponentColor = this.myColor === 'b' ? 'w' : 'b'; 
        
        const tips = this.generateTips(TIP_MODE_DESC, this.whosFirst);
        this.state = {
            colorState: this.initState,
            whosRound: this.whosFirst,
            winState: WIN_NOBODY,
            tips: tips,
            myName: this.myName,
            opponentName: this.opponentName
        };
    }

    onWebSocketOpen(){
        console.log("web socket init");
         /* 发送JoinRoom请求 */
         
    }

    onWebSocketClose(){
        console.log("web socket close");
        alert("连接中断，游戏结束");
    }

    

    onWebSocketMessage(msg){
        msg = msg.data;  
        var [msgType, msgInfo] = API.ParseMsg(msg);
        switch (msgType) {
            case API.MSG_TYPE_MOVE_INFO:{
                var x = msgInfo.x;
                var y = msgInfo.y;
                console.log(x);
                console.log(y);
                var index = ComposeIndex(x, y, this.rowCount);
                this.handleClick(index, OPPONENT);
                break;
            }
            case API.MSG_TYPE_ESCAPE:{
                alert("对手逃跑了");
                console.log(msg);
                this.isGameStart = false;
                this.opponentName = "未连接";
                this.whosFirst = "未开始";
                this.gameReset();
                break;
            }
            case API.MSG_GAME_START: {
                this.opponentName = msgInfo.opponentname;
                this.whosFirst = msgInfo.youfirst === true ? ME : OPPONENT;
                this.isGameStart = true;
                console.log(this.opponentName);
                this.gameReset();
            }
            default:
                break;
        }
    }



    generateTips(mode, participants){
        if(mode === TIP_MODE_WIN){
            if(participants == null)
                return "平局";
            return participants + "胜利🏆";
        }
        else if(mode === TIP_MODE_DESC){
            return participants + "的回合";
        }
    }

    gameReset(){
        const tips = this.generateTips(TIP_MODE_DESC, this.whosFirst);
        this.setState({
            colorState: this.initState,
            whosRound:  this.whosFirst,
            winState: WIN_NOBODY,
            tips: tips, 
            myName: this.myName,
            opponentName: this.opponentName
        });
        this.myColor = this.whosFirst === ME ? 'w' : 'b'; 
        this.opponentColor = this.myColor === 'b' ? 'w' : 'b'; 

        console.log(this.state.whosRound);
    }

    /**
     * 
     * @param {WebSocket} ws 
     */
    escapeGame(ws) {
        console.log(ws);
        ws?.close();
    }

    handleClick(i, clickFrom){
        const whosRound = this.state.whosRound;
        const colorState = this.state.colorState.slice();
        console.log(clickFrom)
        console.log(whosRound);

        /* 游戏未开始 或 玩家已离线 */
        if(!this.isGameStart){
            alert("暂无对手!");
            return;
        }
        /* 或赢、或输、或平局，都重启一局 */
        if(this.state.winState !== WIN_NOBODY){
            this.gameReset();
            return;
        }
        /* 判断当前回合是否是自己的回合，若不是，则此次点击无效，状态保持不变 */
        if(clickFrom !== whosRound){
            return;
        }

        /* 不得在同一个地方反复落子 */
        if(colorState[i] !== 'w' && colorState[i] !== 'b'){
            if(whosRound === ME){
                colorState[i] = this.myColor;
            }
            else {
                colorState[i] = this.opponentColor;
            }
            console.log(colorState);
            /* 判断是否胜利 */
            var winState = JudgeIfWin(this.rowCount, this.colCount, colorState, i);
            var whosNext = whosRound === ME ?  OPPONENT : ME;
            var tips = "";
            /* 胜利或平局 */
            if(winState !== WIN_NOBODY){
                var participants = WIN_BLACK;
                if(winState === WIN_BLACK){
                    participants = this.myColor === 'b' ? ME : OPPONENT;
                }
                else if(winState === WIN_WHITE){
                    participants = this.myColor === 'b' ? OPPONENT : ME;
                }
                else {
                    participants = null;
                }
                tips = this.generateTips(TIP_MODE_WIN, participants);
            }
            /* 还未决出胜负 */
            else {
                tips = this.generateTips(TIP_MODE_DESC, whosNext);
                console.log(tips);
            }

            
            this.setState({
                colorState : colorState, 
                whosRound : whosNext,
                winState: winState,
                tips: tips,
                myName: this.myName,
                opponentName: this.opponentName
            }, () => {
                if(this.gameMode === GAME_MODE_SINGLE){
                    var nextStep = AIEngine(this.state.colorState);
                    if(winState === WIN_NOBODY){
                        this.handleClick(nextStep, OPPONENT);
                    }
                }
                if(this.gameMode === GAME_MODE_MULTI){
                    if(clickFrom !== OPPONENT){
                        /* 发送坐标 */
                        var [x, y] = DevideIndex(i, this.rowCount);
                        var api = API.APICreate(API.TYPE_MOVE_INFO, {
                            x: x,
                            y: y
                        });
                        this.webSocket?.send(api);
                    }
                    if(winState !== WIN_NOBODY){
                        setTimeout(() => { 
                            /* 发送重启游戏API */
                            var api = API.APICreate(API.TYPE_RESET_GAME, {});
                            this.webSocket?.send(api)
                        }, 2000);
                    }
                    
                }
            });
        }   
    }
    render() {
        return (
            <BaseLayout span={6} offset={3}>
                <Card showBackArrow={true} backArrowClick={this.escapeGame} params={this.webSocket}>
                    <div className="game-tips">
                        {this.state.tips}
                    </div>
                    <div className="game-player-container">
                        <div></div>
                        <div className="player-info-container">
                            <div className="game-player-name">
                                {this.state.opponentName}
                            </div>
                            <div className="game-player-avatar">
                                {this.opponentAvatar}
                            </div>
                        </div>
                        
                    </div>
                    <Board 
                        rowCount={this.rowCount}
                        colCount={this.colCount}
                        colorState={this.state.colorState}
                        clickFn={(i, clickFrom) => this.handleClick(i, clickFrom)}
                    />
                    <div className="game-player-container">
                        <div className="player-info-container">
                            <div className="game-player-avatar">
                                <FaIcons.FaUserAlt/>
                            </div>
                            <div className="game-player-name">
                                {this.state.myName}
                            </div>
                        </div>
                    </div>
                </Card>
            </BaseLayout>
        )
    }
}

export default withRouter(Game);