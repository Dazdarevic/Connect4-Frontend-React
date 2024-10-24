import React, { useState, useEffect, useCallback } from 'react';
import './ConnectFour.css';


const ROW_COUNT = 6;
const COLUMN_COUNT = 7;
const PLAYER = 1;
const AI = 2;
const EMPTY = 0;

const HumanVsHuman = () => {
  const [board, setBoard] = useState(Array(ROW_COUNT).fill().map(() => Array(COLUMN_COUNT).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const createBoard = useCallback(() => {
    return Array(ROW_COUNT).fill().map(() => Array(COLUMN_COUNT).fill(EMPTY));
  }, []);

  const dropPiece = useCallback((board, row, col, piece) => {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = piece;
    return newBoard;
  }, []);

  const isValidLocation = useCallback((board, col) => {
    return board[ROW_COUNT - 1][col] === EMPTY;
  }, []);

  const getNextOpenRow = useCallback((board, col) => {
    for (let r = 0; r < ROW_COUNT; r++) {
      if (board[r][col] === EMPTY) {
        return r;
      }
    }
  }, []);

  const winningMove = useCallback((board, piece) => {
    // Check horizontal locations for win
    for (let c = 0; c < COLUMN_COUNT - 3; c++) {
      for (let r = 0; r < ROW_COUNT; r++) {
        if (board[r][c] === piece && board[r][c+1] === piece && 
            board[r][c+2] === piece && board[r][c+3] === piece) {
          return true;
        }
      }
    }

    // Check vertical locations for win
    for (let c = 0; c < COLUMN_COUNT; c++) {
      for (let r = 0; r < ROW_COUNT - 3; r++) {
        if (board[r][c] === piece && board[r+1][c] === piece && 
            board[r+2][c] === piece && board[r+3][c] === piece) {
          return true;
        }
      }
    }

    // Check positively sloped diagonals
    for (let c = 0; c < COLUMN_COUNT - 3; c++) {
      for (let r = 0; r < ROW_COUNT - 3; r++) {
        if (board[r][c] === piece && board[r+1][c+1] === piece && 
            board[r+2][c+2] === piece && board[r+3][c+3] === piece) {
          return true;
        }
      }
    }

    // Check negatively sloped diagonals
    for (let c = 0; c < COLUMN_COUNT - 3; c++) {
      for (let r = 3; r < ROW_COUNT; r++) {
        if (board[r][c] === piece && board[r-1][c+1] === piece && 
            board[r-2][c+2] === piece && board[r-3][c+3] === piece) {
          return true;
        }
      }
    }

    return false;
  }, []);

  const handleClick = useCallback((col) => {
    if (gameOver || isPaused) return;

    if (isValidLocation(board, col)) {
      const row = getNextOpenRow(board, col);
      const newBoard = dropPiece(board, row, col, currentPlayer);
      setBoard(newBoard);

      if (winningMove(newBoard, currentPlayer)) {
        setWinner(currentPlayer);
        setGameOver(true);
      } else {
        setCurrentPlayer(currentPlayer === PLAYER ? AI : PLAYER);
      }
    }
  }, [board, gameOver, isPaused, currentPlayer, isValidLocation, getNextOpenRow, dropPiece, winningMove]);

  const resetGame = useCallback(() => {
    setBoard(createBoard());
    setGameOver(false);
    setCurrentPlayer(PLAYER);
    setWinner(null);
    setIsPaused(false);
  }, [createBoard]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="connect-four">
      <h1>Connect Four</h1>
      <div className="board">
        {board.slice().reverse().map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell === PLAYER ? 'player' : cell === AI ? 'ai' : ''}`}
                onClick={() => handleClick(colIndex)}
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
          <p>{winner === PLAYER ? 'Player 1 (Red) wins!' : 'Player 2 (Yellow) wins!'}</p>
        ) : (
          <p>{isPaused ? 'Game Paused' : `Current Turn: ${currentPlayer === PLAYER ? 'Player 1 (Red)' : 'Player 2 (Yellow)'}`}</p>
        )}
      </div>
    </div>
  );
};

export default HumanVsHuman;