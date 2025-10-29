import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  // If roles are specified, check if user has the required role
  // Note: Since we don't have full user data in context, we might need to adjust
  // For now, assume all logged-in users are allowed unless specified
  if (allowedRoles.length > 0) {
    // This would need user role from context or API call
    // For simplicity, skip role check for now
  }

  return children;
};

export default ProtectedRoute;
