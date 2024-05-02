import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoading, selectUser } from '../../reducers/auth/authSlice';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);

  if (loading) {
    // Return null or loading indicator if still loading
    return null;
  }

  // If user is logged in, render children
  if (user?.email) {
    return children;
  } else {
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} />;
  }
};

export default PrivateRoute;
