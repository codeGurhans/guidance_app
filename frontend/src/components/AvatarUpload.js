import React, { useState, useRef } from 'react';
import './AvatarUpload.css';

const AvatarUpload = ({ onAvatarChange }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        onAvatarChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onAvatarChange(null);
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar preview" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <span className="avatar-text">No avatar</span>
          </div>
        )}
      </div>
      
      <div className="avatar-controls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="avatar-input"
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current.click()}
          className="btn btn-secondary"
        >
          Upload Avatar
        </button>
        {avatarPreview && (
          <button 
            type="button" 
            onClick={handleRemoveAvatar}
            className="btn btn-outline"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="avatar-info">
        <small>Maximum file size: 2MB. Supported formats: JPG, PNG, GIF</small>
      </div>
    </div>
  );
};

export default AvatarUpload;