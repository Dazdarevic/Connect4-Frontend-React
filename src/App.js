import './App.css';
import ConnectFour from './ConnectFour';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameSetup from './GameSetup';
import HumanVsHuman from './HumanVsHuman';
import AiHard from './AiHard';
import AiEasy from './AiEasy';
import AiMedium from './AiMedium';
import ConnectFourEasy from './ConnectFourEasy';
import ConnectFourMedium from './ConnectFourMedium';

function App() {
  return (
    // <div>
    // primer prikazivanja samo jednog fajla
    //   <HumanVsHuman />
    // </div>
    <Router>
      <Routes>
        <Route path="/" element={<GameSetup />} />
        <Route path="/human-vs-human" element={<HumanVsHuman />} />
        <Route path="/human-vs-ai/hard" element={<ConnectFour />} />
        <Route path="/ai-vs-ai/hard" element={<AiHard />} />
        <Route path="/human-vs-ai/medium" element={<ConnectFourMedium />} />
        <Route path="/ai-vs-ai/medium" element={<AiMedium />} />
        <Route path="/human-vs-ai/easy" element={<ConnectFourEasy />} />
        <Route path="/ai-vs-ai/easy" element={<AiEasy />} />
      </Routes>
    </Router>
  );
}

export default App;