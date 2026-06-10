import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route protector that checks for user authentication.
 * Redirects to the login page if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
