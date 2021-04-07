import React, {useState} from 'react'
import * as FaIcons from "react-icons/fa"
import * as AiIcons from "react-icons/ai"
import { Link } from 'react-router-dom'
import { SidebarData } from './SidebarData'
import './Navbar.css'
import {IconContext} from 'react-icons'

function Navbar() {
    const [sidebar, setSidebar] = useState(false);

    const showSidebar = () => setSidebar(!sidebar)

    return (
        <>
            <IconContext.Provider value={{color:'#919191'}}>
                {/*//TODO: 用Grid  */}
                {/* <Container fluid>
                    <Row>
                        <Col xs={2}
                             sm={2} 
                             md={2}>
                            <Link to="#" className="menu-bars">
                                <FaIcons.FaBars onClick={showSidebar}/>
                            </Link>
                        </Col>
                        <Col xs={{span: 8, offset:0}}
                             sm={{span: 8, offset:0}}
                             md={{span: 8, offset:0}} 
                             className="nav-title">
                                MOGUKU
                        </Col>
                    </Row>
                </Container> */}
                <div className="nav-bar">
                    <Link to="#" className="menu-bars">
                        <FaIcons.FaBars onClick={showSidebar}/>
                    </Link>
                </div> 
                <div className="nav-title">
                    MOGUKU
                </div>
                

                
                <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                    <ul className="nav-menu-items">
                        <li className="nav-bar-toggle">
                            <Link to="#" className="menu-bars">
                                <AiIcons.AiOutlineClose onClick={showSidebar}/>
                            </Link>
                        </li>
                        {SidebarData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    )
}

export default Navbar
