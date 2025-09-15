import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import AvatarUpload from '../components/AvatarUpload';
import './ProfileManagementPage.css';

const ProfileManagementPage = () => {
  const { user, token, updateUserProfile, updateUserAvatar, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    grade: '',
    academicInterests: [],
    location: '',
  });
  
  const [interestInput, setInterestInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(null);

  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || '',
        gender: user.gender || '',
        grade: user.grade || '',
        academicInterests: user.academicInterests || [],
        location: user.location || '',
        privacySettings: user.privacySettings || {
          profileVisibility: 'private',
          showEmail: false,
          showLocation: false,
          showAcademicInfo: false,
        },
      });
    }
  }, [user]);

  const handleAvatarChange = (file) => {
    setAvatar(file);
  };

  const handlePrivacyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [name]: value,
      },
    }));
  };

  const handlePrivacyToggle = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [name]: checked,
      },
    }));
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Update privacy settings
      const response = await api.put('/users/privacy', formData.privacySettings, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        // Update the user in context
        updateUserProfile(response.data);
        setMessage('Privacy settings updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !formData.academicInterests.includes(interestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        academicInterests: [...prev.academicInterests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      academicInterests: prev.academicInterests.filter(i => i !== interestToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    // Basic frontend validation
    const newErrors = {};
    
    if (formData.age && (isNaN(formData.age) || formData.age < 10 || formData.age > 100)) {
      newErrors.age = 'Age must be between 10 and 100';
    }
    
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      // If avatar is selected, upload it first
      if (avatar) {
        // In a real implementation, you would upload the avatar to a server
        // For now, we'll just show a message
        console.log('Avatar upload would happen here');
        // After successful upload, you would call:
        // updateUserAvatar(avatarUrl);
      }
      
      // Update profile
      const response = await api.put('/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        // Update the user in context
        updateUserProfile(response.data);
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export user data
      const response = await api.get('/users/export', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob' // Important for downloading files
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-data-export.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage('Data export successful! Check your downloads folder.');
    } catch (err) {
      setError('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.')) {
      try {
        // Delete the account
        const response = await api.delete('/users/account', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          // Log the user out
          logout();
          alert('Account deleted successfully. You have been logged out.');
        }
      } catch (err) {
        setError('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="profile-header">
        <h1 className="page-title">Manage Your Profile</h1>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <h2>Personal Information</h2>
          
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <AvatarUpload onAvatarChange={handleAvatarChange} />
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`form-input ${errors.age ? 'error' : ''}`}
                />
                {errors.age && <div className="error-message">{errors.age}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`form-input ${errors.gender ? 'error' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <div className="error-message">{errors.gender}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="grade" className="form-label">Current Grade/Class</label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`form-input ${errors.grade ? 'error' : ''}`}
              >
                <option value="">Select Grade</option>
                <option value="6th">6th</option>
                <option value="7th">7th</option>
                <option value="8th">8th</option>
                <option value="9th">9th</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
              {errors.grade && <div className="error-message">{errors.grade}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Academic Interests</label>
              <div className="interests-input-container">
                <div className="interest-input-group">
                  <input
                    type="text"
                    placeholder="Add an interest (e.g., Science, Math, Literature)"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    className="form-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddInterest}
                    className="btn btn-secondary"
                  >
                    Add
                  </button>
                </div>
                
                {formData.academicInterests.length > 0 && (
                  <div className="interests-tags">
                    {formData.academicInterests.map((interest, index) => (
                      <span key={index} className="interest-tag">
                        {interest}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveInterest(interest)}
                          className="remove-interest"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
                className={`form-input ${errors.location ? 'error' : ''}`}
              />
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="profile-card">
          <h2>Privacy Settings</h2>
          <div className="privacy-settings">
            <div className="form-group">
              <label className="form-label">Profile Visibility</label>
              <select
                name="profileVisibility"
                value={formData.privacySettings?.profileVisibility || 'private'}
                onChange={handlePrivacyChange}
                className="form-input"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
            
            <div className="privacy-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.privacySettings?.showEmail || false}
                  onChange={handlePrivacyToggle}
                />
                Show email address on profile
              </label>
            </div>
            
            <div className="privacy-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="showLocation"
                  checked={formData.privacySettings?.showLocation || false}
                  onChange={handlePrivacyToggle}
                />
                Show location on profile
              </label>
            </div>
            
            <div className="privacy-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="showAcademicInfo"
                  checked={formData.privacySettings?.showAcademicInfo || false}
                  onChange={handlePrivacyToggle}
                />
                Show academic information on profile
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleSavePrivacy}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
        
        <div className="profile-card">
          <h2>Account Settings</h2>
          <div className="account-actions">
            <button 
              onClick={handleDeleteAccount}
              className="btn btn-danger"
            >
              Delete Account
            </button>
            
            <button 
              onClick={handleExportData}
              className="btn btn-secondary"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagementPage;