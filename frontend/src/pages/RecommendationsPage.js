import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const { id: assessmentId } = useParams();
  const { token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch career path recommendations
  useEffect(() => {
    // Don't do anything until the auth state is resolved
    if (authLoading) {
      return;
    }

    // If auth is resolved and there's no token, user needs to log in.
    if (!token) {
      setLoading(false);
      setError('You must be logged in to view recommendations.');
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/careers/recommendations/${assessmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setRecommendations(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchRecommendations();
    }
  }, [token, assessmentId, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="page-container">
        <div className="loading">Loading recommendations...</div>
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

  return (
    <div className="page-container">
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h1>Career Path Recommendations</h1>
          <p>Based on your assessment results, here are the career paths that might be a good fit for you:</p>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="recommendations-list">
            {recommendations.map((career, index) => (
              <div key={career._id} className="recommendation-card">
                <div className="recommendation-rank">#{index + 1}</div>
                <div className="recommendation-content">
                  <h2 className="recommendation-title">{career.title}</h2>
                  <p className="recommendation-description">{career.description}</p>
                  
                  <div className="recommendation-details">
                    {career.educationLevel && (
                      <div className="detail-item">
                        <strong>Education:</strong> {career.educationLevel}
                      </div>
                    )}
                    
                    {career.salaryRange && (
                      <div className="detail-item">
                        <strong>Salary Range:</strong> ${career.salaryRange.min?.toLocaleString()} - ${career.salaryRange.max?.toLocaleString()}
                      </div>
                    )}
                    
                    {career.jobGrowth && (
                      <div className="detail-item">
                        <strong>Job Growth:</strong> {career.jobGrowth}
                      </div>
                    )}
                    
                    {career.matchedCategories > 0 && (
                      <div className="detail-item">
                        <strong>Matching Categories:</strong> {career.matchedCategories}
                      </div>
                    )}
                  </div>
                  
                  {career.requiredSkills && career.requiredSkills.length > 0 && (
                    <div className="skills-section">
                      <strong>Required Skills:</strong>
                      <div className="skills-list">
                        {career.requiredSkills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="recommendation-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/careers/${career._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recommendations">
            <p>No recommendations found based on your assessment.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/quiz')}
            >
              Take Another Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;