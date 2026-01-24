import React from 'react';
import './Controls.css';

const Controls = ({ onFire }) => {
    return (
        <div className="controls-container">
            <button
                className="fire-button"
                onPointerDown={(e) => {
                    e.preventDefault();
                    onFire();
                }}
            >
                FIRE
            </button>
        </div>
    );
};

export default Controls;
