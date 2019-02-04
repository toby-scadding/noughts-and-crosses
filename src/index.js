import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from "socket.io-client";
import './index.css';

const ENDPOINT = getenv('TIC_TAC_TOE_ENDPOINT');
var socket = socketIOClient(ENDPOINT);

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
      opponent: null,
      symbol: null,
      isTurn: false,
    };
  }

  componentDidMount() {
    socket.on('opponent found', (opponent, symbol, isTurn) => {
      this.setState({
        squares: this.state.squares,
        opponent: opponent,
        symbol: symbol,
        isTurn: isTurn,
      });
    });

    socket.on('make move', (squares) => {
      this.setState({
        squares: squares,
        opponent: this.state.opponent,
        symbol: this.state.symbol,
        isTurn: true,
      });
    });

    socket.emit('ready');
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    if (!this.state.isTurn || squares[i] || calculateWinner(squares)) {
      return;
    }
    squares[i] = this.state.symbol;

    this.setState({
      squares: squares,
      opponent: this.state.opponent,
      symbol: this.state.symbol,
      isTurn: false,
    });
    
    socket.emit('make move', squares, this.state.opponent);
  }

  render() {
    const winner = calculateWinner(this.state.squares);

    let status;
    if (!winner) {
      if (this.state.opponent) {
        status = this.state.isTurn ? "Your turn" : "Opponent's turn";
      } else {
        status = 'Waiting for opponent...';
      }
    } else if (winner === this.state.symbol) {
      status = 'You win!';
    } else {
      status = 'You lose :(';
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={this.state.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
