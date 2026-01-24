import React from 'react';
import './HUD.css';

const HUD = ({ wave, enemiesLeft, totalEnemies, lives }) => {
  return (
    <div className="hud-container">
      <div className="hud-top">
        <div className="hud-stat">
          <span className="hud-label">WAVE</span>
          <span className="hud-value">{wave} / 3</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">ENEMIES</span>
          <span className="hud-value">{totalEnemies - enemiesLeft} / {totalEnemies}</span>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="hud-lives">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`heart-icon ${i < lives ? 'active' : 'lost'}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HUD;
