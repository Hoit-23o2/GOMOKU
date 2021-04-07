import React from 'react'

import './Card.css'

import * as BiIcons from 'react-icons/bi'

import {withRouter} from 'react-router-dom';

class Card extends React.Component{
    render(){
        return (
            <div style={{position: 'relative'}}>
                <div className={this.props.showBackArrow === true ? 'card-back-btn' : 'none'}>
                    <BiIcons.BiArrowBack onClick={() => {
                        this.props.history.goBack(); 
                        if(this.props.backArrowClick)
                            this.props.backArrowClick(this.props.params);    
                    }} />
                </div>
                <div className="shadow-card">
                    {this.props.children}
                </div>
            </div>
            
        );
    }
}

export default withRouter(Card);
