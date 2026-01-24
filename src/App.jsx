import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Controls from './components/Controls';
import Modal from './components/Modal';
import './index.css';

function App() {
  const [gameStatus, setGameStatus] = useState('menu'); // menu, playing, waveSummary, gameOver, victory
  const [wave, setWave] = useState(1);
  const [gameId, setGameId] = useState(0); // Used to force remount on reset
  const [stats, setStats] = useState({ enemiesLeft: 15, totalEnemies: 15, lives: 5 });

  // Game Ref to call fire
  const gameRef = useRef(null);

  const startGame = () => {
    setWave(1);
    setGameId(g => g + 1); // Increment key to force remount
    setStats({ enemiesLeft: 15, totalEnemies: 15, lives: 5 });
    setGameStatus('playing');
  };

  const nextWave = () => {
    if (wave >= 3) {
      setGameStatus('victory');
    } else {
      setWave(w => w + 1);
      setGameStatus('playing');
    }
  };

  const handleWaveComplete = () => {
    if (wave === 3) {
      setGameStatus('victory');
    } else {
      setGameStatus('waveSummary');
    }
  };

  const handleGameOver = () => {
    setGameStatus('gameOver');
  };

  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
  };

  return (
    <div className="app-container">
      <GameCanvas
        key={gameId}
        ref={gameRef}
        wave={wave}
        isPlaying={gameStatus === 'playing'}
        onWaveComplete={handleWaveComplete}
        onGameOver={handleGameOver}
        onStatsUpdate={handleStatsUpdate}
      />

      {gameStatus === 'playing' && (
        <>
          <HUD
            wave={wave}
            enemiesLeft={stats.enemiesLeft}
            totalEnemies={stats.totalEnemies}
            lives={stats.lives}
          />
          <Controls onFire={() => gameRef.current?.firePlayer()} />
        </>
      )}

      {gameStatus === 'menu' && (
        <Modal
          title="SHIP BATTLE"
          message="Command the U.S.S. Enterprise! Destroy the Borg cubes. Survive 3 waves to win."
          actionLabel="START MISSION"
          onAction={startGame} // Note: Audio context needs interaction. This click provides it.
        />
      )}

      {gameStatus === 'waveSummary' && (
        <Modal
          title={`WAVE ${wave} CLEARED!`}
          message="Enemy fleet destroyed. Prepare for the next wave."
          actionLabel="NEXT WAVE"
          onAction={nextWave}
        />
      )}

      {gameStatus === 'gameOver' && (
        <Modal
          title="GAME OVER"
          message="The ship has been destroyed."
          actionLabel="TRY AGAIN"
          onAction={startGame}
        />
      )}

      {gameStatus === 'victory' && (
        <Modal
          title="MISSION ACCOMPLISHED!"
          message="You have defeated the Borg invasion and saved the galaxy!"
          actionLabel="PLAY AGAIN"
          onAction={startGame}
        />
      )}
    </div>
  );
}

export default App;
