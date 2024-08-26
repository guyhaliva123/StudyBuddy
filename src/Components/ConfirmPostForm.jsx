import React, { useState, useEffect } from 'react';
import '../ComponentsCss/ConfirmPostForm.css';

const ConfirmPostForm = ({ isOpen, onClose, onConfirm, eventDetails, isEditMode }) => {
    const [formData, setFormData] = useState({
        title: '',
        startTime: '',
        duration: '',
        importance: '',
        description: '',
        eventType: '',
        imageUrl: ''
    });

    const [image, setImage] = useState(null);

    useEffect(() => {
        if (eventDetails) {
            setFormData({
                title: eventDetails.title || '',
                startTime: eventDetails.startTime || '',
                duration: eventDetails.duration || '',
                importance: eventDetails.importance || '',
                description: eventDetails.description || '',
                eventType: eventDetails.eventType || '',
                imageUrl: eventDetails.imageUrl || ''
            });
        }
    }, [eventDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalImageUrl = formData.imageUrl;
        if (image) {
            try {
                const formData = new FormData();
                formData.append('file', image);

                const idToken = localStorage.getItem('accessToken');  // Get the access token
                const response = await fetch('http://localhost:5000/upload_image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${idToken}`  // Include the Authorization header
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

        onConfirm({ ...formData, imageUrl: finalImageUrl });
    };

    return (
        isOpen && (
            <div className="confirmation-dialog">
                <div className="confirmation-dialog-content">
                    <h2>{isEditMode ? 'Edit Post' : 'View Post'}</h2>
                    {isEditMode ? (
                        <form onSubmit={handleSubmit}>
                            {formData.imageUrl && <img src={formData.imageUrl} alt="Event" style={{ width: '400px', height: '200px' }} />}
                            <label>
                                Title:
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Start Time:
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Duration:
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                >
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
                                <select
                                    name="importance"
                                    value={formData.importance}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </label>
                            <label>
                                Event Type:
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Study">Study</option>
                                    <option value="Social">Social</option>
                                    <option value="Hobby">Hobby</option>
                                </select>
                            </label>
                            <label>
                                Description:
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Upload Image:
                                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                            </label>
                           
                            <div className="dialog-actions">
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={onClose}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <p><strong>Title:</strong> {formData.title}</p>
                            <p><strong>Start Time:</strong> {formData.startTime}</p>
                            <p><strong>Duration:</strong> {formData.duration}</p>
                            <p><strong>Importance:</strong> {formData.importance}</p>
                            <p><strong>Description:</strong> {formData.description}</p>
                            <p><strong>Event Type:</strong> {formData.eventType}</p>
                            {formData.imageUrl && <img src={formData.imageUrl} alt="Event" style={{ width: '400px', height: '200px' }} />}
                            <div className="dialog-actions">
                                <button type="button" onClick={() => onConfirm(formData)}>Confirm</button>
                                <button type="button" onClick={onClose}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default ConfirmPostForm;
