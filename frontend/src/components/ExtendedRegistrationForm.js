import React, { useState } from 'react';
import Input from '../components/common/Input';
import './ExtendedRegistrationForm.css';

const ExtendedRegistrationForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    age: initialData.age || '',
    gender: initialData.gender || '',
    grade: initialData.grade || '',
    academicInterests: initialData.academicInterests || [],
    location: initialData.location || '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [interestInput, setInterestInput] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="extended-registration-form">
      <h2 className="form-title">Tell Us More About Yourself</h2>
      <p className="form-subtitle">This information helps us provide better recommendations</p>
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age" className="form-label">Age</label>
            <Input
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
              <Input
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
          <Input
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
        
        <button type="submit" className="btn btn-block btn-primary">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ExtendedRegistrationForm;