import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'

/**
 *
 *
 * @class BaseLayout
 * @extends {React.Component}
 * 
 * 中心布局
 */
class BaseLayout extends React.Component {
    render(){
        return (
            <Container>
                    <Row>
                        <Col
                            xs={12}
                            sm={12}
                            md={12} 
                            lg={{span: this.props.span, offset: this.props.offset}}>
                            {this.props.children}
                        </Col>
                    </Row>
            </Container>
        )
    } 
}
export default BaseLayout
