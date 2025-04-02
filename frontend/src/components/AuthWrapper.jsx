import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// This component will wrap all routes that require authentication
const AuthWrapper = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const location = useLocation();

    // If user is not logged in, redirect to login page with return url
    return userInfo
        ? <Outlet />
        : <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default AuthWrapper;
