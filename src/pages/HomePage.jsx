import React, { useRef, useState, useEffect } from 'react';
import './Home.css';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';
import AIAssistantComponent from '../Components/AiChatForm';
import StudentHomePage from './StudentHomePage';
import LecturerHomePage from './LecturerHomePage';
import AdminHomePage from './AdminHomePage';


const HomePage = () => {
    const calendarRef = useRef(null);
    const eventsRef = useRef(null);
    const statisticsRef = useRef(null);
    const coursesRef = useRef(null); // Ref for courses section
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [userType, setUserType] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [UserId, setUserId] = useState('');

    useEffect(() => {
        fetchUserType();
        fetchEvents();
        fetchCourses();
        fetchPosts();
    }, []);

    const fetchUserType = async () => {
        try {
            const idToken = localStorage.getItem('accessToken');

            if (!idToken) {
                throw new Error('No access token found');
            }
            const response = await fetch('http://localhost:5000/get_user_type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ token: idToken })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user type');
            }

            const data = await response.json();
            setUserType(data.user_type);
            setUserId(data.user_id);
        } catch (error) {
            console.error('Error fetching user type:', error);
        }
    };


    const fetchCourses = async () => {
        try {
            const idToken = localStorage.getItem('accessToken');
            if (!idToken) {
                throw new Error('No access token found');
            }
            const response = await fetch(`http://localhost:5000/get_courses?userType=${userType}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            console.log('Fetched courses:', data); // Debug print
            setCourses(data);
            setLoadingCourses(false); // Set loadingCourses to false after fetching courses
        } catch (error) {
            console.error('Error fetching courses:', error);
            setLoadingCourses(false); // Set loadingCourses to false if there's an error
        }
    };

    const fetchEvents = async () => {
        try {
            const idToken = localStorage.getItem('accessToken');
            if (!idToken) {
                throw new Error('No access token found');
            }

            const response = await fetch('http://localhost:5000/get_events', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const idToken = localStorage.getItem('accessToken');
            if (!idToken) {
                throw new Error('No access token found');
            }

            const url = 'http://localhost:5000/get_event_Posts'; // Make sure this matches your backend endpoint
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching event posts:', error);
        } finally {
            setLoading(false);
        }
    };


    const scrollToCalendar = () => {
        if (calendarRef.current) {
            calendarRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToEvents = () => {
        if (eventsRef.current) {
            eventsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToStatistics = () => {
        if (statisticsRef.current) {
            statisticsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };


    const scrollToCourses = () => {
        if (coursesRef.current) {
            coursesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };


    const toggleAIAssistant = () => {
        setShowAIAssistant(!showAIAssistant);
    };

    let UserHomePage;
    switch (userType) {
        case 'student':  //Calendar, Events, Posts, Statistics ,COURSES?
            UserHomePage = StudentHomePage;
            break;
        case 'lecturer': //Calendar, Events , Courses, Statistics ,posts
            UserHomePage = LecturerHomePage;
            break;
        case 'admin':  // Courses, posts - add post
            UserHomePage = AdminHomePage;
            break;
        default:
            UserHomePage = () => <div>Unknown user type</div>;
    }


    if (!userType) {
        return <div>Loading...</div>;
    }

    return (
        <div className="homepage">
            <div className="container">
                <div className="full_sidebar">
                    <Navbar userType={userType}
                        fetchCourses={fetchCourses}
                        fetchPosts={fetchPosts} />
                    <Sidebar
                        scrollToCourses={scrollToCourses}
                        scrollToCalendar={scrollToCalendar}
                        scrollToEvents={scrollToEvents}
                        scrollToStatistics={scrollToStatistics}
                        toggleAIAssistant={toggleAIAssistant}
                    />
                </div>
                <main className="main-content">
                    <h1 class="main_logo">Study Buddy</h1>
                    <UserHomePage
                        UserId={UserId}
                        calendarRef={calendarRef}
                        eventsRef={eventsRef}
                        statisticsRef={statisticsRef}
                        events={events}
                        loading={loading}
                        fetchEvents={fetchEvents}
                        showAIAssistant={showAIAssistant}
                        toggleAIAssistant={toggleAIAssistant}
                        fetchCourses={fetchCourses}
                        coursesRef={coursesRef}
                        loadingCourses={loadingCourses}
                        courses={courses}
                        userType={userType}
                        fetchPosts={fetchPosts}
                        loadingPosts={loadingPosts}
                        posts={posts}

                    />
                </main>
            </div>

            <a className="sidebar-btn" onClick={toggleAIAssistant}><li><i class="fa-solid fa-calendar-plus"></i>Assistant Chat</li></a>

            {showAIAssistant && (
                <AIAssistantComponent
                    isOpen={showAIAssistant}
                    onClose={toggleAIAssistant}
                    fetchEvents={fetchEvents}
                />
            )}

        </div>
    );
};

export default HomePage;
