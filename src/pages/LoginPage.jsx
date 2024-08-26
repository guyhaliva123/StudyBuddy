import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';  
import { useNavigate } from 'react-router-dom';
import './Login.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
            if (data.message === "Login Successful") {
                localStorage.setItem('accessToken', data.access_token);
                dispatch(login({ token: data.access_token }));
                navigate('/home');
            } else {
                setMessage("Invalid credentials. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            setMessage("An error occurred. Please try again.");
        });
    };

    return (
        <section className="form-section">
            <div className="form-container">
                {/* <div className="form-image">
                    <img
                        src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                        alt="Preview"
                    />
               </div> */}


               <div className="iframe_bg">
                    <iframe className="main_iframe" src="https://lottie.host/embed/edaba115-6e13-413a-b3e0-a6c3daccc5e0/TS73hXGqpx.json" width="300px"></iframe>

                    <div className="why_overlay_btn">
                        <a href="#">Why us?</a>
                    </div>
                    <div className="why_overlay">
                        <p>
                        <span>Revolutionize Your Time Management with AI</span><br/>
                        Our platform empowers you to take control of your schedule with an AI-powered calendar that adapts to your unique needs.<br/>
                        Say goodbye to stress and hello to efficiency.<br/>
                        <br/>

                        <span>AI-Driven Task Prioritization</span><br/>
                        Our intelligent assistant doesn’t just understand your priorities—it actively helps you manage them.<br/>
                        This smart bot learns from your input and suggests optimal schedules or study plans tailored to your needs.<br/>
                        Once you approve, it automatically creates events in your calendar after you press the 'Create Events' btn. <br/>
                        With built-in statistics, our smart calendar also tracks how efficiently you're completing your tasks, helping you continuously improve.<br/>
                        <br/>

                        <span>Built for the Academic World</span><br/>
                        Designed specifically for students and lecturers, our tools seamlessly integrate all your academic commitments—from classes to assignments—into one manageable platform.<br/>
                        <br/>

                        <span>Achieve More, Stress Less!</span><br/>
                        With our AI-powered assistant, you’ll find the balance between work and life, making time for what truly matters.<br/> 
                        Join a community of students and educators dedicated to smarter time management.<br/>
                        <br/>

                        <span>Our Mission</span><br/>
                        We’re thrilled to bring this innovative tool to you, designed with one goal in mind:<br/>
                        to make your life easier. We believe that everyone deserves a stress-free way to manage their time, and we’re committed to helping you achieve that.<br/>
                        Our AI-powered calendar is more than just a tool—it’s a companion in your journey toward better time management and a more balanced life.<br/> 
                        We can’t wait to see how it helps you succeed!
                        </p>
                    </div>
                </div>
                <div className="form-content">
                    <h2>Sign in</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                        {message && <p>{message}</p>}
                        <p>
                            Don't have an account? 
                            <a href="http://localhost:3000/register#!" className="register-link"> Register</a>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
