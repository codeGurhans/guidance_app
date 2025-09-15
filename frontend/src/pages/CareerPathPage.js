import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import './CareerPathPage.css';

const CareerPathPage = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [careerPath, setCareerPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch career path details
  useEffect(() => {
    const fetchCareerPath = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/careers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCareerPath(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load career path details');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchCareerPath();
    }
  }, [token, id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading career path details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!careerPath) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Career path not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="career-path-container">
        <div className="career-path-header">
          <h1>{careerPath.title}</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
        
        <div className="career-path-content">
          <div className="career-path-section">
            <h2>Description</h2>
            <p>{careerPath.description}</p>
          </div>
          
          <div className="career-path-details">
            <div className="detail-card">
              <h3>Education Requirements</h3>
              <p>{careerPath.educationLevel || 'Not specified'}</p>
            </div>
            
            <div className="detail-card">
              <h3>Salary Range</h3>
              {careerPath.salaryRange ? (
                <p>${careerPath.salaryRange.min?.toLocaleString()} - ${careerPath.salaryRange.max?.toLocaleString()}</p>
              ) : (
                <p>Not specified</p>
              )}
            </div>
            
            <div className="detail-card">
              <h3>Job Growth</h3>
              <p>{careerPath.jobGrowth || 'Not specified'}</p>
            </div>
          </div>
          
          {careerPath.requiredSkills && careerPath.requiredSkills.length > 0 && (
            <div className="career-path-section">
              <h2>Required Skills</h2>
              <div className="skills-list">
                {careerPath.requiredSkills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {careerPath.categories && careerPath.categories.length > 0 && (
            <div className="career-path-section">
              <h2>Categories</h2>
              <div className="categories-list">
                {careerPath.categories.map((category, index) => (
                  <span key={index} className="category-tag">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerPathPage;