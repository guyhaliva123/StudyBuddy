import React, { useState, useEffect } from 'react';
import '../ComponentsCss/MyProfileForm.css';
import { getToken } from '../features/tokenUtils';


const iconList = [
    'https://cdn-icons-png.flaticon.com/512/167/167752.png',
    'https://cdn-icons-png.flaticon.com/512/2798/2798310.png',
    'https://cdn-icons-png.flaticon.com/512/5102/5102383.png',
    'https://cdn-icons-png.flaticon.com/512/5352/5352126.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
    'https://cdn-icons-png.flaticon.com/512/2995/2995633.png',
    'https://cdn-icons-png.flaticon.com/512/2784/2784403.png',
    'https://cdn-icons-png.flaticon.com/512/6024/6024190.png'
];

const MyProfileForm = ({ isOpen, onClose, onSave }) => {
    const [profileData, setProfileData] = useState({
        email: '',
        dateOfBirth: '',
        type: 'student',
        receiveNews: false,
        icon: '',
        createdAt: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
        }
    }, [isOpen]);

    const fetchUserData = async () => {
        const token = getToken();
        try {
            const response = await fetch('http://localhost:5000/get_user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            } else {
                setMessage('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setMessage('Failed to fetch user data');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData({
            ...profileData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleIconClick = (iconUrl) => {
        setProfileData({
            ...profileData,
            icon: iconUrl,
        });
    };

    const handleBack = () => {
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();

        const response = await fetch('http://localhost:5000/update_user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });

        if (response.ok) {
            setMessage('Profile updated successfully');
            onSave();
            onClose();
        } else {
            setMessage('Failed to update profile');
        }
    };

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>Profile:{"" + profileData.fullName}</h2>

                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Icon:
                        <div className="icon-list">
                            {iconList.map((icon, index) => (
                                <img
                                    key={index}
                                    src={icon}
                                    alt={`Icon ${index}`}
                                    onClick={() => handleIconClick(icon)}
                                    className={profileData.icon === icon ? 'selected' : ''}
                                    style={{ cursor: 'pointer', margin: '5px', width: '50px', height: '50px' }}
                                />
                            ))}
                        </div>
                    </label>
                    <label>
                        Receive News:
                        <input
                            type="checkbox"
                            name="receiveNews"
                            checked={profileData.receiveNews}
                            onChange={handleChange}
                        />
                    </label>
                    <p>User created at: {"" + profileData.createdAt}</p>

                    <h2>my first quizz : </h2>

                    <p className="profile_quizz_test">
                        How often do you plan your day in advance? <span>{profileData.planDay}</span><br/>
                        How well do you stick to your planned schedule? <span>{profileData.stickSchedule}</span><br/>
                        How effectively do you prioritize your tasks? <span>{profileData.prioritizeTasks}</span><br/>
                        How often do you meet deadlines? <span>{profileData.deadlinedTasks}</span><br/>
                        How satisfied are you with your current time management skills? <span>{profileData.satesfiedTasks}</span>
                    </p>

                    <div className="modal-buttons">
                        <button type="submit">Edit information</button>
                        <button type="button" onClick={handleBack}>Back</button>
                    </div>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default MyProfileForm;
