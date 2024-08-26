import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../ComponentsCss/Calendar.css';
import EventFormModal from './EventForm';
import CustomEventComponent from './CustomEventCalendarComponent'; // Import the custom component

const localizer = momentLocalizer(moment);

const CalendarComponent = ({ events, fetchEvents }) => {
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const CustomEventComponent = ({ event }) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{event.title}</span>
                {event.isRanked && (
                    <img src="https://cdn-icons-png.flaticon.com/128/4436/4436481.png" alt="Done" style={{ height: '16px', marginLeft: 'auto' }} /> // added icon for ranked events.
                )}
            </div>
        );
    };

    useEffect(() => {
        //Fetch events only if events are empty or null
        if (!events) {
            fetchEvents();
        }
    }, [events, fetchEvents]);

    const eventStyleGetter = (event, start, end, isSelected) => {
        const now = new Date();
        let backgroundColor;
        let borderLeft;
        let color = '#FFFFFF'; // Default text color is white

        if (event.isRanked) {
            backgroundColor = 'transparent';
            borderLeft = '2px solid green'; // not working currently
            color = '#000000'; // Set text color to black for ranked events so it can be seen with white background.
        } else if (end < now) {
            backgroundColor = '#000000'; // Black for past events not yet ranked
        } else {
            switch (event.eventType) {
                case 'Study':
                    backgroundColor = '#9773dc';
                    break;
                case 'Social':
                    backgroundColor = '#69b0e6';
                    break;
                case 'Hobby':
                    backgroundColor = '#5dd2a5';
                    break;
                default:
                    backgroundColor = '#3174ad';
                    break;
            }
        }

        switch (event.importance) {
            case 'High':
                borderLeft = '14px solid #f04a4a';
                break;
            case 'Medium':
                borderLeft = '14px solid #f1ba41';
                break;
            case 'Low':
                borderLeft = '14px solid #f7f322';
                break;
            default:
                borderLeft = '14px solid #3174ad';
                break;
        }

        const style = {
            backgroundColor: backgroundColor,
            borderLeft: borderLeft,
            color: color, // Apply the text color
        };

        return {
            style: style,
            tooltip: event.additionalInfo // Set tooltip text or other details
        };
    };


    const handleSelectSlot = (slotInfo) => {
        setSelectedSlot(slotInfo.start);
        setSelectedEvent(null);
        setShowEventForm(true);
    };

    const handleSelectEvent = (event) => {
        if (!event.isRanked) {
            setSelectedEvent(event);
            setSelectedSlot(null);
            setShowEventForm(true);
        }
        else {
            alert("This event has been ranked and cannot be edited.")
        }
    };

    const handleCloseEventForm = () => {
        setShowEventForm(false);
        setSelectedEvent(null);
        setSelectedSlot(null);
    };

    const handleSaveEvent = async (formData) => {
        try {
            const idToken = localStorage.getItem('accessToken');
            const requestOptions = {
                method: formData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(formData)
            };

            let url = formData.id ? `http://localhost:5000/update_event/${formData.id}` : 'http://localhost:5000/add_event';
            const response = await fetch(url, requestOptions);
            alert('event added/updated successfully!');
            fetchEvents();
            // handleCloseEventForm();
        } catch (error) {
            console.error('Error saving or updating event:', error);
        }
    };

    return (
        <div className="calendar-wrapper">
            <Calendar
                localizer={localizer}
                events={events.map(event => ({
                    ...event,
                    start: new Date(event.startTime),
                    end: moment(event.startTime).add(event.duration, 'minutes').toDate()
                }))}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{ height: 500 }}
                eventPropGetter={eventStyleGetter}
                components={{
                    event: CustomEventComponent, // Use the custom event component
                }}
            />
            <EventFormModal
                isOpen={showEventForm}
                onClose={handleCloseEventForm}
                onSave={handleSaveEvent}
                event={selectedEvent ? { ...selectedEvent, startTime: moment(selectedEvent.start).format('YYYY-MM-DDTHH:mm') } : null}
                slot={selectedSlot ? { start: moment(selectedSlot).format('YYYY-MM-DDTHH:mm') } : null}
            />
        </div>
    );
};

export default CalendarComponent;
