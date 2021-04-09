import React, { useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import BaseLayout from '../components/BaseLayout'
import Board from '../components/Board'
import Card from '../components/Card'
import {FakeRooms} from './FakeRooms'

import { Button, Modal, Form, Row, Col, Container } from 'react-bootstrap'

import "./Room.css"
import * as API from './utils/API'
import * as LocalIO from './utils/LocalIO'

function RoomInfoModal(props) {
    var [roomTitle, setRoomTitle] = useState("");
    var [roomDesc, setRoomDesc] = useState("");
    
    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            创 建 房 间
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form className="form">
                <Form.Group className="form-group">
                    <Form.Control 
                        type="plaintext" 
                        placeholder="房 间 名" 
                        onChange={(e) => {
                            setRoomTitle(e);
                        }}/>
                </Form.Group >

                <Form.Group  className="form-group">
                    <Form.Control 
                        type="plaintext" 
                        placeholder="描 述"
                        onChange={(e) => {
                            setRoomDesc(e);
                        }} />
                </Form.Group >
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Container>
                <Row>
                    <Col>
                        <Button style={{fontWeight: `bold`, width: `100%`}} 
                                variant="warning" 
                                onClick={() => {
                                console.log(roomTitle);
                                if(LocalIO.GetItem(LocalIO.KEY_USERNAME) == null 
                                || LocalIO.GetItem(LocalIO.KEY_PASSWORD) == null){
                                    alert("请先登录");
                                    return;
                                }
                                
                                var username = LocalIO.GetItem(LocalIO.KEY_USERNAME);

                                if(roomTitle === "" 
                                || roomTitle.nativeEvent.data.length === 0){
                                    alert("请填写房间标题");
                                    return;
                                }

                                if(roomDesc === "" 
                                || roomDesc.nativeEvent.data.length === 0){
                                    alert("请填写房间描述");
                                    return;
                                }

                                var api = API.APICreate(API.TYPE_CREATE_ROOM, {
                                    title: roomTitle.nativeEvent.data,
                                    desc: roomDesc.nativeEvent.data,
                                    username: username
                                });
                                API.SendMsg(props.webSocket, api, () => {});
                        }}>
                            创 建
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={props.onHide} 
                                style={{fontWeight: `bold`, width: `100%`}} 
                                variant="outline-warning" >
                            取 消
                        </Button>
                    </Col>
                </Row>
            </Container>
        </Modal.Footer>
      </Modal>
    );
}

class Room extends React.Component {
    constructor(props) {
        super(props);
        var targetDomain = API.SERVER_DOMAIN;
        var targetPort = API.SERVER_PORT;
        this.webSocket = new WebSocket("ws://" + targetDomain + ':' + targetPort, "ws-protocol-example");
        this.webSocket.onopen = this.onWebSocketOpen(this.webSocket);
        this.webSocket.onclose = this.onWebSocketClose;
        this.webSocket.onmessage = (msg) => this.onWebSocketMessage(this.webSocket, msg);
        this.createRoom = this.createRoom.bind(this);


        this.state = {
            roomList: [],
            modalShow: false
        };
    }
    setModalShow(){
        if(this.state.modalShow)
            this.setState({
                modalShow: false
            });
        else
            this.setState({
                modalShow: true
            });
    }
    onWebSocketClose(){
        console.log("wocket close");
    }

    onWebSocketOpen(ws){
        console.log("web socket open")
        var api = API.APICreate(API.MSG_TYPE_ROOM, {});
        /* 第一次请求 */
        API.SendMsg(ws, api, () => {});         
        /* 更新请求 */
        setInterval(() => {
            API.SendMsg(ws, api, () => {});
        }, 10000);
    }

    onWebSocketMessage(ws, msg){
        console.log(ws);
        console.log(msg);
        msg = msg.data;  
        console.log(msg);
        var [msgType, msgInfo] = API.ParseMsg(msg);
        if(msgType === API.MSG_TYPE_ROOM) {
            var roomList = msgInfo.roomlist;
            console.log(roomList);
            this.setState({
                roomList: roomList
            });
        }
        else if(msgType === API.MSG_TYPE_ROOM_CREATED){
            var roomid = msgInfo.roomid;
            ws.close();
            this.props.history.push({pathname: '/Game/multi/' + roomid});
        }
    }

    createRoom(){
        /* 创建房间请求 */
        this.setModalShow();
    }


    render() {
        return (
            <>
                <BaseLayout span={10} offset={1}>
                    <Card showBackArrow={true}>
                        <div className="scroll-view">
                            {
                                this.state.roomList.map((room, index) => {
                                    var colorState = [];
                                    var rowCount = 2;
                                    var colCount = 2;
                                    for(var i = 0; i < rowCount * colCount; i++){
                                        if(Math.random() > 0.5){
                                            colorState.push(i % 2 === 0 ? 'w' : 'b');
                                        }
                                        else {
                                            colorState.push(null);
                                        }
                                    }
                                    var targetPath = "/Game/multi/" + room.roomid;
                                    return (
                                        <Link to={targetPath} className="scroll-item-outer">
                                            <div key={index} className="scroll-item">
                                                <div className="room-header-wrapper">
                                                    {room.icon}
                                                    <div className="room-title">
                                                        {room.roomtitle}
                                                    </div>
                                                </div>
                                                
                                                <div className="room-body">{room.roomdesc}</div>
                                                <div className="room-footer">
                                                    <div>
                                                        <Board 
                                                            rowCount = {2}
                                                            colCount = {2}
                                                            colorState = {colorState}
                                                            clickFn = {(i, clickFrom) => {return;}}
                                                        />
                                                    </div>
                                                    <div>
                                                        房间号: {room.roomid}
                                                    </div>
                                                </div>
                                            </div>   
                                        </Link>
                                    )
                                })
                            }
                        </div>
                        <Button 
                            style={{marginTop: `20px`, width:`70%` }} 
                            variant="warning" 
                            onClick={this.createRoom}>
                            <div style={{fontWeight:`bold`, color: `var(--font-light-color)`}}>
                                创 建 房 间
                            </div>
                        </Button>
                    </Card>

                    <RoomInfoModal
                        webSocket={this.webSocket}
                        show={this.state.modalShow}
                        onHide={() => this.setModalShow(false)}
                    />
                </BaseLayout>
            </>
        )
    }
}

export default withRouter(Room) 
