import React from 'react'
import BaseLayout from '../components/BaseLayout'
import Board from '../components/Board'
import Card from '../components/Card'
import * as FaIcons from 'react-icons/fa'
import "./Me.css"
import { GetItem } from './utils/LocalIO'

const ITEM_ISLOGIN = 'islogin';
const ITEM_USERNAME = 'username';
function generateRandomState(rowCount, colCount){
    const initState = [];
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if(Math.random() > 0.7){
                var index = rowCount * i + j;
                initState.push(index % 2 === 0 ? 'w' : 'b');
            }
            else {
                initState.push(null);
            }
        }
    }
    return initState;
}

function Me() {
    const initStatu = generateRandomState(6, 6);
    var username = "未登录";
    var winRate = "-%";
    var totCompetitions = "-";
    var isLogin = GetItem(ITEM_ISLOGIN);
    console.log(isLogin);
    console.log(isLogin === true);
    if(isLogin === "true"){
        username = GetItem(ITEM_USERNAME);
        winRate = "90%";
        totCompetitions = "190";
    }
    return (
        <BaseLayout span={6} offset={3}>
            <Card>
                <div className="me-container">
                    <div className="me-info">
                        <div className="me-avatar">
                            <FaIcons.FaUserAlt/>
                        </div>
                        <div className="me-username">
                            {username}
                        </div>
                        <div className="me-game-record-container">
                            <div style={{fontWeight: `bold`}}>
                                比赛胜率: {winRate}
                            </div>
                            <div style={{fontWeight: `bold`}}> 
                                比赛总数: {totCompetitions}
                            </div>
                        </div>
                    </div>
                    <Board 
                        rowCount = {6}
                        colCount = {6}
                        colorState = {initStatu}
                        clickFn = {(i, clickFrom) => {return;}}
                    />
                </div>
            </Card>
        </BaseLayout>
    )
}

export default Me