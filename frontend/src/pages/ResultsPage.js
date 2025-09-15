import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import { BarChart, RadarChart, ProgressRing, LineChart } from '../components/common/Visualization';
import './ResultsPage.css';

// Simple bar chart component
const SimpleBarChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(item => item.score));
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div 
              className="bar" 
              style={{ height: `${(item.score / maxValue) * 100}%` }}
            ></div>
            <div className="bar-label">{item.category}</div>
            <div className="bar-value">{item.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsPage = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch assessment results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/quiz/results/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setResults(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchResults();
    }
  }, [token, id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading results...</div>
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

  if (!results) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Results not found</div>
      </div>
    );
  }

  // Calculate time taken
  const startTime = new Date(results.startTime);
  const endTime = new Date(results.endTime);
  const timeDiff = endTime - startTime;
  const minutes = Math.floor(timeDiff / 60000);
  const seconds = Math.floor((timeDiff % 60000) / 1000);

  return (
    <div className="page-container">
      <div className="results-container">
        <div className="results-header">
          <h1>{results.assessment.title} - Results</h1>
          <p className="results-date">
            Completed on {new Date(results.endTime).toLocaleDateString()}
          </p>
        </div>
        
        <div className="results-summary">
          <div className="score-card">
            <h2>Your Score</h2>
            <div className="score-value">{results.score}</div>
            <div className="score-text">out of {results.maxScore || results.assessment.questions.length} points</div>
          </div>
          
          <div className="time-card">
            <h2>Time Taken</h2>
            <div className="time-value">
              {minutes}m {seconds}s
            </div>
          </div>
          
          <div className="accuracy-card">
            <h2>Accuracy</h2>
            <div className="accuracy-value">
              {results.responses.length > 0 && results.maxScore > 0 
                ? Math.round((results.score / results.maxScore) * 100) 
                : 0}%
            </div>
            <div className="accuracy-text">Questions answered</div>
          </div>
        </div>
        
        {/* Category Scores Visualization */}
        <div className="results-details">
          <h2>Category Scores</h2>
          {results.categoryScores && results.categoryScores.length > 0 ? (
            <div className="visualization-section">
              <RadarChart 
                data={results.categoryScores.map(score => ({
                  label: score.category,
                  value: score.score
                }))}
                title="Your Category Scores"
              />
              
              <BarChart 
                data={results.categoryScores.map(score => ({
                  label: score.category,
                  value: score.score
                }))}
                title="Category Scores Comparison"
                xAxisLabel="Categories"
                yAxisLabel="Score"
              />
            </div>
          ) : (
            <p>No category scores available.</p>
          )}
          
          {/* Time Analytics */}
          {results.timeAnalytics && (
            <div className="analytics-section">
              <h2>Time Analytics</h2>
              <div className="time-distribution">
                <h3>Time Distribution</h3>
                {results.timeAnalytics.timeDistribution && results.timeAnalytics.timeDistribution.length > 0 ? (
                  <BarChart 
                    data={results.timeAnalytics.timeDistribution.map(distribution => ({
                      label: distribution.range,
                      value: distribution.count
                    }))}
                    title="Time Spent Distribution"
                    xAxisLabel="Time Ranges"
                    yAxisLabel="Number of Questions"
                  />
                ) : (
                  <p>No time distribution data available.</p>
                )}
              </div>
              
              <div className="average-time">
                <h3>Average Time Per Question</h3>
                <div className="time-display">
                  {Math.round(results.timeAnalytics.averageTimePerQuestion)} seconds
                </div>
              </div>
            </div>
          )}
          
          {/* Difficulty Analytics */}
          {results.difficultyAnalytics && (
            <div className="analytics-section">
              <h2>Difficulty Analytics</h2>
              <div className="difficulty-distribution">
                <h3>Question Difficulty Distribution</h3>
                {results.difficultyAnalytics.distribution && results.difficultyAnalytics.distribution.length > 0 ? (
                  <BarChart 
                    data={results.difficultyAnalytics.distribution.map(difficulty => ({
                      label: `Level ${difficulty.difficulty}`,
                      value: difficulty.count
                    }))}
                    title="Question Difficulty Distribution"
                    xAxisLabel="Difficulty Levels"
                    yAxisLabel="Number of Questions"
                  />
                ) : (
                  <p>No difficulty distribution data available.</p>
                )}
              </div>
              
              {results.difficultyAnalytics.performanceByDifficulty && results.difficultyAnalytics.performanceByDifficulty.length > 0 && (
                <div className="performance-by-difficulty">
                  <h3>Performance by Difficulty</h3>
                  <BarChart 
                    data={results.difficultyAnalytics.performanceByDifficulty.map(performance => ({
                      label: `Level ${performance.difficulty}`,
                      value: performance.accuracy
                    }))}
                    title="Accuracy by Difficulty Level"
                    xAxisLabel="Difficulty Levels"
                    yAxisLabel="Accuracy (%)"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Progress Tracking */}
          {results.progressTracking && results.progressTracking.length > 0 && (
            <div className="analytics-section">
              <h2>Progress Tracking</h2>
              <LineChart 
                data={results.progressTracking.map(tracking => ({
                  label: `Q${tracking.questionIndex + 1}`,
                  value: tracking.cumulativeScore
                }))}
                title="Cumulative Score Progress"
                xAxisLabel="Questions"
                yAxisLabel="Cumulative Score"
              />
            </div>
          )}
          
          {/* Detailed Results */}
          <h2>Detailed Results</h2>
          <div className="responses-list">
            {results.responses.map((response, index) => (
              <div key={index} className="response-item">
                <div className="response-question">
                  <strong>Q{index + 1}:</strong> {response.question.text}
                </div>
                <div className="response-answer">
                  <strong>Your answer:</strong> {response.answer}
                </div>
                {response.timeTaken && (
                  <div className="response-time">
                    Time taken: {response.timeTaken} seconds
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="results-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/recommendations/${id}`)}
          >
            View Recommendations
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/quiz/${id}`)}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;