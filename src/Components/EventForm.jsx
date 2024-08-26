import React, { useState, useEffect } from 'react';
import '../ComponentsCss/EventForm.css';

const EventFormModal = ({ isOpen, onClose, onSave, event, slot }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('0:15');
    const [importance, setImportance] = useState('Low');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState('Study');
    const [errors, setErrors] = useState({});
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setStartTime(event.startTime || '');
            setDuration(event.duration || '0:15');
            setImportance(event.importance || 'Low');
            setDescription(event.description || '');
            setEventType(event.eventType || 'Study');
            setImageUrl(event.imageUrl || '');
        } else if (slot) {
            setStartTime(slot.start);
        } else {
            resetForm();
        }
    }, [event, slot]);

    const validateForm = () => {
        let errors = {};

        if (title.length < 3) {
            errors.title = 'Event name must be at least 3 characters long';
        }

        const isValidDateTime = !isNaN(new Date(startTime).getTime());
        if (!isValidDateTime) {
            errors.startTime = 'Please enter a valid date and time';
        }

        if (description.length < 3) {
            errors.description = 'Description must be at least 3 characters long';
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
    
        let finalImageUrl = imageUrl;
        if (image) {
            try {
                const formData = new FormData();
                formData.append('file', image);
    
                const idToken = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:5000/upload_image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: formData
                });
    
                const result = await response.json();
                if (response.ok) {
                    finalImageUrl = result.file_url;
                } else {
                    console.error(result.message);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    
        const formData = {
            id: event ? event.id : null,
            title,
            startTime,
            duration,
            importance,
            description,
            eventType,
            imageUrl: finalImageUrl
        };
    
        onSave(formData);
        handleFadeOutAndClose(); // Trigger fade-out and close after saving
    };

    const resetForm = () => {
        setTitle('');
        setStartTime(slot ? slot.start : '');
        setDuration('0:15');
        setImportance('Low');
        setDescription('');
        setEventType('Study');
        setImage(null);
        setImageUrl('');
        setErrors({});
    };

    const handleClose = () => {
        handleFadeOutAndClose(); // Use the same fade-out function for closing
    };

    const handleFadeOutAndClose = () => {
        
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 500);
    };

    if (!isOpen && !closing) return null;

    return (
        <div className={`modal-overlay ${closing ? 'fade-out' : ''}`}>
            <div className={`modal-content ${closing ? 'fade-out' : ''}`}>
                <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
                <form>
                    {imageUrl && <img src={imageUrl} alt="Event" style={{ width: '400px', height: '200px' }} />}    
                    <label>
                        Event Name:
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                        {errors.title && <p className="error">{errors.title}</p>}
                    </label>
                    <label>
                        Date and Time:
                        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        {errors.startTime && <p className="error">{errors.startTime}</p>}
                    </label>
                    <label>
                        Duration:
                        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="0:15">0:15</option>
                            <option value="0:30">0:30</option>
                            <option value="0:45">0:45</option>
                            <option value="1:00">1:00</option>
                            <option value="1:15">1:15</option>
                            <option value="1:30">1:30</option>
                            <option value="1:45">1:45</option>
                            <option value="2:00">2:00</option>
                        </select>
                    </label>
                    <label>
                        Importance:
                        <select value={importance} onChange={(e) => setImportance(e.target.value)}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </label>
                    <label>
                        Event Type:
                        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                            <option value="Study">Study</option>
                            <option value="Social">Social</option>
                            <option value="Hobby">Hobby</option>
                        </select>
                    </label>
                    <label>
                        Description:
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        {errors.description && <p className="error">{errors.description}</p>}
                    </label>
                    <label>
                        Upload Image:
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    <div className="modal-buttons">
                        <button type="button" onClick={handleSave}>
                            {event ? 'Update Event' : 'Add Event'}
                        </button>
                        <button type="button" onClick={handleClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;
