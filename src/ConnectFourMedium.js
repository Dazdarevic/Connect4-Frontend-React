import React, { useState, useEffect, useCallback } from 'react';
import './ConnectFour.css';

const ROWS = 6;
const COLS = 7;
const PLAYER = 1;
const AI = 2;
const EMPTY = 0;

const ConnectFourMedium = () => {
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const checkWinner = useCallback((board, player) => {
    // Horizontal check
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (board[r][c] === player && board[r][c+1] === player && 
            board[r][c+2] === player && board[r][c+3] === player) {
          return true;
        }
      }
    }

    // Vertical check
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === player && board[r+1][c] === player && 
            board[r+2][c] === player && board[r+3][c] === player) {
          return true;
        }
      }
    }

    // Diagonal checks
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && 
            board[r+2][c+2] === player && board[r+3][c+3] === player) {
          return true;
        }
        if (board[r+3][c] === player && board[r+2][c+1] === player && 
            board[r+1][c+2] === player && board[r][c+3] === player) {
          return true;
        }
      }
    }

    return false;
  }, []);

  const dropPiece = useCallback((col) => {
    if (gameOver || isPaused) return;
    
    const newBoard = board.map(row => [...row]);
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][col] === EMPTY) {
        newBoard[r][col] = currentPlayer;
        setBoard(newBoard);

        if (checkWinner(newBoard, currentPlayer)) {
          setGameOver(true);
          setWinner(currentPlayer);
        } else {
          setCurrentPlayer(currentPlayer === PLAYER ? AI : PLAYER);
        }
        return;
      }
    }
  }, [board, currentPlayer, gameOver, isPaused, checkWinner]);

  const getBestMove = useCallback(async (board) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/playground/get_best_move5/?board=${JSON.stringify(board)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data.best_move;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }, []);

  const aiMove = useCallback(async () => {
    if (gameOver || isPaused) return;

    const bestMove = await getBestMove(board);
    if (bestMove !== null) {
      dropPiece(bestMove);
    } else {
      console.error('Failed to get best move from backend');
    }
  }, [board, gameOver, isPaused, getBestMove, dropPiece]);

  useEffect(() => {
    if (currentPlayer === AI && !gameOver && !isPaused) {
      const timer = setTimeout(aiMove, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, isPaused, aiMove]);

  const resetGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    setCurrentPlayer(PLAYER);
    setGameOver(false);
    setWinner(null);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="connect-four">
      <h1>Connect Four: HUMAN vs. AI</h1>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell === PLAYER ? 'player' : cell === AI ? 'ai' : ''}`}
                onClick={() => currentPlayer === PLAYER && dropPiece(colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={resetGame}>Reset Game</button>
        <button onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
      </div>
      <div className="status">
        {gameOver ? (
          <p>{winner === PLAYER ? 'Player wins!' : 'AI wins!'}</p>
        ) : (
          <p>{isPaused ? 'Game Paused' : `Current player: ${currentPlayer === PLAYER ? 'Human' : 'AI'}`}</p>
        )}
      </div>
    </div>
  );
};

export default ConnectFourMedium;