import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ApplicationsPage.css';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        const query = new URLSearchParams({
          page: pagination.currentPage,
          status: filters.status
        }).toString();
        
        const res = await api.get(`/applications?${query}`);
        
        setApplications(res.data.applications);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filters, pagination.currentPage]);

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading applications...</div>
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
      <div className="applications-container">
        <div className="applications-header">
          <h1>My Applications</h1>
          <p>Track the status of your college applications</p>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Documents Submitted">Documents Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Waitlisted">Waitlisted</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
          
          <div className="filter-group">
            <button 
              type="button" 
              onClick={resetFilters}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <div className="results-info">
          <p>Showing {applications.length} of {pagination.totalCount} applications</p>
        </div>
        
        {applications.length > 0 ? (
          <div className="applications-list">
            {applications.map(application => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <h2 className="application-title">{application.college?.name}</h2>
                  <span className={`application-status ${application.status.toLowerCase().replace(' ', '-')}`}>
                    {application.status}
                  </span>
                </div>
                
                <div className="application-program">
                  <p><strong>Program:</strong> {application.program}</p>
                </div>
                
                <div className="application-details">
                  <p><strong>Applied on:</strong> {formatDate(application.applicationDate)}</p>
                  <p><strong>Academic Score:</strong> {application.academicScore}</p>
                  {application.testScores && application.testScores.length > 0 && (
                    <div>
                      <strong>Test Scores:</strong>
                      <ul>
                        {application.testScores.map((test, index) => (
                          <li key={index}>{test.testName}: {test.score}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="application-actions">
                  <Link 
                    to={`/applications/${application._id}`}
                    className="btn btn-secondary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No applications found matching your criteria.</p>
            <button 
              className="btn btn-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button 
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;