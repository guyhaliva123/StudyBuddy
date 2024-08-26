import React, { useEffect, useState } from 'react';
import CalendarComponent from '../Components/Calendar';
import EventsComponent from '../Components/Events';
import GraphComponent from '../Components/StatisticGraph';
import PostCarousel from '../Components/PostCarousel';
import CoursesComponent from '../Components/Courses';
import Notification from '../Components/Notification';

const StudentHomePage = ({
  UserId,
  userType,
  onOpenCourseModal,
  calendarRef,
  eventsRef,
  statisticsRef,
  fetchPosts,
  events,
  loading,
  loadingCourses,
  fetchEvents,
  showAIAssistant,
  toggleAIAssistant,
  courses,
  fetchCourses,
  coursesRef,
  posts,
  loadingPosts
}) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log('UserId:', UserId); // Debugging line

    const fetchNotifications = async () => {
      try {
        if (!UserId) {
          throw new Error('UserId is not defined');
        }
        const idToken = localStorage.getItem('accessToken');

        const response = await fetch(`http://localhost:5000/notifications`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },

          }
        )
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
        console.log(data.notifications);

      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    console.log(notifications);
  }, [UserId]);

  const handleMarkNotificationAsSeen = async (notificationId) => {
    try {
      const idToken = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/mark_notification_as_seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          notification_id: notificationId,
          user_id: UserId, // Pass the current user's ID

        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.error || 'Failed to mark notification as seen');
      }

      const data = await response.json();
      console.log('Notification marked as seen:', data);

      // Optionally update the notifications state here if needed
      setNotifications(notifications.filter(notification => notification.id !== notificationId));

    } catch (error) {
      console.error('Error marking notification as seen:', error.message);
    }
  };

  return (
    <>

      <div className="calendar" ref={calendarRef}>
        <div className="calendar-container">
          <CalendarComponent events={events} loading={loading} fetchEvents={fetchEvents} />
        </div>
      </div>
      <Notification notifications={notifications} onRemoveNotification={handleMarkNotificationAsSeen} /> {/* Pass notifications state to Notification component */}

      <div className="events-section" ref={eventsRef}>
        <h2>Events</h2>
        <EventsComponent events={events} loading={loading} fetchEvents={fetchEvents} />
      </div>
      <div ref={coursesRef}>
        <h2>Courses</h2>
        <CoursesComponent courses={courses} loadingCourses={loadingCourses} fetchEvents={fetchEvents} fetchCourses={fetchCourses} userType={userType} />
      </div>
      <div ref={statisticsRef}>
        <h2>Statistics</h2>
        <GraphComponent events={events} loading={loading} fetchEvents={fetchEvents} />
      </div>
      <div>
        <h2>Recommended Events</h2>
        <PostCarousel posts={posts} loadingPosts={loadingPosts} fetchPosts={fetchPosts} fetchEvents={fetchEvents} userType={userType} />
      </div>
    </>
  );
};

export default StudentHomePage;
