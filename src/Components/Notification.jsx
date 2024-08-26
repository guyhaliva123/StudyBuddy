import React, { useState } from 'react';
import './Notification.css';

const NotificationDrawer = ({ notifications, onRemoveNotification }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-container">
      <button className="hamburger-button" onClick={toggleDrawer}>
        Messages
        &#9776;
        {notifications.length > 0 && <span className="notification-dot"></span>}
      </button>
      {isOpen && (
        <div className={`notification-dropdown ${isOpen ? 'open' : ''}`}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-card">
                <p>{notification.message}</p>
                <button
                  onClick={() => onRemoveNotification(notification.id)}
                  className="dismiss-button"
                >
                  Confirm
                </button>
              </div>
            ))
          ) : (
            <p>No notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDrawer;
