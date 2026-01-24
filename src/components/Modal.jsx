import React from 'react';
import './Modal.css';

const Modal = ({ title, message, actionLabel, onAction, secondaryActionLabel, onSecondaryAction }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    {onAction && (
                        <button className="modal-button primary" onClick={onAction}>
                            {actionLabel}
                        </button>
                    )}
                    {onSecondaryAction && (
                        <button className="modal-button secondary" onClick={onSecondaryAction}>
                            {secondaryActionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
