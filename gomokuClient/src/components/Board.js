import React from 'react'
import "./Board.css"


const ME = "我";
function Piece(props) {
    const color = props.color;
    if(color === 'b'){
        return <div className='piece-black' />
    }
    else if(color === 'w'){
        return <div className='piece-white' />
    }
    else {
        return <></>;
    }
}

function Square (props) {
    return (
        <button className="square" onClick={props.clickFn}>
            <Piece color={props.color}/>
        </button>
    )
}

class Board extends React.Component {
    constructor(props){
        super(props);
        const {
            rowCount, 
            colCount, 
            colorState,
            clickFn
        } = this.props;
        console.log(this.props);
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.clickFn = clickFn;
        /* 初始化Color Statee */
        this.colorState = colorState;   
    }
    
    renderSquare(i) {
        return (
          <Square
            color={this.props.colorState[i]}
            clickFn={() => this.clickFn(i, ME)}
            />
        );
    }
    
    render() {
        const boardRows = Array.from({length: this.rowCount}, (_, index) => index + 1);
        const boardCols = Array.from({length: this.colCount}, (_, index) => index + 1);
        
        return (
            <div className="board-container">
                {
                    boardRows.map((_, i) => (
                        <div key={i} className="board-row">
                            {
                                boardCols.map((_, j) => this.renderSquare(this.rowCount * i + j))
                            }
                        </div>
                    ))
                }
            </div>
        )
    }
    
}

export default Board
