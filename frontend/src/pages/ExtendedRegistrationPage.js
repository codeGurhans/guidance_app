import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import ExtendedRegistrationForm from '../components/ExtendedRegistrationForm';
import api from '../services/api';

const ExtendedRegistrationPage = () => {
  const { user, token, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = async (profileData) => {
    setLoading(true);
    setError('');
    
    try {
      // Make API call to update profile
      const response = await api.put('/users/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        // Profile updated successfully
        // Update the user in context
        updateUserProfile(response.data);
        alert('Profile updated successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <ExtendedRegistrationForm 
        onSubmit={handleFormSubmit}
        initialData={user}
      />
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Saving your profile...</p>
        </div>
      )}
    </div>
  );
};

export default ExtendedRegistrationPage;