import React from 'react'
import Card from '../components/Card'
import BaseLayout from '../components/BaseLayout'
import {Form, Button, Container, Col, Row} from 'react-bootstrap'

import "./Login.css"
import * as LocalIO from './utils/LocalIO'
import { withRouter } from 'react-router'

const TIP_LOGIN = "登 录";
const TIP_REGISTER = "注 册";

class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            remember: false,
        };
        setTimeout(() => {
            var username = LocalIO.GetItem(LocalIO.KEY_USERNAME);
            var password = LocalIO.GetItem(LocalIO.KEY_PASSWORD);
            if(username != null){
                this.setState({
                    username: username,
                })
            };
            if(password != null){
                this.setState({
                    password: password,
                })
            };
        }, 100);
    }
    mySubmitHandler = (event) => {
        console.log(event);
        event.preventDefault();
        var isRegister = event.nativeEvent.submitter.className === "btn btn-outline-warning" ? true : false;
        var username = this.state.username;
        var password = this.state.password;
        var remember = this.state.remember;
        if(username != null && password != null){
            if(remember) {
                LocalIO.SetItem(LocalIO.KEY_PASSWORD, password);
            }
            else {
                LocalIO.RemoveItem(LocalIO.KEY_PASSWORD);
            }
            LocalIO.SetItem(LocalIO.KEY_USERNAME, username);
            LocalIO.SetItem(LocalIO.KEY_ISLOGIN, true);
        }
        else {
            alert('信息不完整');
            return;
        }
        if(isRegister){
            // 处理注册
        }
        else {
            // 处理登录
        }

        this.props.history.replace({pathname: '/'});
    }
    render(){
        return (
            <BaseLayout span={6} offset={3}>
                <Card>
                    <Form className="form" onSubmit={this.mySubmitHandler} >
                        <Form.Group controlId="formBasicUserName">
                            <Form.Label>用户名</Form.Label>
                            <Form.Control 
                                        type="plaintext" 
                                        placeholder="用户名" 
                                        onChange={(e) => {
                                            this.setState({
                                                username: e.target.value
                                            });
                                        }}/>
                        </Form.Group>
    
                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>密 码</Form.Label>
                            <Form.Control 
                                        type="password" 
                                        placeholder="密 码"
                                        onChange={(e) => {
                                            this.setState({
                                                password: e.target.value
                                            });
                                        }} />
                            <Form.Text className="text-muted">
                                我们绝不会对外泄漏您的隐私
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group controlId="formBasicCheckbox">
                            <Form.Check 
                                        type="checkbox" 
                                        label="记住我" 
                                        onClick={(e) => {
                                            console.log(e.target.checked);
                                            this.setState({
                                                remember: e.target.checked
                                            })
                                        }}/>
                        </Form.Group>
                        <Container>
                            <Row>
                                <Col>
                                    <Button style={{fontWeight: `bold`, width: `100%`}} variant="warning" type="submit">
                                        登 录
                                    </Button>
                                </Col>
                                <Col>
                                    <Button style={{fontWeight: `bold`, width: `100%`}} variant="outline-warning" type="submit">
                                        注 册
                                    </Button>
                                </Col>
                            </Row>
                        </Container>
                    </Form>
                </Card>
            </BaseLayout>
        )
    }
    
}

export default withRouter(Login)
