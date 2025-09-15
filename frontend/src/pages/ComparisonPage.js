import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import { BarChart, RadarChart } from '../components/common/Visualization';
import './ComparisonPage.css';

const ComparisonPage = () => {
  const { token } = useContext(AuthContext);
  
  const [selectedCareerPaths, setSelectedCareerPaths] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle career path selection
  const handleCareerPathSelect = (careerPathId) => {
    if (selectedCareerPaths.includes(careerPathId)) {
      setSelectedCareerPaths(selectedCareerPaths.filter(id => id !== careerPathId));
    } else if (selectedCareerPaths.length < 3) {
      setSelectedCareerPaths([...selectedCareerPaths, careerPathId]);
    }
  };

  // Compare selected career paths
  const handleCompare = async () => {
    if (selectedCareerPaths.length < 2) {
      setError('Please select at least 2 career paths to compare');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const res = await api.post('/careers/compare', {
        careerPathIds: selectedCareerPaths
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setComparisonData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare career paths');
    } finally {
      setLoading(false);
    }
  };

  // Reset comparison
  const handleReset = () => {
    setSelectedCareerPaths([]);
    setComparisonData(null);
    setError('');
  };

  // Sample career paths data (in a real app, you would fetch this from the API)
  const sampleCareerPaths = [
    { id: '1', title: 'Software Engineer' },
    { id: '2', title: 'Data Scientist' },
    { id: '3', title: 'Medical Doctor' },
    { id: '4', title: 'Teacher' },
    { id: '5', title: 'Marketing Manager' }
  ];

  return (
    <div className="page-container">
      <div className="comparison-container">
        <div className="comparison-header">
          <h1>Career Path Comparison</h1>
          <p>Select up to 3 career paths to compare their details side by side</p>
        </div>
        
        {error && (
          <div className="alert alert-error">{error}</div>
        )}
        
        {!comparisonData ? (
          <div className="selection-section">
            <div className="career-paths-grid">
              {sampleCareerPaths.map(career => (
                <div 
                  key={career.id}
                  className={`career-path-card ${selectedCareerPaths.includes(career.id) ? 'selected' : ''}`}
                  onClick={() => handleCareerPathSelect(career.id)}
                >
                  <h3>{career.title}</h3>
                  <div className="selection-indicator">
                    {selectedCareerPaths.includes(career.id) ? 'Selected' : 'Click to select'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="comparison-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCompare}
                disabled={selectedCareerPaths.length < 2 || loading}
              >
                {loading ? 'Comparing...' : 'Compare Selected'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="comparison-results">
            <div className="comparison-header">
              <h2>Comparison Results</h2>
              <div className="comparison-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  Compare Different Paths
                </button>
              </div>
            </div>
            
            {/* Education Level Comparison */}
            <div className="comparison-section">
              <h3>Education Level</h3>
              <div className="education-comparison">
                {comparisonData.careerPaths.map(career => (
                  <div key={career._id} className="education-card">
                    <h4>{career.title}</h4>
                    <p>{career.educationLevel || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Salary Range Comparison */}
            <div className="comparison-section">
              <h3>Salary Range</h3>
              <div className="salary-comparison">
                {comparisonData.careerPaths.map(career => (
                  <div key={career._id} className="salary-card">
                    <h4>{career.title}</h4>
                    {career.salaryRange ? (
                      <p>${career.salaryRange.min?.toLocaleString()} - ${career.salaryRange.max?.toLocaleString()}</p>
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Job Growth Comparison */}
            <div className="comparison-section">
              <h3>Job Growth</h3>
              <div className="job-growth-comparison">
                {comparisonData.careerPaths.map(career => (
                  <div key={career._id} className="job-growth-card">
                    <h4>{career.title}</h4>
                    <p>{career.jobGrowth || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Required Skills Comparison */}
            <div className="comparison-section">
              <h3>Required Skills</h3>
              <div className="skills-comparison">
                {comparisonData.careerPaths.map(career => (
                  <div key={career._id} className="skills-card">
                    <h4>{career.title}</h4>
                    {career.requiredSkills && career.requiredSkills.length > 0 ? (
                      <div className="skills-list">
                        {career.requiredSkills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                        {career.requiredSkills.length > 5 && (
                          <span className="skill-tag more-skills">
                            +{career.requiredSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visualization Section */}
            <div className="comparison-section">
              <h3>Visualization</h3>
              <div className="visualization-section">
                <BarChart 
                  data={[
                    ...comparisonData.careerPaths.map(career => ({
                      label: career.title,
                      value: career.salaryRange ? career.salaryRange.max : 0,
                      color: '#4f46e5'
                    }))
                  ]}
                  title="Maximum Salary Comparison"
                  xAxisLabel="Career Paths"
                  yAxisLabel="Salary ($)"
                />
                
                <RadarChart 
                  data={[
                    ...comparisonData.careerPaths.map((career, index) => ({
                      label: career.title,
                      value: index + 1, // Placeholder value for demonstration
                      color: `hsl(${index * 60}, 70%, 50%)`
                    }))
                  ]}
                  title="Skill Requirements Comparison"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;