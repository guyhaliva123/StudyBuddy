import React from 'react';
import '../ComponentsCss/PostCarousel.css'; // Ensure this import is correct

const PostCard = ({ event, onAddToCalendar, onEdit, onRemove, userType }) => {
    const handleAddClick = () => {
        onAddToCalendar(event);
    };

    const handleEditClick = () => {
        onEdit(event);
    };

    const handleRemoveClick = () => {
        onRemove(event.id);
    };

    return (
        <div className="event-card">
            <h3>{event.title}</h3>
            {event.imageUrl && <img src={event.imageUrl} alt="Event" style={{ width: '400px', height: '200px' }} />}
            <p className="time-title">{event.startTime}</p>
            <p>{event.description}</p>
            <div className="button-container">
                {userType !== "admin" && <button onClick={handleAddClick}>Add to Calendar</button>}
                {userType === "admin" && <button className="edit" onClick={handleEditClick}>Edit Post</button>}
                {userType === "admin" && <button className="remove" onClick={handleRemoveClick}>Remove Post</button>}
            </div>
        </div>
    );
};

export default PostCard;
