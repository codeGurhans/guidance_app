import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CollegesPage.css';

const CollegesPage = () => {
  const navigate = useNavigate();
  
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    program: '',
    facility: '',
    minGpa: '',
    maxGpa: '',
    minFees: '',
    maxFees: '',
    accreditation: '',
    establishedBefore: '',
    establishedAfter: '',
    studentCapacityMin: '',
    studentCapacityMax: '',
    latitude: '',
    longitude: '',
    radius: '50' // Default radius in kilometers
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [locationError, setLocationError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        setLocationError('');
        
        const query = new URLSearchParams({
          page: pagination.currentPage,
          search: searchTerm,
          type: filters.type,
          program: filters.program,
          facility: filters.facility,
          minGpa: filters.minGpa,
          maxGpa: filters.maxGpa,
          minFees: filters.minFees,
          maxFees: filters.maxFees,
          accreditation: filters.accreditation,
          establishedBefore: filters.establishedBefore,
          establishedAfter: filters.establishedAfter,
          studentCapacityMin: filters.studentCapacityMin,
          studentCapacityMax: filters.studentCapacityMax,
          latitude: filters.latitude,
          longitude: filters.longitude,
          radius: filters.radius
        }).toString();
        
        const res = await api.get(`/colleges?${query}`);
        
        setColleges(res.data.colleges);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load colleges');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [searchTerm, filters, pagination.currentPage]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

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
    setSearchTerm('');
    setFilters({
      type: '',
      program: '',
      facility: '',
      minGpa: '',
      maxGpa: '',
      minFees: '',
      maxFees: '',
      accreditation: '',
      establishedBefore: '',
      establishedAfter: '',
      studentCapacityMin: '',
      studentCapacityMax: '',
      latitude: '',
      longitude: '',
      radius: '50'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setLocationError('');
    setShowAdvancedFilters(false);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFilters(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setLocationError('');
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        setLocationError(errorMessage);
      }
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading colleges...</div>
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
      <div className="colleges-container">
        <div className="colleges-header">
          <h1>Government Colleges Directory</h1>
          <p>Discover government colleges and universities across India</p>
        </div>
        
        <div className="search-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search colleges, cities, or states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </form>
          
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="type">College Type:</label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Institute">Institute</option>
                <option value="Polytechnic">Polytechnic</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="program">Program:</label>
              <input
                type="text"
                id="program"
                placeholder="e.g., Engineering, Medicine"
                value={filters.program}
                onChange={(e) => handleFilterChange('program', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="facility">Facility:</label>
              <input
                type="text"
                id="facility"
                placeholder="e.g., Hostel, Library"
                value={filters.facility}
                onChange={(e) => handleFilterChange('facility', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="radius">Radius (km):</label>
              <input
                type="number"
                id="radius"
                min="1"
                max="500"
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group location-filters">
              <label>Find Nearby Colleges:</label>
              <div className="location-inputs">
                <button 
                  type="button" 
                  onClick={getCurrentLocation}
                  className="btn btn-secondary"
                >
                  Find Colleges Near Me
                </button>
                {locationError && (
                  <div className="alert alert-error location-error">{locationError}</div>
                )}
                <div className="coordinates-inputs">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={filters.latitude}
                    onChange={(e) => handleFilterChange('latitude', e.target.value)}
                    className="filter-input coordinate-input"
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={filters.longitude}
                    onChange={(e) => handleFilterChange('longitude', e.target.value)}
                    className="filter-input coordinate-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <button 
                type="button" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="btn btn-secondary"
              >
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
            </div>
            
            {showAdvancedFilters && (
              <>
                <div className="filter-group">
                  <label htmlFor="minGpa">Min GPA:</label>
                  <input
                    type="number"
                    id="minGpa"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.minGpa}
                    onChange={(e) => handleFilterChange('minGpa', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="maxGpa">Max GPA:</label>
                  <input
                    type="number"
                    id="maxGpa"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.maxGpa}
                    onChange={(e) => handleFilterChange('maxGpa', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="minFees">Min Fees (₹):</label>
                  <input
                    type="number"
                    id="minFees"
                    min="0"
                    value={filters.minFees}
                    onChange={(e) => handleFilterChange('minFees', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="maxFees">Max Fees (₹):</label>
                  <input
                    type="number"
                    id="maxFees"
                    min="0"
                    value={filters.maxFees}
                    onChange={(e) => handleFilterChange('maxFees', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="accreditation">Accreditation:</label>
                  <select
                    id="accreditation"
                    value={filters.accreditation}
                    onChange={(e) => handleFilterChange('accreditation', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="Accredited">Accredited</option>
                    <option value="Provisional">Provisional</option>
                    <option value="Not Accredited">Not Accredited</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="establishedAfter">Established After:</label>
                  <input
                    type="number"
                    id="establishedAfter"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={filters.establishedAfter}
                    onChange={(e) => handleFilterChange('establishedAfter', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="establishedBefore">Established Before:</label>
                  <input
                    type="number"
                    id="establishedBefore"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={filters.establishedBefore}
                    onChange={(e) => handleFilterChange('establishedBefore', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="studentCapacityMin">Min Student Capacity:</label>
                  <input
                    type="number"
                    id="studentCapacityMin"
                    min="0"
                    value={filters.studentCapacityMin}
                    onChange={(e) => handleFilterChange('studentCapacityMin', e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="studentCapacityMax">Max Student Capacity:</label>
                  <input
                    type="number"
                    id="studentCapacityMax"
                    min="0"
                    value={filters.studentCapacityMax}
                    onChange={(e) => handleFilterChange('studentCapacityMax', e.target.value)}
                    className="filter-input"
                  />
                </div>
              </>
            )}
            
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
        </div>
        
        <div className="results-info">
          <p>Showing {colleges.length} of {pagination.totalCount} colleges</p>
        </div>
        
        {colleges.length > 0 ? (
          <div className="colleges-list">
            {colleges.map(college => (
              <div key={college._id} className="college-card">
                <div className="college-header">
                  <h2 className="college-name">{college.name}</h2>
                  <span className="college-type">{college.type}</span>
                </div>
                
                <div className="college-location">
                  <p>{college.address?.city}, {college.address?.state}</p>
                  {college.location && (
                    <p className="distance-info">
                      {filters.latitude && filters.longitude && college.distance 
                        ? `Approx. ${Math.round(college.distance)} km away` 
                        : ''}
                    </p>
                  )}
                </div>
                
                {college.description && (
                  <p className="college-description">{college.description.substring(0, 150)}...</p>
                )}
                
                <div className="college-details">
                  {college.programs && college.programs.length > 0 && (
                    <div className="detail-item">
                      <strong>Programs:</strong> {college.programs.length} available
                    </div>
                  )}
                  
                  {college.facilities && college.facilities.length > 0 && (
                    <div className="detail-item">
                      <strong>Facilities:</strong> {college.facilities.slice(0, 3).join(', ')}
                      {college.facilities.length > 3 && ` +${college.facilities.length - 3} more`}
                    </div>
                  )}
                  
                  {college.fees && college.fees.undergraduate && (
                    <div className="detail-item">
                      <strong>UG Fees:</strong> ₹{college.fees.undergraduate.toLocaleString()}/year
                    </div>
                  )}
                  
                  {college.admissionRequirements && college.admissionRequirements.gpa && (
                    <div className="detail-item">
                      <strong>Min GPA Required:</strong> {college.admissionRequirements.gpa}
                    </div>
                  )}
                  
                  {college.accreditation && college.accreditation.status && (
                    <div className="detail-item">
                      <strong>Accreditation:</strong> {college.accreditation.status}
                    </div>
                  )}
                </div>
                
                <div className="college-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/colleges/${college._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No colleges found matching your criteria.</p>
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

export default CollegesPage;