import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSetup.css';
import slika1 from './logoAI.png'; 

const GameSetup = () => {
  const [level, setLevel] = useState('');
  const [mode, setMode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'human-vs-human') {
      setLevel('medium');
    }
  }, [mode]);

  const handleStart = () => {
    if (mode) {
      let route = '';
      if (mode === 'human-vs-human') {
        route = '/human-vs-human';
      } else {
        route = `/${mode}/${level}`;
      }
      navigate(route);
    }
  };

  return (
    <div className="game-setup-container">
      <div className="game-setup-content">
        <div className="game-setup-image-container">
          <img src={slika1} alt="Game Logo" className="game-setup-logo" />
        </div>
        <div className="game-setup-form">
          <h1 className="game-setup-main-title">Connect 4 AI</h1>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            className="game-setup-select"
          >
            <option value="">Select game mode</option>
            <option value="human-vs-human">Human vs Human</option>
            <option value="human-vs-ai">Human vs AI</option>
            <option value="ai-vs-ai">AI vs AI</option>
          </select>

          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            className="game-setup-select"
            disabled={mode === 'human-vs-human'}
          >
            <option value="">Select level</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button 
            onClick={handleStart} 
            disabled={!mode || (mode !== 'human-vs-human' && !level)}
            className="game-setup-button"
          >
            Play Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;