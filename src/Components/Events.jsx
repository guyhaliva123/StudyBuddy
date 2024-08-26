import React, { useState, useEffect } from 'react';
import '../ComponentsCss/Events.css';
import EventFormModal from './EventForm';
import RankForm from './RankForm'; // Import the RankForm component

const EventsComponent = ({ events, loading, fetchEvents }) => {
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [eventToRemove, setEventToRemove] = useState(null);
    const [showRankForm, setShowRankForm] = useState(false);
    const [weeklyRank, setWeeklyRank] = useState(0);
    const [eventState, setEvents] = useState(events);

    const toggleEventForm = (event) => {
        setSelectedEvent(event);
        setShowEventForm(!showEventForm);
    };

    const toggleRankForm = (event) => {
        setSelectedEvent(event);
        setShowRankForm(!showRankForm);
    };

    const calculateTimeLeft = (startTime) => {
        const eventTime = new Date(startTime);
        const now = new Date();
        const timeLeft = eventTime - now;
        if (timeLeft < 0) return 'Event has started';
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        return { days, hours, minutes, total: timeLeft };
    };

    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.startTime) > now);
    const completedEvents = events.filter(event => new Date(event.startTime) <= now);

    const sortEventsByTimeLeft = (events) => {
        return events.slice().sort((a, b) => {
            const timeLeftA = calculateTimeLeft(a.startTime).total;
            const timeLeftB = calculateTimeLeft(b.startTime).total;
            return timeLeftA - timeLeftB;
        });
    };

    const sortedUpcomingEvents = sortEventsByTimeLeft(upcomingEvents);

    const handleSaveEvent = async (event) => {
        try {
            const method = event.id ? 'PUT' : 'POST';
            const endpoint = event.id ? `update_event/${event.id}` : 'add_event';

            const response = await fetch(`http://localhost:5000/${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${event.id ? 'update' : 'add'} event`);
            }

            alert('Event added successfully!');
            fetchEvents();
            setShowEventForm(false);
        } catch (error) {
            console.error(`Error ${event.id ? 'updating' : 'adding'} event:`, error);
        }
    };

    const handleSaveRank = (eventId, rank) => {
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId ? { ...event, rank } : event
            )
        );
        setWeeklyRank(prevRank => prevRank + rank);
    };

    const confirmRemoveEvent = (eventId) => {
        setEventToRemove(eventId);
        setIsRemoveModalOpen(true);
    };

    const handleRemoveEvent = async () => {
        try {
            const response = await fetch(`http://localhost:5000/remove_event/${eventToRemove}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to remove event');
            }
            alert('Event removed');
            fetchEvents();
            setIsRemoveModalOpen(false);
        } catch (error) {
            console.error('Error removing event:', error);
        }
    };

    const getRowClassName = (importance) => {
        switch (importance) {
            case 'High':
                return 'high-importance';
            case 'Medium':
                return 'medium-importance';
            case 'Low':
                return 'low-importance';
            default:
                return '';
        }
    };

    return (
        <div className="events">
            {loading ? (
                <p>Loading events...</p>
            ) : (
                <>
                    {upcomingEvents.length === 0 && completedEvents.length === 0 ? (
                        <h2>No Events</h2>
                    ) : (
                        <>
                            {sortedUpcomingEvents.length > 0 && (
                                <>
                                    <h3>My Upcoming Events</h3>
                                    <div className="events-table-container">
                                        <table className="events-table">
                                            <thead>
                                                <tr>
                                                    <th>Event Name</th>
                                                    <th>Starting Time</th>
                                                    <th>Time Left</th>
                                                    <th>Duration</th>
                                                    <th>Type/Importance</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedUpcomingEvents.map((event) => (
                                                    <tr key={event.id} className={getRowClassName(event.importance)}>
                                                        <td>{event.title}</td>
                                                        <td>{new Date(event.startTime).toLocaleString()}</td>
                                                        <td>{calculateTimeLeft(event.startTime).days}d {calculateTimeLeft(event.startTime).hours}h {calculateTimeLeft(event.startTime).minutes}m</td>
                                                        <td>{event.duration}</td>
                                                        <td>{event.eventType}/{event.importance}</td>
                                                        <td>
                                                            {!event.course_id && (
                                                                <button className="edit-btn" onClick={() => toggleEventForm(event)}>
                                                                    <i className="fa-solid fa-pencil"></i> Edit
                                                                </button>
                                                            )}
                                                            <button className="remove-btn" onClick={() => confirmRemoveEvent(event.id)}><i className="fa-solid fa-trash"></i> Remove</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {completedEvents.length > 0 && (
                                <>
                                    <h3>Completed Events</h3>
                                    <div className="events-table-container">
                                        <table className="events-table completed-events-table">
                                            <thead>
                                                <tr>
                                                    <th>Event Name</th>
                                                    <th>Starting Time</th>
                                                    <th>Duration</th>
                                                    <th>Type/Importance</th>
                                                    <th>Summary</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {completedEvents
                                                    .filter(event => !event.rank)  // Filter out events with rank set to true
                                                    .map((event) => (
                                                        <tr key={event.id} className={getRowClassName(event.importance)}>
                                                            <td>{event.title}</td>
                                                            <td>{new Date(event.startTime).toLocaleString()}</td>
                                                            <td>{event.duration}</td>
                                                            <td>{event.eventType}/{event.importance}</td>
                                                            <td>
                                                                <button className="edit-btn" onClick={() => toggleRankForm(event)}><i className="fa-solid fa-ranking-star"></i> Rank efficiency</button>
                                                                <button className="remove-btn" onClick={() => confirmRemoveEvent(event.id)}><i className="fa-solid fa-trash"></i> Remove</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                        </>
                    )}

                    {showRankForm && (
                        <RankForm
                            event={selectedEvent}
                            onSave={(rank) => handleSaveRank(selectedEvent.id, rank)}
                            onClose={() => setShowRankForm(false)}
                            fetchEvents={fetchEvents}
                        />
                    )}

                    <EventFormModal
                        isOpen={showEventForm}
                        onClose={() => setShowEventForm(false)}
                        onSave={handleSaveEvent}
                        event={selectedEvent}
                        slot={null}
                    />
                    {isRemoveModalOpen && (
                        <div className="modal-background">
                            <div className="modal-content">
                                <h2>Confirm Remove Event</h2>
                                <p>Are you sure you want to remove this event?</p>
                                <div className="modal-buttons">
                                    <button className="modal-btn" onClick={handleRemoveEvent}>Yes</button>
                                    <button className="modal-btn" onClick={() => setIsRemoveModalOpen(false)}>No</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EventsComponent;