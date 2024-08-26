import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

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

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [icon, setIcon] = useState(iconList[0]);
    const [type, setType] = useState('student');
    const [receiveNews, setReceiveNews] = useState(false);
    const [fullName, setFullName] = useState('');
    const [planDay, setPlanDay] = useState(0);
    const [stickSchedule, setStickSchedule] = useState(0);
    const [satesfiedTasks, setSatesfiedTasks] = useState(0);
    const [deadlinedTasks, setnDeadlinedTasks] = useState(0);
    const [prioritizeTasks, setPrioritizeTasks] = useState(0);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateFullName = (name) => {
        const nameRegex = /^[A-Za-z\s]{1,20}$/;
        return nameRegex.test(name);
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validate Full Name
        if (!validateFullName(fullName)) {
            newErrors.fullName = 'Full name must be between 1 and 20 characters and contain only letters and spaces.';
        }

        // Validate Email
        if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format.';
        }

        // Validate Password
        if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number.';
        }

        // Validate Date of Birth
        if (dateOfBirth) {
            const today = new Date();
            const dob = new Date(dateOfBirth);
            if (dob >= today) {
                newErrors.dateOfBirth = 'Date of Birth must be in the past.';
            }
        }

        // If there are any validation errors, set them and prevent form submission
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Proceed with form submission if there are no errors
        fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullName,
                dateOfBirth,
                gender,
                type,
                email,
                password,
                icon,
                receiveNews,
                planDay,
                stickSchedule,
                satesfiedTasks,
                deadlinedTasks,
                prioritizeTasks
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        navigate('/Login');
    };
    const renderRatingOptions = (stateSetter, selectedValue, name) => (
        <div className="rating-options">
            {[0, 1, 2, 3, 4, 5].map((value) => (
                <label key={value}>
                    <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={selectedValue === value}
                        onChange={(e) => stateSetter(parseInt(e.target.value))}
                    />
                    {value}
                </label>
            ))}
        </div>
    );

    return (
        <section className="registration-section">
            <div className="registration-container">
                <div className="registration-form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="reg_main">
                        <h2>Register</h2>
                            <label htmlFor="fullName">Full Name
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                            {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                            </label>

                            <label htmlFor="email">Email
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                            </label>

                            <label htmlFor="password">Password
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <p className="error-message">{errors.password}</p>}
                            </label>

                            <label htmlFor="dateOfBirth">Date of Birth (optional)
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                            />
                            {errors.dateOfBirth && <p className="error-message">{errors.dateOfBirth}</p>}
                            </label>

                            <label htmlFor="gender">Gender
                            <select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="else">Else</option>
                            </select>
                            </label>

                            <label htmlFor="type">Type
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer</option>
                            </select>
                            </label>

                            <label htmlFor="icon">Icon:</label>
                            <div className="icon-selector">
                                <div className="icon-list">
                                    <div className="selected-icon" onClick={() => setIcon(!icon)}>
                                        <img src={icon} alt="Selected Icon" />
                                    </div>
                                    {iconList.map((iconUrl, index) => (
                                        <div key={index} className="icon-item" onClick={() => setIcon(iconUrl)}>
                                            <img src={iconUrl} alt={`icon-${index}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="receive-emails">
                                <label htmlFor="receiveNews">
                                    <input
                                        type="checkbox"
                                        id="receiveNews"
                                        checked={receiveNews}
                                        onChange={(e) => setReceiveNews(e.target.checked)}
                                    />
                                Interested in receiving news?</label>
                            </div>
                        </div>

                        <div className="reg_quiz">
                            <label>How often do you plan your day in advance?</label>
                            {renderRatingOptions(setPlanDay, planDay, "planDay")}

                            <label>How well do you stick to your planned schedule?</label>
                            {renderRatingOptions(setStickSchedule, stickSchedule, "stickSchedule")}

                            <label>How effectively do you prioritize your tasks?</label>
                            {renderRatingOptions(setPrioritizeTasks, prioritizeTasks, "prioritizeTasks")}

                            <label>How often do you meet deadlines?</label>
                            {renderRatingOptions(setnDeadlinedTasks, deadlinedTasks, "deadlinedTasks")}

                            <label>How satisfied are you with your current time management skills?</label>
                            {renderRatingOptions(setSatesfiedTasks, satesfiedTasks, "satesfiedTasks")}
                        </div>

                        <div className="reg_btn_container">
                            <button type="submit">Register</button>
                            <p>
                                Have an account?
                                <a href="/login" className="register-link"> Login</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default RegisterPage;
