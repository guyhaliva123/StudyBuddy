import React, { useState, useEffect } from 'react';
import '../ComponentsCss/CourseForm.css';

const CourseFormModal = ({ isOpen, onClose, onSave, course }) => {
    const [name, setName] = useState('');
    const [instructor, setInstructor] = useState('');
    const [startDate, setStartDate] = useState('');
    const [duration, setDuration] = useState('1 month');
    const [level, setLevel] = useState('Beginner');
    const [description, setDescription] = useState('');
    const [days, setDays] = useState({});
    const [errors, setErrors] = useState({});
    const [pdfUrls, setPdfUrls] = useState([]);

    useEffect(() => {
        if (course) {
            setName(course.name || '');
            setInstructor(course.instructor || '');
            setStartDate(course.startDate || '');
            setDuration(course.duration || '1 month');
            setLevel(course.level || 'Beginner');
            setDescription(course.description || '');
            setDays(course.days || {});
            setPdfUrls(course.pdfUrls || []);
        } else {
            resetForm();
        }
    }, [course]);

    const validateForm = () => {
        let errors = {};
        if (name.length < 3) errors.name = 'Course name must be at least 3 characters long';
        if (instructor.length < 3) errors.instructor = 'Instructor name must be at least 3 characters long';
        if (!startDate) errors.startDate = 'Please enter a valid date';
        if (description.length < 3) errors.description = 'Description must be at least 3 characters long';
        if (Object.keys(days).length === 0) errors.days = 'Please select at least one day';
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePdfUpload = async (file) => {
        if (!course?.id) {
            alert('Please save the course before uploading files.');
            return;
        }

        const idToken = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`http://localhost:5000/upload_file/${course.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            setPdfUrls([...pdfUrls, result.file_url]);
        } else {
            console.error('Failed to upload PDF:', response.statusText);
        }
    };

    const handleDeletePdf = (fileUrl) => {
        setPdfUrls(pdfUrls.filter(url => url !== fileUrl));
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const formData = {
            id: course ? course.id : undefined,
            name,
            instructor,
            startDate,
            duration,
            level,
            description,
            days,
            pdfUrls
        };
        onSave(formData);
    };

    const handleCheckboxChange = (day) => {
        setDays((prevDays) => {
            const newDays = { ...prevDays };
            if (newDays[day]) delete newDays[day];
            else newDays[day] = { start: '', end: '' };
            return newDays;
        });
    };

    const handleTimeChange = (day, type, time) => {
        setDays((prevDays) => ({
            ...prevDays,
            [day]: { ...prevDays[day], [type]: time }
        }));
    };

    const resetForm = () => {
        setName('');
        setInstructor('');
        setStartDate('');
        setDuration('1 month');
        setLevel('Beginner');
        setDescription('');
        setDays({});
        setErrors({});
        setPdfUrls([]);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content add-new-course-form">
                <h2>{course ? 'Edit Course' : 'Add New Course'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div style={{width:' 50%'}}>
                        <label>
                            Course Name:
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            {errors.name && <p className="error">{errors.name}</p>}
                        </label>
                        <label>
                            Instructor:
                            <input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
                            {errors.instructor && <p className="error">{errors.instructor}</p>}
                        </label>
                        <label>
                            Start Date:
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            {errors.startDate && <p className="error">{errors.startDate}</p>}
                        </label>
                        <label>
                            Duration:
                            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                                <option value="1 weeks">1 weeks</option>
                                <option value="2 weeks">2 weeks</option>
                                <option value="3 weeks">3 weeks</option>
                                <option value="4 weeks">4 weeks</option>
                                <option value="6 weeks">6 weeks</option>
                                <option value="8 weeks">8 weeks</option>
                                <option value="14 weeks">14 weeks</option>
                            </select>
                        </label>
                        <label>
                            Level:
                            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </label>
                    </div>
                    <label className="days_and_time">
                        Days and Times:
                        <div className="checkbox-group">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
                                <div key={day} className="day-time">
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={day}
                                            checked={days.hasOwnProperty(day)}
                                            onChange={() => handleCheckboxChange(day)}
                                        />
                                        {day}
                                    </label>
                                    {days.hasOwnProperty(day) && (
                                        <div>
                                            <label>
                                                Start:
                                                <input
                                                    type="time"
                                                    value={days[day].start}
                                                    onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                                />
                                            </label>
                                            <label>
                                                End:
                                                <input
                                                    type="time"
                                                    value={days[day].end}
                                                    onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.days && <p className="error">{errors.days}</p>}
                    </label>
                    <label className="form_desc_input">
                        Description:
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        {errors.description && <p className="error">{errors.description}</p>}
                    </label>

                    {/* Conditionally render PDF upload and table if course is defined (i.e., in update mode) */}
                    {course && (
                        <>
                            <label>
                                Upload PDF:
                                <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e.target.files[0])} />
                            </label>
                            <h3>Uploaded Files</h3>
                            <table className="pdf-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pdfUrls.map((pdfUrl, index) => {
                                        const fileName = decodeURIComponent(pdfUrl.split('/').pop()); // Extract the file name from the URL
                                        return (
                                            <tr key={index}>
                                                <td><a href={pdfUrl} target="_blank" rel="noopener noreferrer">{fileName}</a></td>
                                                <td><button type="button" onClick={() => handleDeletePdf(pdfUrl)}>Delete</button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}

                    <div className="modal-buttons">
                        <button type="submit">{course ? 'Update Course' : 'Add Course'}</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseFormModal;
