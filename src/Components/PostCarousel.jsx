import React, { useState, useEffect } from 'react';
import '../ComponentsCss/PostCarousel.css';
import PostCard from './PostCard'; // Ensure this import is correct
import ConfirmPostForm from './ConfirmPostForm'; // Import the new dialog component

const Carousel = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slidesToShow = 3; // Number of slides to show at once
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + slidesToShow;
            return newIndex >= children.length ? 0 : newIndex;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex - slidesToShow;
            return newIndex < 0 ? Math.max(0, children.length - slidesToShow) : newIndex;
        });
    };

    return (
        <div className="carousel">
            <button onClick={prevSlide} className="carousel-control prev"><i class="fa-solid fa-angle-left"></i></button>
            <div className="carousel-slides">
                <div
                    className="carousel-wrapper"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`
                    }}
                >
                    {children}
                </div>
            </div>
            <button onClick={nextSlide} className="carousel-control next"><i class="fa-solid fa-angle-right"></i></button>
        </div>
    );
};

const PostCarousel = ({ fetchPosts, fetchEvents, userType, posts, Loadiingposts }) => {
    const [events, setEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);


    useEffect(() => {
        fetchPosts();
    }, []);

    const handleAddToCalendar = (event) => {
        setSelectedEvent(event);
        setIsDialogOpen(true);
    };


    const handleEditPost = (event) => {
        setSelectedEvent(event);
        setEditMode(true);
        setIsDialogOpen(true);
    };

    const handleRemovePost = async (postId) => {
        try {
            const idToken = localStorage.getItem('accessToken');
            if (!idToken) {
                throw new Error('No access token found');
            }

            const url = `http://localhost:5000/remove_post/${postId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setEvents((prevEvents) => prevEvents.filter(event => event.id !== postId));
        } catch (error) {
            console.error('Error removing post:', error);
        }
        fetchPosts();
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditMode(false);
    };

    const handleSavePost = async (eventData) => {
        try {
            const idToken = localStorage.getItem('accessToken');
            if (!idToken) {
                throw new Error('No access token found');
            }

            const url = editMode ? `http://localhost:5000/update_post/${selectedEvent.id}` : 'http://localhost:5000/add_event';
            const method = editMode ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                //throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (editMode) {
                setEvents((prevEvents) => prevEvents.map(event => event.id === selectedEvent.id ? { ...event, ...eventData } : event));
            } else {
                setEvents((prevEvents) => [...prevEvents, { ...eventData, id: result.id }]);
            }
            setIsDialogOpen(false);
            fetchPosts();
            fetchEvents();

        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    return (
        <div className="event-post">
            {Loadiingposts ? (
                <p>Loading posts...</p>
            ) : (
                <Carousel>
                    {posts.map((event) => (
                        <PostCard
                            key={event.id}
                            event={event}
                            onAddToCalendar={handleAddToCalendar}
                            onEdit={handleEditPost}
                            onRemove={handleRemovePost}
                            userType={userType}
                        />
                    ))}
                </Carousel>
            )}
            <ConfirmPostForm
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleSavePost}
                eventDetails={selectedEvent || {}}
                isEditMode={editMode}
            />
        </div>
    );
};

export default PostCarousel;
