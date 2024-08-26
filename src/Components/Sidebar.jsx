import React from 'react';
import '../ComponentsCss/Sidebar.css';


const Sidebar = ({ scrollToCalendar, scrollToEvents, toggleAIAssistant, scrollToStatistics,scrollToCourses }) => {
    // Sidebar components Scrolling functions
    const handleScrollToStatistics = () => {
        scrollToStatistics(); 
    };
    
    return (
        <>
            <aside className="sidebar">
                <ul>
                <a className="sidebar-btn" onClick={scrollToCalendar}><li><i class="fa-solid fa-calendar-days"></i>Calendar</li></a>
                <a className="sidebar-btn" onClick={scrollToEvents}><li><i class="fa-solid fa-calendar-plus"></i>Events</li></a>
                <a className="sidebar-btn" onClick={scrollToCourses}><li><i class="fa-solid fa-person-chalkboard"></i>Courses</li></a>
                <a className="sidebar-btn" onClick={handleScrollToStatistics}><li><i class="fa-solid fa-chart-line"></i>Statistics</li></a>
                </ul>
            </aside>
            <a className="chat-btn" onClick={toggleAIAssistant}><li><i class="fa-regular fa-comments"></i>Assistant Chat</li></a>

        </>
    );
}

export default Sidebar;
