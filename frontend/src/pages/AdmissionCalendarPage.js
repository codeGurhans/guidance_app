import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdmissionCalendarPage.css';

const AdmissionCalendarPage = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    collegeId: '',
    program: '',
    eventType: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [colleges, setColleges] = useState([]);

  // Fetch colleges for filter dropdown
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges');
        setColleges(res.data.colleges);
      } catch (err) {
        console.error('Failed to load colleges:', err);
      }
    };

    fetchColleges();
  }, []);

  // Fetch admission events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        const query = new URLSearchParams({
          page: pagination.currentPage,
          collegeId: filters.collegeId,
          program: filters.program,
          eventType: filters.eventType,
          startDate: filters.startDate,
          endDate: filters.endDate
        }).toString();
        
        const res = await api.get(`/admission-events?${query}`);
        
        setEvents(res.data.events);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admission events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
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
      collegeId: '',
      program: '',
      eventType: '',
      startDate: '',
      endDate: ''
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

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading admission events...</div>
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
      <div className="admission-calendar-container">
        <div className="calendar-header">
          <h1>Admission Calendar</h1>
          <p>Important dates and deadlines for college admissions</p>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="collegeId">College:</label>
            <select
              id="collegeId"
              value={filters.collegeId}
              onChange={(e) => handleFilterChange('collegeId', e.target.value)}
              className="filter-select"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college._id} value={college._id}>{college.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="program">Program:</label>
            <input
              type="text"
              id="program"
              placeholder="e.g., B.Tech, MBBS"
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="eventType">Event Type:</label>
            <select
              id="eventType"
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="Application Deadline">Application Deadline</option>
              <option value="Exam Date">Exam Date</option>
              <option value="Result Declaration">Result Declaration</option>
              <option value="Counseling">Counseling</option>
              <option value="Admission Closed">Admission Closed</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-input"
            />
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
          <p>Showing {events.length} of {pagination.totalCount} events</p>
        </div>
        
        {events.length > 0 ? (
          <div className="events-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <h2 className="event-title">{event.title}</h2>
                  <span className={`event-type ${event.eventType.toLowerCase().replace(' ', '-')}`}>
                    {event.eventType}
                  </span>
                </div>
                
                <div className="event-college">
                  <p>{event.college?.name}</p>
                </div>
                
                {event.program && (
                  <div className="event-program">
                    <p><strong>Program:</strong> {event.program}</p>
                  </div>
                )}
                
                <div className="event-dates">
                  <p><strong>Date:</strong> {formatDate(event.startDate)}</p>
                  {event.endDate && event.startDate !== event.endDate && (
                    <p><strong>End Date:</strong> {formatDate(event.endDate)}</p>
                  )}
                  {!event.isAllDay && (
                    <p><strong>Time:</strong> {formatTime(event.startDate)}</p>
                  )}
                </div>
                
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
                
                {event.reminders && event.reminders.length > 0 && (
                  <div className="event-reminders">
                    <p><strong>Reminders:</strong> {event.reminders.length} reminder(s) set</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No admission events found matching your criteria.</p>
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

export default AdmissionCalendarPage;