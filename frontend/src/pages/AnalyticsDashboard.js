import React, { useState, useEffect, useContext } from 'react';
import { BarChart, PieChart, RadarChart, ProgressRing, LineChart, ScatterPlot } from '../components/common/Visualization';
import AuthContext from '../contexts/AuthContext';
import { getUserAnalytics } from '../services/analyticsService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { token, user } = useContext(AuthContext);
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch real analytics data
        const data = await getUserAnalytics(user._id);
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchAnalyticsData();
    }
  }, [token, user]);

  // If not authenticated, show a clear message instead of an infinite loader
  if (!token || !user) {
    return (
      <div className="page-container">
        <div className="alert alert-error">You must be logged in to view analytics.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading analytics dashboard...</div>
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

  if (!analyticsData) {
    return (
      <div className="page-container">
        <div className="alert alert-error">No analytics data available</div>
      </div>
    );
  }

  // Prepare data for visualizations
  const progressData = [
    { label: 'Assessments', value: analyticsData.progress.completedAssessments },
    { label: 'Career Paths', value: analyticsData.careerPathsExplored },
    { label: 'Skills', value: Object.keys(analyticsData.skillDevelopment).length }
  ];

  const categoryScoresData = Object.keys(analyticsData.skillDevelopment).map(category => ({
    label: category,
    value: analyticsData.skillDevelopment[category].currentScore
  }));

  const skillGapData = Object.keys(analyticsData.skillDevelopment).flatMap(category => [
    { 
      label: `${category} (Current)`, 
      value: analyticsData.skillDevelopment[category].currentScore,
      color: '#4f46e5' 
    },
    { 
      label: `${category} (Required)`, 
      value: analyticsData.skillDevelopment[category].required,
      color: '#ef4444' 
    }
  ]);

  return (
    <div className="page-container">
      <div className="analytics-dashboard">
        <div className="dashboard-header">
          <h1 className="page-title" style={{fontWeight: "bold", fontSize: "2rem"}}>Your Analytics Dashboard</h1>
          <p style={{fontWeight: "bold", fontSize: "1.2rem"}}>Welcome back, {user?.email}. Here's your progress overview.</p>
        </div>
        
        {/* Progress Summary Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>Total Assessments</h3>
            <div className="card-value">{analyticsData.progress.totalAssessments}</div>
          </div>
          
          <div className="dashboard-card">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>Completed Assessments</h3>
            <div className="card-value">{analyticsData.progress.completedAssessments}</div>
          </div>
          
          <div className="dashboard-card">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>Career Paths Explored</h3>
            <div className="card-value">{analyticsData.careerPathsExplored}</div>
          </div>
          
          <div className="dashboard-card">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>Skills Identified</h3>
            <div className="card-value">{Object.keys(analyticsData.skillDevelopment).length}</div>
          </div>
        </div>
        
        {/* Category Scores Visualization */}
        <div className="dashboard-section">
          <h2 style={{fontWeight: "bold", fontSize: "1.5rem"}}>Your Category Scores</h2>
          <div className="visualization-wrapper">
            <RadarChart 
              data={categoryScoresData}
              title="Category Scores Comparison"
            />
          </div>
        </div>
        
        {/* Skill Gap Analysis */}
        <div className="dashboard-section">
          <h2 style={{fontWeight: "bold", fontSize: "1.5rem"}}>Skill Gap Analysis</h2>
          <div className="visualization-wrapper">
            <BarChart 
              data={skillGapData}
              title="Current vs Required Skills"
              xAxisLabel="Skills"
              yAxisLabel="Proficiency (%)"
            />
          </div>
        </div>
        
        {/* Progress Rings for Key Metrics */}
        <div className="dashboard-section">
          <h2 style={{fontWeight: "bold", fontSize: "1.5rem"}}>Progress Overview</h2>
          <div className="progress-rings-container">
            <ProgressRing 
              value={analyticsData.progress.completedAssessments}
              max={analyticsData.progress.totalAssessments}
              title="Assessments Completed"
              color="#4f46e5"
            />
            
            <ProgressRing 
              value={analyticsData.progress.overallProgress}
              max={100}
              title="Overall Progress"
              color="#10b981"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;