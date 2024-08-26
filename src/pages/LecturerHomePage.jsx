import React from 'react';
import CalendarComponent from '../Components/Calendar';
import EventsComponent from '../Components/Events';
import GraphComponent from '../Components/StatisticGraph';
import PostCarousel from '../Components/PostCarousel';
import CoursesComponent from '../Components/Courses';

const LecturerHomePage = ({ userType, calendarRef, eventsRef, statisticsRef, events, loading, fetchPosts, loadingCourses, fetchEvents, showAIAssistant, toggleAIAssistant, courses, fetchCourses, coursesRef, posts, loadingPosts }) => {
    return (
        <>
            <div className="calendar" ref={calendarRef}>
                <div className="calendar-container">
                    <CalendarComponent events={events} loading={loading} fetchEvents={fetchEvents} />
                </div>
            </div>
            <div className="events-section" ref={eventsRef}>
                <h2>Events</h2>
                <EventsComponent events={events} loading={loading} fetchEvents={fetchEvents} />
            </div>

            <div ref={coursesRef}>
                <h2>Courses</h2>
                <CoursesComponent courses={courses} loadingCourses={loadingCourses} fetchCourses={fetchCourses} />
            </div>
            <div>
                <h2>Recommended Events</h2>
                <PostCarousel posts={posts} loadingPosts={loadingPosts} fetchPosts={fetchPosts} fetchEvents={fetchEvents} userType={userType} />
            </div>
            <div ref={statisticsRef}>
                <h2>Statistics</h2>
                <GraphComponent events={events} loading={loading} fetchEvents={fetchEvents} />
            </div>
        </>
    );
};

export default LecturerHomePage;
