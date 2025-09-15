import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CutoffPredictorPage.css';

const CutoffPredictorPage = () => {
  const navigate = useNavigate();
  
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [predictionResult, setPredictionResult] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  const [compareColleges, setCompareColleges] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

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

  // Handle prediction
  const predictCutoff = async (e) => {
    e.preventDefault();
    
    if (!selectedCollege || !selectedProgram) {
      setError('Please select a college and program');
      return;
    }
    
    try {
      setPredicting(true);
      setError('');
      
      const res = await api.post('/cutoff/predict', {
        collegeId: selectedCollege,
        programName: selectedProgram,
        category: selectedCategory,
        academicYear: academicYear
      });
      
      setPredictionResult(res.data);
      
      // Fetch historical data for charting
      try {
        const historyRes = await api.get(`/cutoff/history`, {
          params: {
            collegeId: selectedCollege,
            programName: selectedProgram,
            category: selectedCategory,
            limit: 5
          }
        });
        setHistoricalData(historyRes.data);
      } catch (err) {
        console.error('Failed to load historical data:', err);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict cutoff');
    } finally {
      setPredicting(false);
    }
  };

  // Handle comparison
  const compareCutoffs = async () => {
    if (compareColleges.length < 2) {
      setError('Please select at least 2 colleges for comparison');
      return;
    }
    
    if (!selectedProgram) {
      setError('Please select a program for comparison');
      return;
    }
    
    try {
      setComparing(true);
      setError('');
      setShowComparison(true);
      
      const res = await api.post('/cutoff/compare', {
        colleges: compareColleges,
        programName: selectedProgram,
        category: selectedCategory
      });
      
      setComparisonData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare cutoffs');
    } finally {
      setComparing(false);
    }
  };

  // Toggle college for comparison
  const toggleCompareCollege = (collegeId) => {
    if (compareColleges.includes(collegeId)) {
      setCompareColleges(compareColleges.filter(id => id !== collegeId));
    } else {
      setCompareColleges([...compareColleges, collegeId]);
    }
  };

  // Get programs for selected college
  const getProgramsForCollege = () => {
    if (!selectedCollege) return [];
    
    const college = colleges.find(c => c._id === selectedCollege);
    return college ? college.programs : [];
  };

  // Get category options
  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'OBC', label: 'OBC' },
    { value: 'SC', label: 'SC' },
    { value: 'ST', label: 'ST' },
    { value: 'EWS', label: 'EWS' }
  ];

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
      <div className="cutoff-predictor-container">
        <div className="cutoff-header">
          <h1>Cutoff Predictor</h1>
          <p>Predict admission cutoffs based on historical data</p>
        </div>
        
        <div className="predictor-tabs">
          <button 
            className={`tab ${!showComparison ? 'active' : ''}`}
            onClick={() => setShowComparison(false)}
          >
            Predict Cutoff
          </button>
          <button 
            className={`tab ${showComparison ? 'active' : ''}`}
            onClick={() => setShowComparison(true)}
          >
            Compare Colleges
          </button>
        </div>
        
        {!showComparison ? (
          <div className="predictor-form">
            <form onSubmit={predictCutoff}>
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
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category:</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-select"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="academicYear">Academic Year:</label>
                  <input
                    type="number"
                    id="academicYear"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="form-input"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={predicting}
              >
                {predicting ? 'Predicting...' : 'Predict Cutoff'}
              </button>
            </form>
          </div>
        ) : (
          <div className="comparison-form">
            <div className="form-group">
              <label htmlFor="compareProgram">Program:</label>
              <select
                id="compareProgram"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a program</option>
                {colleges.flatMap(college => college.programs).map((program, index) => {
                  // Remove duplicates
                  const programNames = colleges.flatMap(c => c.programs.map(p => p.name));
                  const uniquePrograms = [...new Set(programNames)];
                  return uniquePrograms.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ));
                })}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="compareCategory">Category:</label>
              <select
                id="compareCategory"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Select Colleges to Compare:</label>
              <div className="college-checkboxes">
                {colleges.map(college => (
                  <div key={college._id} className="college-checkbox">
                    <input
                      type="checkbox"
                      id={`college-${college._id}`}
                      checked={compareColleges.includes(college._id)}
                      onChange={() => toggleCompareCollege(college._id)}
                    />
                    <label htmlFor={`college-${college._id}`}>{college.name}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={compareCutoffs}
              disabled={comparing}
            >
              {comparing ? 'Comparing...' : 'Compare Cutoffs'}
            </button>
          </div>
        )}
        
        {predictionResult && !showComparison && (
          <div className="prediction-result">
            <h2>Prediction Result</h2>
            <div className="result-card">
              <div className="result-header">
                <h3>{predictionResult.college.name}</h3>
                <span className="program-name">{predictionResult.program}</span>
                <span className="category-name">{predictionResult.category}</span>
              </div>
              
              <div className="prediction-details">
                <div className="detail-section">
                  <h4>Predicted Cutoff</h4>
                  <div className="prediction-values">
                    <div className="prediction-value">
                      <span className="label">Score:</span>
                      <span className="value">{predictionResult.prediction.predictedCutoffScore}</span>
                    </div>
                    {predictionResult.prediction.predictedCutoffRank && (
                      <div className="prediction-value">
                        <span className="label">Rank:</span>
                        <span className="value">#{predictionResult.prediction.predictedCutoffRank.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="confidence">
                    <span className="label">Confidence:</span>
                    <span className="value">{predictionResult.prediction.confidence}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Historical Data ({predictionResult.historicalData.academicYear})</h4>
                  <div className="historical-values">
                    <div className="historical-value">
                      <span className="label">Cutoff Score:</span>
                      <span className="value">{predictionResult.historicalData.cutoffScore}</span>
                    </div>
                    {predictionResult.historicalData.cutoffRank && (
                      <div className="historical-value">
                        <span className="label">Cutoff Rank:</span>
                        <span className="value">#{predictionResult.historicalData.cutoffRank.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="historical-value">
                      <span className="label">Total Seats:</span>
                      <span className="value">{predictionResult.historicalData.totalSeats}</span>
                    </div>
                    <div className="historical-value">
                      <span className="label">Admission Rate:</span>
                      <span className="value">{(predictionResult.historicalData.admissionRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Methodology</h4>
                  <p>{predictionResult.prediction.methodology}</p>
                  <div>
                    <strong>Factors Considered:</strong>
                    <ul>
                      {predictionResult.prediction.factorsConsidered.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {historicalData.length > 0 && (
              <div className="historical-chart">
                <h3>Historical Cutoff Trends</h3>
                <div className="chart-container">
                  <div className="chart">
                    {historicalData.map((data, index) => (
                      <div key={index} className="chart-bar">
                        <div 
                          className="bar" 
                          style={{ height: `${(data.cutoffScore / 100) * 200}px` }}
                        >
                          <span className="bar-value">{data.cutoffScore}</span>
                        </div>
                        <span className="bar-label">{data.academicYear}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {comparisonData.length > 0 && showComparison && (
          <div className="comparison-result">
            <h2>College Comparison</h2>
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>College</th>
                    <th>Academic Year</th>
                    <th>Cutoff Score</th>
                    <th>Cutoff Rank</th>
                    <th>Total Seats</th>
                    <th>Admission Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.college.name}</td>
                      <td>{data.academicYear}</td>
                      <td>{data.cutoffScore}</td>
                      <td>#{data.cutoffRank?.toLocaleString() || 'N/A'}</td>
                      <td>{data.totalSeats}</td>
                      <td>{(data.admissionRate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutoffPredictorPage;