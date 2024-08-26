// CustomEventComponent.js
import React from 'react';

const CustomEventComponent = ({ event }) => {
    return (
        <div className="custom-event">
            <strong>{event.title}</strong>
            <br />
            {/* <span>{event.description}</span> Display additional information */}
            {/* {event.imageUrl && <img src={event.imageUrl} alt="Event"  />} Display event image */}
        </div>
    );
};

export default CustomEventComponent;
