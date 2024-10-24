import React, { useState, useEffect, useCallback } from 'react';
import './ConnectFour.css';

const ROWS = 6;
const COLS = 7;
const AI1 = 1;
const AI2 = 2;
const EMPTY = 0;

const AiHard= () => {
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(() => Math.random() < 0.5 ? AI1 : AI2);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFirstMove, setIsFirstMove] = useState(true);

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

  const getValidLocations = useCallback((board) => {
    return board[0].map((cell, index) => cell === EMPTY ? index : null).filter(col => col !== null);
  }, []);

  const evaluateWindow = useCallback((window, player) => {
    const opponent = player === AI1 ? AI2 : AI1;
    let score = 0;

    if (window.filter(cell => cell === player).length === 4) {
      score += 100;
    } else if (window.filter(cell => cell === player).length === 3 && window.filter(cell => cell === EMPTY).length === 1) {
      score += 5;
    } else if (window.filter(cell => cell === player).length === 2 && window.filter(cell => cell === EMPTY).length === 2) {
      score += 2;
    }

    if (window.filter(cell => cell === opponent).length === 3 && window.filter(cell => cell === EMPTY).length === 1) {
      score -= 4;
    }
    return score;
  }, []);

  const scorePosition = useCallback((board, player) => {
    let score = 0;
    const WINDOW_LENGTH = 4;

    // Score center column
    const centerArray = board.map(row => row[COLS/2]);
    const centerCount = centerArray.filter(cell => cell === player).length;
    score += centerCount * 1;

    // Score Horizontal
    for (let r = 0; r < ROWS; r++) {
      const rowArray = board[r];
      for (let c = 0; c < COLS - 3; c++) {
        const window = rowArray.slice(c, c + WINDOW_LENGTH);
        score += evaluateWindow(window, player);
      }
    }

    // Score Vertical
    for (let c = 0; c < COLS; c++) {
      const colArray = board.map(row => row[c]);
      for (let r = 0; r < ROWS - 3; r++) {
        const window = colArray.slice(r, r + WINDOW_LENGTH);
        score += evaluateWindow(window, player);
      }
    }

    // Score positive sloped diagonal
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
        score += evaluateWindow(window, player);
      }
    }

    // Score negative sloped diagonal
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]];
        score += evaluateWindow(window, player);
      }
    }

    return score;
  }, [evaluateWindow]);

  const isTerminalNode = useCallback((board) => {
    return checkWinner(board, AI1) || checkWinner(board, AI2) || getValidLocations(board).length === 0;
  }, [checkWinner, getValidLocations]);

  const minimax = useCallback((board, depth, alpha, beta, maximizingPlayer) => {
    const validLocations = getValidLocations(board);
    const isTerminal = isTerminalNode(board);
    
    if (depth === 0 || isTerminal) {
      if (isTerminal) {
        if (checkWinner(board, AI2)) {
          return [null, 1000];
        } else if (checkWinner(board, AI1)) {
          return [null, -1000];
        } else {
          return [null, 0];
        }
      } else {
        return [null, scorePosition(board, AI2)];
      }
    }
    
    if (maximizingPlayer) {
      let value = -Infinity;
      let column = validLocations[Math.floor(Math.random() * validLocations.length)];
      for (let col of validLocations) {
        const tempBoard = board.map(row => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
          if (tempBoard[r][col] === EMPTY) {
            tempBoard[r][col] = AI2;
            break;
          }
        }
        const [, newScore] = minimax(tempBoard, depth - 1, alpha, beta, false);
        if (newScore > value) {
          value = newScore;
          column = col;
        }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) {
          break;
        }
      }
      return [column, value];
    } else {
      let value = Infinity;
      let column = validLocations[Math.floor(Math.random() * validLocations.length)];
      for (let col of validLocations) {
        const tempBoard = board.map(row => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
          if (tempBoard[r][col] === EMPTY) {
            tempBoard[r][col] = AI1;
            break;
          }
        }
        const [, newScore] = minimax(tempBoard, depth - 1, alpha, beta, true);
        if (newScore < value) {
          value = newScore;
          column = col;
        }
        beta = Math.min(beta, value);
        if (alpha >= beta) {
          break;
        }
      }
      return [column, value];
    }
  }, [checkWinner, getValidLocations, isTerminalNode, scorePosition]);

  const pickBestMove = useCallback((board, player) => {
    if (isFirstMove) {
      const validLocations = getValidLocations(board);
      return validLocations[Math.floor(Math.random() * validLocations.length)];
    }
    
    const validLocations = getValidLocations(board);
    let bestScore = player === AI2 ? -Infinity : Infinity;
    let bestCol = validLocations[Math.floor(Math.random() * validLocations.length)];

    for (let col of validLocations) {
      const tempBoard = board.map(row => [...row]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][col] === EMPTY) {
          tempBoard[r][col] = player;
          break;
        }
      }
      const [, score] = minimax(tempBoard, 6, -Infinity, Infinity, player === AI1);
      if (player === AI2 ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }

    return bestCol;
  }, [isFirstMove, getValidLocations, minimax]);

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
        } else if (getValidLocations(newBoard).length === 0) {
          setGameOver(true);
          setWinner(null);
        } else {
          setCurrentPlayer(currentPlayer === AI1 ? AI2 : AI1);
        }
        
        if (isFirstMove) {
          setIsFirstMove(false);
        }
        
        return;
      }
    }
  }, [board, currentPlayer, gameOver, isPaused, checkWinner, getValidLocations, isFirstMove]);

  const aiMove = useCallback(() => {
    if (gameOver || isPaused) return;

    const col = pickBestMove(board, currentPlayer);
    dropPiece(col);
  }, [board, currentPlayer, gameOver, isPaused, pickBestMove, dropPiece]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      const timer = setTimeout(aiMove, 700);
      return () => clearTimeout(timer);
    }
  }, [gameOver, isPaused, aiMove]);

  const resetGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    setCurrentPlayer(AI1);
    setGameOver(false);
    setWinner(null);
    setIsFirstMove(true);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="connect-four">
      <h1>Connect Four: AI vs. AI</h1>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell === AI1 ? 'player' : cell === AI2 ? 'ai' : 'empty'}`}
                onClick={() => dropPiece(colIndex)}
              >
                <div className="token"></div>
              </div>
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
          winner ? <p>{winner === AI1 ? 'AI1 wins!' : 'AI2 wins!'}</p> : <p>It's a draw!</p>
        ) : (
          <p>{isPaused ? 'Game Paused' : `Current player: ${currentPlayer === AI1 ? 'AI1' : 'AI2'}`}</p>
        )}
      </div>
    </div>
  );
};

export default AiHard;