import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/common/Input';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    grade: '',
    academicInterests: [],
    location: '',
  });
  
  const [interestInput, setInterestInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    setError('');
    
    // Basic frontend validation
    const newErrors = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
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
      // Prepare data for API call (remove confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      
      // Register user
      await api.post('/users/register', registrationData);
      
      // Login user after registration
      await login(formData.email, formData.password);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Create Your Account</h1>
      <div className="form-container">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`form-input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
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
          
          <button 
            type="submit" 
            className="btn btn-block btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;