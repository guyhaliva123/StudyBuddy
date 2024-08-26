import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import Navbar from '../Components/Navbar'; // Ensure this path is correct

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route path="/home" element={<HomePage />} />
                
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </>
    );
};

export default AppRoutes;
