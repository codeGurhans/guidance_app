import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <h2 className="card-title">Loading...</h2>
          <p>Please wait while we verify your authentication.</p>
        </div>
      </div>
    );
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists, render children
  return children;
};

export default PrivateRoute;