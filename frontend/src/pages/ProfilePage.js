import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the API service to fetch profile data
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <h2 className="card-title">Loading Profile...</h2>
          <p>Please wait while we fetch your profile information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card">
          <h2 className="card-title">Error</h2>
          <p className="alert alert-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile && !user) {
    return (
      <div className="page-container">
        <div className="card">
          <h2 className="card-title">Profile Not Found</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Use user data from context if profile data isn't available
  const displayProfile = profile || user;

  return (
    <div className="page-container">
      <h1 className="page-title">Your Profile</h1>
      
      <div className="card">
        <h2 className="card-title">Personal Information</h2>
        <div className="profile-info">
          <div className="info-item">
            <strong>Name:</strong>
            <span>{displayProfile.firstName} {displayProfile.lastName}</span>
          </div>
          <div className="info-item">
            <strong>Email:</strong>
            <span>{displayProfile.email}</span>
          </div>
          {displayProfile.age && (
            <div className="info-item">
              <strong>Age:</strong>
              <span>{displayProfile.age}</span>
            </div>
          )}
          {displayProfile.gender && (
            <div className="info-item">
              <strong>Gender:</strong>
              <span>{displayProfile.gender}</span>
            </div>
          )}
          {displayProfile.grade && (
            <div className="info-item">
              <strong>Grade:</strong>
              <span>{displayProfile.grade}</span>
            </div>
          )}
          {displayProfile.location && (
            <div className="info-item">
              <strong>Location:</strong>
              <span>{displayProfile.location}</span>
            </div>
          )}
          {displayProfile.academicInterests && displayProfile.academicInterests.length > 0 && (
            <div className="info-item">
              <strong>Academic Interests:</strong>
              <div className="interests-tags">
                {displayProfile.academicInterests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="info-item">
            <strong>Member Since:</strong>
            <span>{new Date(displayProfile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Account Settings</h2>
        <div className="settings-actions">
          <button className="btn btn-secondary">Edit Profile</button>
          <button className="btn btn-secondary">Change Password</button>
          <button 
            className="btn" 
            onClick={logout}
            style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;