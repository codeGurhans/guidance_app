import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import './QuizPage.css';
import './HighContrastMode.css';

const QuizPage = () => {
  const { id: assessmentId } = useParams();
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(null);
  const [highContrast, setHighContrast] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  // Toggle bookmark for current question
  const toggleBookmark = (questionId) => {
    setBookmarkedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // Handle answer selection
  const handleAnswerSelect = (value) => {
    setSelectedAnswer(value);
  };

  // Navigate to a specific question
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowReview(false);
    // Set the selected answer for this question if it exists
    const currentQuestion = assessment.questions[index];
    const existingResponse = userResponse.responses.find(
      r => r.question === currentQuestion._id
    );
    setSelectedAnswer(existingResponse ? existingResponse.answer : '');
  };

  // Submit answer and move to next question
  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedAnswer) {
      alert('Please select an answer');
      return;
    }
    
    try {
      // Calculate time taken for this question
      const timeForQuestion = timer ? Math.floor((Date.now() - timer) / 1000) : 0;
      
      // Submit the answer
      await api.post(`/quiz/assessments/${assessmentId}/questions/${assessment.questions[currentQuestionIndex]._id}`, {
        answer: selectedAnswer,
        timeTaken: timeForQuestion
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Move to next question or complete assessment
      if (currentQuestionIndex < assessment.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setTimer(Date.now());
      } else {
        // Complete the assessment
        await api.post(`/quiz/assessments/${assessmentId}/complete`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Navigate to results page
        navigate(`/quiz/${assessmentId}/results`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    }
  }, [selectedAnswer, timer, assessmentId, assessment, currentQuestionIndex, token, navigate]);

  // Apply high contrast class to body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    return () => {
      document.body.classList.remove('high-contrast');
    };
  }, [highContrast]);

  // Fetch assessment and start it if needed
  useEffect(() => {
    // Don't do anything until the auth state is resolved
    if (authLoading) {
      return;
    }

    // If auth is resolved and there's no token, user needs to log in.
    if (!token) {
      setLoading(false); // Stop the assessment loading indicator
      setError('You must be logged in to take an assessment. Please log in and try again.');
      return;
    }

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        
        // Get assessment details
        const assessmentRes = await api.get(`/quiz/assessments/${assessmentId}`);
        setAssessment(assessmentRes.data);
        
        // Start the assessment
        const startRes = await api.post(`/quiz/assessments/${assessmentId}/start`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserResponse(startRes.data.userResponse);
        setCurrentQuestionIndex(0);
        setSelectedAnswer('');
        
        // Start timer for the first question
        setTimer(Date.now());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [token, assessmentId, authLoading, navigate]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showReview) return;
      if (!assessment || !assessment.questions) return;
      
      const currentQuestion = assessment.questions[currentQuestionIndex];
      if (!currentQuestion || !currentQuestion.options) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          // Select previous option
          const prevIndex = currentQuestion.options.findIndex(opt => opt.value === selectedAnswer) - 1;
          if (prevIndex >= 0) {
            setSelectedAnswer(currentQuestion.options[prevIndex].value);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Select next option
          const nextIndex = currentQuestion.options.findIndex(opt => opt.value === selectedAnswer) + 1;
          if (nextIndex < currentQuestion.options.length) {
            setSelectedAnswer(currentQuestion.options[nextIndex].value);
          }
          break;
        case 'Enter':
          if (selectedAnswer) {
            e.preventDefault();
            handleSubmitAnswer();
          }
          break;
        case 'b':
        case 'B':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleBookmark(currentQuestion._id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, selectedAnswer, assessment, assessmentId, handleSubmitAnswer, showReview]);

  if (loading || authLoading) {
    return (
      <div className="page-container">
        <div className="loading">Loading assessment...</div>
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

  if (!assessment || !userResponse) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Assessment not found</div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const isBookmarked = bookmarkedQuestions.includes(currentQuestion._id);

  // If showing review screen
  if (showReview) {
    return (
      <div className="page-container">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="quiz-container" id="main-content">
          <div className="quiz-header">
            <div className="quiz-title-row">
              <h1>{assessment.title} - Review</h1>
              <button 
                className="btn btn-secondary btn-small"
                onClick={toggleHighContrast}
                aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
              >
                {highContrast ? "Normal View" : "High Contrast"}
              </button>
            </div>
          </div>
          
          <div className="review-container">
            <h2>Question Review</h2>
            <p>Review your answers before submitting the assessment.</p>
            
            <div className="review-stats">
              <div className="stat-card">
                <div className="stat-value">{assessment.questions.length}</div>
                <div className="stat-label">Total Questions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{userResponse.responses.length}</div>
                <div className="stat-label">Answered</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{bookmarkedQuestions.length}</div>
                <div className="stat-label">Bookmarked</div>
              </div>
            </div>
            
            <div className="question-list">
              {assessment.questions.map((question, index) => {
                const response = userResponse.responses.find(r => r.question === question._id);
                const isCurrent = index === currentQuestionIndex;
                const isBookmarked = bookmarkedQuestions.includes(question._id);
                
                return (
                  <div 
                    key={question._id} 
                    className={`question-item ${isCurrent ? 'current' : ''} ${response ? 'answered' : 'unanswered'} ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => goToQuestion(index)}
                  >
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-text">{question.text.substring(0, 50)}...</div>
                    <div className="question-status">
                      {response ? '✓' : '○'}
                    </div>
                    {isBookmarked && (
                      <div className="bookmark-indicator">★</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="review-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowReview(false)}
              >
                Back to Quiz
              </button>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  // Complete the assessment
                  try {
                    await api.post(`/quiz/assessments/${assessmentId}/complete`, {}, {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    });
                    navigate(`/quiz/${assessmentId}/results`);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to complete assessment');
                  }
                }}
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="quiz-container" id="main-content">
        <div className="quiz-header">
          <div className="quiz-title-row">
            <h1>{assessment.title}</h1>
            <div className="quiz-actions-row">
              <button 
                className="btn btn-secondary btn-small"
                onClick={toggleHighContrast}
                aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
              >
                {highContrast ? "Normal View" : "High Contrast"}
              </button>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => setShowReview(true)}
              >
                Review
              </button>
            </div>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text" aria-live="polite">
            Question {currentQuestionIndex + 1} of {assessment.questions.length}
          </div>
        </div>
        
        <div className="question-container">
          <div className="question-header">
            <h2 className="question-text">{currentQuestion.text}</h2>
            <button 
              className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={() => toggleBookmark(currentQuestion._id)}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
          </div>
          
          <div className="options-container">
            {currentQuestion.type === 'mcq' && (
              <div className="mcq-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${selectedAnswer === option.value ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(option.value)}
                    aria-pressed={selectedAnswer === option.value}
                    role="radio"
                    aria-checked={selectedAnswer === option.value}
                  >
                    <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                    <span className="option-text">{option.text}</span>
                  </button>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'rating' && (
              <div className="rating-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${selectedAnswer === option.value ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(option.value)}
                    aria-pressed={selectedAnswer === option.value}
                    role="radio"
                    aria-checked={selectedAnswer === option.value}
                  >
                    <div className="rating-text">{option.text}</div>
                    <div className="rating-value">{option.value}</div>
                  </button>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'scenario' && (
              <div className="scenario-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${selectedAnswer === option.value ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(option.value)}
                    aria-pressed={selectedAnswer === option.value}
                    role="radio"
                    aria-checked={selectedAnswer === option.value}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="quiz-actions">
          <div className="navigation-buttons">
            <button 
              className="btn btn-secondary"
              onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => currentQuestionIndex < assessment.questions.length - 1 && setCurrentQuestionIndex(prev => prev + 1)}
              disabled={currentQuestionIndex === assessment.questions.length - 1}
            >
              Next
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
          >
            {currentQuestionIndex < assessment.questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;