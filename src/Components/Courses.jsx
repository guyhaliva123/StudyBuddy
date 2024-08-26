import React, { useState, useEffect } from 'react';
import '../ComponentsCss/Courses.css';
import CourseFormModal from './CourseForm';

const CoursesComponent = ({ courses, fetchCourses, loadingCourses, userType, fetchEvents }) => {
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [userCourses, setUserCourses] = useState([]);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [courseToRemove, setCourseToRemove] = useState(null);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [infoCourse, setInfoCourse] = useState(null);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [registeredUsersIds, setRegisteredUsersIds] = useState([]);
    const [Notification, setNotification] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (userType === "student") {
            fetchUserCourses();
        }
        fetchCourses();
        fetchRegisteredUserIds();
    }, []);

    const fetchRegisteredUsers = async (courseId) => {
        try {
            const response = await fetch(`http://localhost:5000/get_course_users/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch registered users`);
            }
            const data = await response.json();
            setRegisteredUsers(data);
            console.log(data);
        } catch (error) {
            console.error("Error fetching registered users:", error);
        }
    };

    const fetchRegisteredUserIds = async (courseId) => {
        try {
            const response = await fetch(`http://localhost:5000/get_course_users_ID/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch registered users`);
            }
            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error("Error fetching registered users:", error);
            return [];
        }
    };


    const fetchUserCourses = async () => {
        try {
            const response = await fetch('http://localhost:5000/get_student_courses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user courses');
            }

            const data = await response.json();
            setUserCourses(data.courses);
        } catch (error) {
            console.error('Error fetching user courses:', error);
        }
    };

    const toggleCourseForm = (course) => {
        setSelectedCourse(course);
        setShowCourseForm(!showCourseForm);
    };

    const handleSaveCourse = async (course) => {
        try {
            const method = course.id ? 'PUT' : 'POST';
            const endpoint = course.id ? `update_course/${course.id}` : 'add_course';

            const response = await fetch(`http://localhost:5000/${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(course),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${course.id ? 'update' : 'add'} course`);
            }
            fetchCourses();

            setShowCourseForm(false);
        } catch (error) {
            console.error(`Error ${course.id ? 'updating' : 'adding'} course:`, error);
        }
    };

    const handleConfirmRemoveCourse = async () => {
        try {
            const response = await fetch(`http://localhost:5000/remove_course/${courseToRemove}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to remove course');
            }
            alert('course removed ');
            fetchCourses();
            setShowConfirmationDialog(false); // Close the dialog
        } catch (error) {
            console.error('Error removing course:', error);
        }
    };

    const handleAddCourse = async (courseId) => {
        try {
            const response = await fetch('http://localhost:5000/add_course_to_user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_id: courseId }),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }

            const data = await response.json();
            console.log(data.message);
            alert('course added successfully!');
            fetchUserCourses();
            fetchEvents();
        } catch (error) {
            console.error('Error adding course to user:', error.message);
        }
    };

    const handleRemoveCourseFromUser = async (courseId) => {
        try {
            const response = await fetch('http://localhost:5000/remove_course_from_user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_id: courseId }),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }

            const data = await response.json();
            console.log(data.message);
            alert('course removed successfully!');
            fetchUserCourses();
            fetchEvents();
        } catch (error) {
            console.error('Error removing course from user:', error.message);
        }
    };

    const getRowClassName = (level) => {
        switch (level) {
            case 'Advanced':
                return 'advanced-level';
            case 'Intermediate':
                return 'intermediate-level';
            case 'Beginner':
                return 'beginner-level';
            default:
                return '';
        }
    };

    const filteredCourses = courses.filter(course => !userCourses.includes(course.id));

    const handleInfoClick = (course) => {
        setInfoCourse(course);
        setShowInfoDialog(true);
        fetchRegisteredUsers(course.id);
    };

    const handleNotificationClick = async (course, Notification) => {
        if (Notification.trim() === '') {
            setError('Notification message is required');
            return;
        }

        // Fetch the registered user IDs and use the returned data immediately
        const userIds = await fetchRegisteredUserIds(course.id);

        if (userIds.length > 0) {
            const result = await SaveNotification(userIds, Notification);
            if (!result.ok) {
                alert('Message has been sent');
            } else {
                alert('Message has not been sent.');
            }
        } else {
            alert('No registered users found to send the message.');
        }

        setError(''); // Clear the error if validation passes
    };

    const SaveNotification = async (registeredUserIds, notification) => {
        try {
            const payload = {
                user_ids: registeredUserIds,
                message: notification
            };

            const response = await fetch('http://localhost:5000/add_notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to save notification');
            }

            const data = await response.json();
            console.log('Notification saved:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Error saving notification:', error.message);
            return { success: false, error: error.message };
        }
    };
    return (
        <div className="courses">
            {loadingCourses ? (
                <p>Loading courses...</p>
            ) : (
                <>
                    {userType === "student" && userCourses.length > 0 && (
                        <>
                            <h2>My Registered Courses</h2>
                            <table className="courses-table">
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Instructor</th>
                                        <th>Start Date</th>
                                        <th>Duration</th>
                                        <th>Level</th>
                                        <th>Files</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses
                                        .filter(course => userCourses.includes(course.id))
                                        .map((course) => (
                                            <tr key={course.id} className={getRowClassName(course.level)}>
                                                <td>{course.name}</td>
                                                <td>{course.instructor}</td>
                                                <td>{new Date(course.startDate).toLocaleDateString()}</td>
                                                <td>{course.duration}</td>
                                                <td>{course.level}</td>
                                                <td>
                                                    {course.pdfUrls && course.pdfUrls.length > 0 ? (
                                                        course.pdfUrls.map((pdfUrl, index) => {
                                                            const fileName = decodeURIComponent(pdfUrl.split('/').pop());
                                                            return (
                                                                <div key={index}>
                                                                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                                                        {fileName}
                                                                    </a>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span>No files uploaded</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="remove-btn" onClick={() => {
                                                        handleRemoveCourseFromUser(course.id);
                                                    }}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {filteredCourses.length === 0 ? (
                        <h2>No Available Courses</h2>
                    ) : (
                        <>
                            <h2>Available Courses</h2>
                            <table className="courses-table">
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Instructor</th>
                                        <th>Start Date</th>
                                        <th>Duration</th>
                                        <th>Level</th>
                                        <th>Files</th>
                                        <th>Actions</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((course) => (
                                        <tr key={course.id} className={getRowClassName(course.level)}>
                                            <td>{course.name}</td>
                                            <td>{course.instructor}</td>
                                            <td>{new Date(course.startDate).toLocaleDateString()}</td>
                                            <td>{course.duration}</td>
                                            <td>{course.level}</td>
                                            <td>
                                                {course.pdfUrls && course.pdfUrls.length > 0 ? (
                                                    course.pdfUrls.map((pdfUrl, index) => {
                                                        const fileName = decodeURIComponent(pdfUrl.split('/').pop());
                                                        return (
                                                            <div key={index}>
                                                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                                                    {fileName}
                                                                </a>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span>No files uploaded</span>
                                                )}
                                            </td>
                                            <td>
                                                {userType === "student" ? (
                                                    <>
                                                        <button className="edit-btn" onClick={() => handleAddCourse(course.id)}>Add</button>
                                                    </>
                                                ) : (
                                                    <p>
                                                        <button className="info-btn" onClick={() => handleInfoClick(course)}>View Info</button>
                                                        <button className="edit-btn" onClick={() => toggleCourseForm(course)}>Edit</button>
                                                        <button className="remove-btn" onClick={() => {
                                                            setCourseToRemove(course.id);
                                                            setShowConfirmationDialog(true);
                                                        }}>Remove</button>
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}

            <CourseFormModal
                isOpen={showCourseForm}
                onClose={() => setShowCourseForm(false)}
                onSave={handleSaveCourse}
                course={selectedCourse}
            />

            {/* Built-in Confirmation Dialog */}
            {showConfirmationDialog && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Remove Course</h2>
                        <p>Are you sure you want to remove this course?</p>
                        <div className="modal-buttons">
                            <button className="modal-btn" onClick={handleConfirmRemoveCourse}>Yes</button>
                            <button className="modal-btn" onClick={() => setShowConfirmationDialog(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Dialog */}
            {showInfoDialog && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Course Information</h2>
                        {infoCourse && (
                            <>
                                <p><strong>Course Name:</strong> {infoCourse.name}</p>
                                <p><strong>Instructor:</strong> {infoCourse.instructor}</p>
                                <p><strong>Start Date:</strong> {new Date(infoCourse.startDate).toLocaleDateString()}</p>
                                <p><strong>Duration:</strong> {infoCourse.duration}</p>
                                <p><strong>Level:</strong> {infoCourse.level}</p>
                                <p><strong>Description:</strong> {infoCourse.description}</p>
                                <p><strong>Registered Users:</strong></p>
                                <ul>
                                    {registeredUsers && registeredUsers.length > 0 ? (
                                        registeredUsers.map((user, index) => (
                                            <li key={index}>{user}</li>
                                        ))
                                    ) : (
                                        <li>No users registered for this course.</li>
                                    )}
                                </ul>
                                <p><strong>Message:</strong></p>
                                <input
                                    type="text"
                                    id="Notification"
                                    value={Notification}
                                    onChange={(e) => setNotification(e.target.value)}
                                    required
                                />
                                {error && <p className="error-message">{error}</p>}
                            </>
                        )}
                        <div className="modal-buttons">
                            <button className="modal-btn" onClick={() => handleNotificationClick(infoCourse, Notification)}>Send Notification to students</button>
                            <button className="modal-btn" onClick={() => setShowInfoDialog(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesComponent;
