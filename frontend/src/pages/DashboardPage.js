import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-container">
      <h1 className="page-title" style={{fontWeight: "bold", fontSize: "2rem"}}>Welcome to Your Dashboard</h1>
      
      <div className="dashboard-card">
        <h2 style={{fontWeight: "bold", fontSize: "1.5rem"}}>Your Profile</h2>
        <div className="profile-info">
          <p><strong>Email:</strong> {user?.email}</p>
          {user?.age && <p><strong>Age:</strong> {user.age}</p>}
          {user?.gender && <p><strong>Gender:</strong> {user.gender}</p>}
          {user?.grade && <p><strong>Grade:</strong> {user.grade}</p>}
          {user?.location && <p><strong>Location:</strong> {user.location}</p>}
          {user?.academicInterests && user.academicInterests.length > 0 && (
            <div>
              <strong>Academic Interests:</strong>
              <div className="interests-tags">
                {user.academicInterests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="dashboard-actions">
          <Link to="/profile/manage" className="btn btn-secondary">
            Edit Profile
          </Link>
          <Link to="/quiz/1" className="btn btn-primary">
            Take Assessment Quiz
          </Link>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h2 style={{fontWeight: "bold", fontSize: "1.5rem"}}>Analytics & Insights</h2>
        <p>Track your progress and gain insights from your assessments:</p>
        <div className="dashboard-actions">
          <Link to="/analytics" className="btn btn-primary">
            View Analytics Dashboard
          </Link>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h2 style={{fontWeight: "bold", fontSize: "1.5rem"}}>Your Recommendations</h2>
        <p style={{marginBottom: "1rem"}}>Based on your profile, we recommend exploring these career paths:</p>
        <ul className="recommendations-list">
          <li>Science and Technology</li>
          <li>Engineering</li>
          <li>Medicine</li>
        </ul>
        <Link to="/recommendations/1" className="btn btn-outline" style={{marginTop: "1rem"}}>
          View All Recommendations
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;