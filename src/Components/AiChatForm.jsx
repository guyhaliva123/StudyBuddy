import React, { useState, useEffect, useRef } from 'react';
import '../ComponentsCss/AiChatForm.css';
import { ThreeDots } from 'react-loader-spinner';
import { getToken } from '../features/tokenUtils';

const AIAssistantComponent = ({ isOpen, onClose, fetchEvents }) => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = async () => {
        if (!userInput.trim()) return;

        const newMessage = { role: 'user', content: userInput };
        setChatHistory([...chatHistory, newMessage]);
        setUserInput('');
        setIsLoading(true);
        const token = getToken();
        try {
            const response = await fetch('http://localhost:5000/aibot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Add the token here
                },
                body: JSON.stringify({ user_input: newMessage.content, action: 'Chat', flag: 'True' }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            const assistantMessage = { role: 'assistant', content: data.content };
            setChatHistory((prevChatHistory) => [...prevChatHistory, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setChatHistory((prevChatHistory) => [
                ...prevChatHistory,
                { role: 'system', content: 'Error: Could not send message. Please try again later.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvents = async () => {
        setIsLoading(true);
        const token = getToken();
        try {
            const response = await fetch('http://localhost:5000/AI_study_plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ user_input: '', action: 'Create Events' }),
            });

            if (!response.ok) {
                throw new Error('Failed to Create events');
            }

            const data = await response.json();
            const assistantMessage = { role: 'assistant', content: JSON.stringify(data, null, 2) };
            setChatHistory((prevChatHistory) => [...prevChatHistory, assistantMessage]);
        } catch (error) {
            console.error('Error in Creating Events:', error);
            setChatHistory((prevChatHistory) => [
                ...prevChatHistory,
                { role: 'system', content: 'Error: Could not Create Events. Please try again later.' },
            ]);
        } finally {
            setIsLoading(false);
            fetchEvents();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`ai-assistant ${isOpen ? 'open' : 'closed'}`}>
            <div className="ai-assistant-content">
                <div className='HeaderChat'>
                    <h4 margin="2rem,2rem;">
                        <strong>Hello! I am your AI StudyBuddy</strong>
                    </h4>
                    <div className="x-button" onClick={onClose}>✖️</div>
                </div>
                {/* Chat history */}
                <div className="chat-history">
                    {chatHistory.map((message, index) => (
                        <p
                            key={index}
                            className={`message ${message.role}`}
                            dangerouslySetInnerHTML={{ __html: `<strong>${message.role}:</strong> ${message.content}` }}
                        />
                    ))}
                    {isLoading && (
                        <div className="chat-loading">
                            <ThreeDots
                                visible={true}
                                height="80"
                                width="80"
                                color="#bd9cfd"
                                position="center"
                                radius="9"
                                ariaLabel="three-dots-loading"
                                wrapperStyle={{}}
                                wrapperClass=""
                            />
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <textarea
                    placeholder="How can I help you?"
                    className="textArea"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="3"
                />

                {/* Buttons */}
                <div className="button-container">
                    <button onClick={handleSend} className="send-btn">Send</button>
                    <button onClick={handleCreateEvents} className="createEvents-btn">Create Events</button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantComponent;