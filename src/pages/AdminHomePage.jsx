import React, { useState } from 'react';
import PostCarousel from '../Components/PostCarousel';
import CoursesComponent from '../Components/Courses';
import GeneralMsgModal from '../Components/GeneralMsgModal';
import AdminUserTable from '../Components/AdminUserTable'; // Import the new AdminUserTable component

const AdminHomePage = ({ userType, loadingCourses, fetchEvents, showAIAssistant, toggleAIAssistant, fetchPosts, courses, fetchCourses, coursesRef, posts, loadingPosts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState('');

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSendMsg = async () => {
        try {
            const response = await fetch('http://localhost:5000/get__users_IDs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            const user_ids = await response.json();

            const payload = {
                user_ids,
                message: notification
            };

            const responseNotif = await fetch('http://localhost:5000/add_notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });


            alert('Message sent successfully!');
            setNotification('');
            handleCloseModal();
        } catch (error) {
            console.error('Error sending message:', error.message);

        }
    };


    return (
        <>
            <div ref={coursesRef}>
                <h2>Courses</h2>
                <CoursesComponent fetchEvents={fetchEvents} courses={courses} loadingCourses={loadingCourses} fetchCourses={fetchCourses} />
            </div>
            <div>
                <h2>Recommended Events</h2>
                <PostCarousel posts={posts} loadingPosts={loadingPosts} fetchPosts={fetchPosts} fetchEvents={fetchEvents} userType={userType} />
            </div>
            <div>
                <h2>Registered Users</h2>
                <AdminUserTable /> {/* Add the AdminUserTable component here */}
                <button onClick={handleOpenModal}>Send General Msg</button>
            </div>
            <GeneralMsgModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSend={handleSendMsg}
                notification={notification}
                setNotification={setNotification}
            />
        </>
    );
};

export default AdminHomePage;
