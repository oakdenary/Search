import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route protector that checks if the logged-in user is an Admin.
 * Redirects normal users to the search page.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/search" replace />;
  }

  return children;
};

export default AdminRoute;
