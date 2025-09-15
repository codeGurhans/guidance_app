import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EligibilityCheckerPage.css';

const EligibilityCheckerPage = () => {
  const navigate = useNavigate();
  
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [academicScore, setAcademicScore] = useState('');
  const [testScores, setTestScores] = useState([{ testName: '', score: '' }]);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const res = await api.get('/colleges');
        setColleges(res.data.colleges);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load colleges');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Handle adding a new test score field
  const addTestScore = () => {
    setTestScores([...testScores, { testName: '', score: '' }]);
  };

  // Handle removing a test score field
  const removeTestScore = (index) => {
    const newTestScores = [...testScores];
    newTestScores.splice(index, 1);
    setTestScores(newTestScores);
  };

  // Handle test score change
  const handleTestScoreChange = (index, field, value) => {
    const newTestScores = [...testScores];
    newTestScores[index][field] = value;
    setTestScores(newTestScores);
  };

  // Handle eligibility check
  const checkEligibility = async (e) => {
    e.preventDefault();
    
    if (!selectedCollege || !selectedProgram || !academicScore) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setChecking(true);
      setError('');
      
      // Prepare test scores data
      const filteredTestScores = testScores.filter(ts => ts.testName && ts.score);
      
      const res = await api.post('/applications/check', {
        collegeId: selectedCollege,
        programName: selectedProgram,
        academicScore: parseFloat(academicScore),
        testScores: filteredTestScores
      });
      
      setEligibilityResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check eligibility');
    } finally {
      setChecking(false);
    }
  };

  // Handle apply button click
  const handleApply = async () => {
    try {
      // Prepare test scores data
      const filteredTestScores = testScores.filter(ts => ts.testName && ts.score);
      
      const res = await api.post('/applications', {
        collegeId: selectedCollege,
        program: selectedProgram,
        academicScore: parseFloat(academicScore),
        testScores: filteredTestScores
      });
      
      // Redirect to applications page
      navigate('/applications');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  // Get programs for selected college
  const getProgramsForCollege = () => {
    if (!selectedCollege) return [];
    
    const college = colleges.find(c => c._id === selectedCollege);
    return college ? college.programs : [];
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
      <div className="eligibility-checker-container">
        <div className="eligibility-header">
          <h1>Eligibility Checker</h1>
          <p>Check your eligibility for various college programs</p>
        </div>
        
        <div className="eligibility-form">
          <form onSubmit={checkEligibility}>
            <div className="form-group">
              <label htmlFor="college">College:</label>
              <select
                id="college"
                value={selectedCollege}
                onChange={(e) => {
                  setSelectedCollege(e.target.value);
                  setSelectedProgram('');
                }}
                className="form-select"
                required
              >
                <option value="">Select a college</option>
                {colleges.map(college => (
                  <option key={college._id} value={college._id}>{college.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="program">Program:</label>
              <select
                id="program"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="form-select"
                required
                disabled={!selectedCollege}
              >
                <option value="">Select a program</option>
                {getProgramsForCollege().map((program, index) => (
                  <option key={index} value={program.name}>{program.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="academicScore">Academic Score (GPA/Percentage):</label>
              <input
                type="number"
                id="academicScore"
                value={academicScore}
                onChange={(e) => setAcademicScore(e.target.value)}
                className="form-input"
                step="0.01"
                min="0"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Test Scores:</label>
              {testScores.map((testScore, index) => (
                <div key={index} className="test-score-row">
                  <input
                    type="text"
                    placeholder="Test name (e.g., JEE, NEET)"
                    value={testScore.testName}
                    onChange={(e) => handleTestScoreChange(index, 'testName', e.target.value)}
                    className="form-input test-name-input"
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={testScore.score}
                    onChange={(e) => handleTestScoreChange(index, 'score', e.target.value)}
                    className="form-input test-score-input"
                    step="0.01"
                  />
                  {testScores.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestScore(index)}
                      className="btn btn-small btn-danger"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTestScore}
                className="btn btn-small btn-secondary add-test-btn"
              >
                Add Test Score
              </button>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Check Eligibility'}
            </button>
          </form>
        </div>
        
        {eligibilityResult && (
          <div className="eligibility-result">
            <h2>Eligibility Result</h2>
            <div className={`result-card ${eligibilityResult.isEligible ? 'eligible' : 'not-eligible'}`}>
              <div className="result-header">
                <h3>{eligibilityResult.college.name}</h3>
                <span className="program-name">{eligibilityResult.program.name}</span>
              </div>
              
              <div className="result-status">
                <span className={`status-badge ${eligibilityResult.isEligible ? 'eligible' : 'not-eligible'}`}>
                  {eligibilityResult.isEligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>
              
              <div className="result-details">
                <div className="detail-section">
                  <h4>Program Details</h4>
                  <p><strong>Level:</strong> {eligibilityResult.program.level}</p>
                  <p><strong>Duration:</strong> {eligibilityResult.program.duration} years</p>
                </div>
                
                <div className="detail-section">
                  <h4>Your Scores</h4>
                  <p><strong>Academic Score:</strong> {eligibilityResult.userScores.academicScore}</p>
                  {eligibilityResult.userScores.testScores && eligibilityResult.userScores.testScores.length > 0 && (
                    <div>
                      <strong>Test Scores:</strong>
                      <ul>
                        {eligibilityResult.userScores.testScores.map((test, index) => (
                          <li key={index}>{test.testName}: {test.score}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Requirements</h4>
                  <p><strong>Minimum Academic Score:</strong> {eligibilityResult.requirements.gpa || 'Not specified'}</p>
                  {eligibilityResult.requirements.standardizedTests && eligibilityResult.requirements.standardizedTests.length > 0 && (
                    <div>
                      <strong>Standardized Tests:</strong>
                      <ul>
                        {eligibilityResult.requirements.standardizedTests.map((test, index) => (
                          <li key={index}>{test.name}: Minimum {test.minimumScore}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {!eligibilityResult.isEligible && eligibilityResult.ineligibilityReasons.length > 0 && (
                  <div className="detail-section">
                    <h4>Reasons for Ineligibility</h4>
                    <ul className="ineligibility-reasons">
                      {eligibilityResult.ineligibilityReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {eligibilityResult.isEligible && (
                <div className="result-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleApply}
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibilityCheckerPage;