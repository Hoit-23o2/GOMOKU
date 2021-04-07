import React from 'react'
import * as FaIcons from "react-icons/fa"
import * as RiIcons from "react-icons/ri"

export const SidebarData = [
    {
        title: '主页',
        path:'/',
        icon:<FaIcons.FaHome/>,
        cName:'nav-text'
    },
    {
        title: '我的',
        path:'/Me',
        icon:<FaIcons.FaUser/>,
        cName:'nav-text'
    },
    {
        title: '登录',
        path:'/Login',
        icon:<RiIcons.RiLoginBoxFill/>,
        cName:'nav-text'
    }
]
