import React from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import Card from '../components/Card'
import * as FaUserAlt from 'react-icons/fa'
import Board from '../components/Board'
import { Link } from 'react-router-dom'
import * as API from './utils/API'

import "./Home.css"

class Home extends React.Component {
    
    constructor(props){
        super(props);

        API.APICreate(API.TYPE_MOVE_INFO, {x: 1, y: 2});

        this.rowCount = 6;
        this.colCount = 6;
        const initState = this.generateRandomState();
        console.log(initState);
        this.state = {
            initState: initState
        }
        setInterval(() => {
            const initState = this.generateRandomState();
            this.setState({
                initState: initState
            })
        }, 5000);
    }

    generateRandomState(){
        const initState = [];
        for (let i = 0; i < this.rowCount; i++) {
            for (let j = 0; j < this.colCount; j++) {
                if(Math.random() > 0.7){
                    var index = this.rowCount * i + j;
                    initState.push(index % 2 === 0 ? 'w' : 'b');
                }
                else {
                    initState.push(null);
                }
            }
        }
        return initState;
    }
    render(){

        return (
            <div className="home-container">
                <Container>
                    <Row>
                        <Col
                            xs={12}
                            sm={12}
                            md={12} 
                            lg={{span: 4, offset: 1}}>
                            <Card showBackArrow={false}>
                                <div className="game-option-container">
                                    <Link to="/Game/single/127.0.0.1">
                                        <div className="game-option-title">
                                            单 人 游 戏
                                        </div>
                                        <div className="game-option-logo">
                                            <FaUserAlt.FaUserAlt />
                                        </div>
                                    </Link>
                                    <Board 
                                        rowCount = {this.rowCount}
                                        colCount = {this.rowCount}
                                        colorState = {this.state.initState}
                                        clickFn = {(i, clickFrom) => {return;}}
                                    /> 
                                </div>   
                            </Card>
                        </Col>
                        <Col
                            xs={12}
                            sm={12} 
                            md={12} 
                            lg={{span: 4, offset: 2}}>
                            <Card style="{padding: 0}" showBackArrow={false}>
                                <div className="game-option-container">
                                    <Link to="/Room">
                                        <div className="game-option-title">
                                            多 人 游 戏
                                        </div>
                                        
                                        <div className="game-option-logo">
                                            <FaUserAlt.FaUserFriends />
                                        </div>
                                    </Link>
                                    <Board 
                                        rowCount = {this.rowCount}
                                        colCount = {this.rowCount}
                                        colorState = {this.state.initState}
                                        clickFn = {(i, clickFrom) => {return;}}
                                    />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            
        )
    }
    
}

export default Home
