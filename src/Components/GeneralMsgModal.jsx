import React, { useState } from 'react';
import './GeneralMsgModal.css';

const GeneralMsgModal = ({ isOpen, onClose, onSend, notification, setNotification }) => {
    const [error, setError] = useState('');

    const handleSend = () => {
        if (notification.trim() === '') {
            setError('Message cannot be empty');
        } else {
            setError('');
            onSend();
            alert('message has been sent');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Send General Message</h2>
                <textarea
                    value={notification}
                    onChange={(e) => setNotification(e.target.value)}
                    placeholder="Enter your message here"
                ></textarea>
                {error && <p className="error-message">{error}</p>}
                <div className="modal-buttons">
                    <button onClick={handleSend}>Send</button>
                    <button onClick={onClose}>Back</button>

                </div>
            </div>
        </div>
    );
};

export default GeneralMsgModal;
