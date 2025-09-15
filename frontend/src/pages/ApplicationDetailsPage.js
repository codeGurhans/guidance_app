import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ApplicationDetailsPage.css';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/applications/${id}`);
        setApplication(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    const fetchStatusHistory = async () => {
      try {
        const res = await api.get(`/applications/${id}/history`);
        setStatusHistory(res.data);
      } catch (err) {
        console.error('Failed to load status history:', err);
      }
    };

    if (id) {
      fetchApplication();
      fetchStatusHistory();
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Update application status
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      const res = await api.put(`/applications/${id}`, { status: newStatus });
      setApplication(res.data);
      
      // Refresh status history
      const historyRes = await api.get(`/applications/${id}/history`);
      setStatusHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading application details...</div>
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

  if (!application) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Application not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="application-details-container">
        <div className="application-header">
          <Link to="/applications" className="btn btn-secondary back-button">
            ← Back to Applications
          </Link>
          <h1>Application Details</h1>
          <span className={`application-status ${application.status.toLowerCase().replace(' ', '-')}`}>
            {application.status}
          </span>
        </div>
        
        <div className="application-summary">
          <div className="summary-card">
            <h2>{application.college?.name}</h2>
            <p><strong>Program:</strong> {application.program}</p>
            <p><strong>Applied on:</strong> {formatDate(application.applicationDate)}</p>
            <p><strong>Academic Score:</strong> {application.academicScore}</p>
          </div>
        </div>
        
        <div className="application-sections">
          <div className="section">
            <h3>Test Scores</h3>
            {application.testScores && application.testScores.length > 0 ? (
              <div className="scores-list">
                {application.testScores.map((test, index) => (
                  <div key={index} className="score-item">
                    <span className="test-name">{test.testName}</span>
                    <span className="test-score">{test.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No test scores provided</p>
            )}
          </div>
          
          <div className="section">
            <h3>Documents</h3>
            {application.documents && application.documents.length > 0 ? (
              <div className="documents-list">
                {application.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <span className="document-name">{doc.name}</span>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-small btn-secondary"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p>No documents uploaded</p>
            )}
          </div>
          
          {application.interview && (
            <div className="section">
              <h3>Interview Details</h3>
              <div className="interview-details">
                <p><strong>Scheduled Date:</strong> {formatDate(application.interview.scheduledDate)}</p>
                <p><strong>Location:</strong> {application.interview.location}</p>
                <p><strong>Interviewer:</strong> {application.interview.interviewer}</p>
                {application.interview.feedback && (
                  <p><strong>Feedback:</strong> {application.interview.feedback}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="section">
            <h3>Status History</h3>
            {statusHistory.length > 0 ? (
              <div className="history-timeline">
                {statusHistory.map((historyItem, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">{formatDate(historyItem.date)}</div>
                    <div className="history-content">
                      <span className={`history-status ${historyItem.status.toLowerCase().replace(' ', '-')}`}>
                        {historyItem.status}
                      </span>
                      {historyItem.notes && (
                        <p className="history-notes">{historyItem.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No status history available</p>
            )}
          </div>
        </div>
        
        <div className="application-actions">
          {application.status === 'Applied' && (
            <button 
              className="btn btn-primary"
              onClick={() => updateStatus('Documents Submitted')}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Mark Documents Submitted'}
            </button>
          )}
          
          {application.status === 'Documents Submitted' && (
            <button 
              className="btn btn-primary"
              onClick={() => updateStatus('Under Review')}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Submit for Review'}
            </button>
          )}
          
          {application.status === 'Accepted' && (
            <button className="btn btn-success">
              Congratulations! Application Accepted
            </button>
          )}
          
          {application.status === 'Rejected' && (
            <button className="btn btn-danger">
              Application Rejected
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;