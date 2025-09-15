import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';
import './CollegeDetailsPage.css';

const CollegeDetailsPage = () => {
  const { id: collegeId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    content: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch college details
  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/colleges/${collegeId}`);
        
        setCollege(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load college details');
      } finally {
        setLoading(false);
      }
    };

    if (collegeId) {
      fetchCollege();
    }
  }, [collegeId]);

  // Fetch reviews and ratings
  useEffect(() => {
    const fetchReviewsAndRatings = async () => {
      try {
        // Fetch average rating
        const ratingRes = await api.get(`/reviews/colleges/${collegeId}/average`);
        setAverageRating(ratingRes.data.averageRating);
        setTotalReviews(ratingRes.data.totalReviews);
        
        // Fetch reviews
        const reviewsRes = await api.get(`/reviews/colleges/${collegeId}`);
        setReviews(reviewsRes.data.reviews);
      } catch (err) {
        console.error('Failed to load reviews and ratings:', err);
      }
    };

    if (collegeId) {
      fetchReviewsAndRatings();
    }
  }, [collegeId]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading college details...</div>
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

  // Handle review form change
  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle rating change
  const handleRatingChange = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.rating || !reviewForm.title || !reviewForm.content) {
      setReviewError('Please fill in all fields');
      return;
    }
    
    try {
      setReviewLoading(true);
      setReviewError('');
      
      const res = await api.post(`/reviews/colleges/${collegeId}`, reviewForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Add new review to the list
      setReviews(prev => [res.data, ...prev]);
      
      // Update average rating and total reviews
      const ratingRes = await api.get(`/reviews/colleges/${collegeId}/average`);
      setAverageRating(ratingRes.data.averageRating);
      setTotalReviews(ratingRes.data.totalReviews);
      
      // Reset form and hide it
      setReviewForm({ rating: 0, title: '', content: '' });
      setShowReviewForm(false);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  // Mark a review as helpful
  const markReviewAsHelpful = async (reviewId) => {
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the review in the list
      setReviews(prev => 
        prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: res.data.helpfulCount } 
            : review
        )
      );
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
    }
  };

  if (!college) {
    return (
      <div className="page-container">
        <div className="alert alert-error">College not found</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="college-details-container">
        <div className="college-header">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>{college.name}</h1>
          <span className="college-type">{college.type}</span>
        </div>
        
        <div className="college-content">
          <div className="college-section">
            <h2>About</h2>
            <p>{college.description}</p>
          </div>
          
          <div className="college-section">
            <h2>Contact Information</h2>
            <div className="contact-details">
              <div className="contact-item">
                <strong>Address:</strong>
                <p>
                  {college.address?.street}<br />
                  {college.address?.city}, {college.address?.state} {college.address?.zipCode}<br />
                  {college.address?.country}
                </p>
              </div>
              
              {college.contact?.phone && (
                <div className="contact-item">
                  <strong>Phone:</strong>
                  <p>{college.contact.phone}</p>
                </div>
              )}
              
              {college.contact?.email && (
                <div className="contact-item">
                  <strong>Email:</strong>
                  <p>{college.contact.email}</p>
                </div>
              )}
              
              {college.contact?.website && (
                <div className="contact-item">
                  <strong>Website:</strong>
                  <p>
                    <a 
                      href={college.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {college.contact.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="college-section">
            <h2>Programs Offered</h2>
            {college.programs && college.programs.length > 0 ? (
              <div className="programs-list">
                {college.programs.map((program, index) => (
                  <div key={index} className="program-card">
                    <h3>{program.name}</h3>
                    <div className="program-details">
                      <p><strong>Level:</strong> {program.level}</p>
                      <p><strong>Duration:</strong> {program.duration} years</p>
                      <p>{program.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No programs information available.</p>
            )}
          </div>
          
          <div className="college-section">
            <h2>Admission Requirements</h2>
            {college.admissionRequirements ? (
              <div className="admission-details">
                {college.admissionRequirements.gpa && (
                  <p><strong>Minimum GPA:</strong> {college.admissionRequirements.gpa}</p>
                )}
                
                {college.admissionRequirements.standardizedTests && 
                 college.admissionRequirements.standardizedTests.length > 0 && (
                  <div>
                    <strong>Standardized Tests:</strong>
                    <ul>
                      {college.admissionRequirements.standardizedTests.map((test, index) => (
                        <li key={index}>
                          {test.name}: Minimum score {test.minimumScore}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {college.admissionRequirements.additionalRequirements && 
                 college.admissionRequirements.additionalRequirements.length > 0 && (
                  <div>
                    <strong>Additional Requirements:</strong>
                    <ul>
                      {college.admissionRequirements.additionalRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p>No admission requirements information available.</p>
            )}
          </div>
          
          <div className="college-section">
            <h2>Facilities</h2>
            {college.facilities && college.facilities.length > 0 ? (
              <div className="facilities-list">
                {college.facilities.map((facility, index) => (
                  <span key={index} className="facility-tag">
                    {facility}
                  </span>
                ))}
              </div>
            ) : (
              <p>No facilities information available.</p>
            )}
          </div>
          
          <div className="college-section">
            <h2>Additional Information</h2>
            <div className="additional-details">
              {college.established && (
                <p><strong>Established:</strong> {college.established}</p>
              )}
              
              {college.studentCapacity && (
                <p><strong>Student Capacity:</strong> {college.studentCapacity.toLocaleString()}</p>
              )}
              
              {college.accreditation && (
                <p>
                  <strong>Accreditation:</strong> {college.accreditation.status}
                  {college.accreditation.agency && ` by ${college.accreditation.agency}`}
                </p>
              )}
              
              {college.fees && (
                <div>
                  <p><strong>Average Fees:</strong></p>
                  <ul>
                    {college.fees.undergraduate && (
                      <li>Undergraduate: ₹{college.fees.undergraduate.toLocaleString()}/year</li>
                    )}
                    {college.fees.postgraduate && (
                      <li>Postgraduate: ₹{college.fees.postgraduate.toLocaleString()}/year</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="college-section">
            <div className="reviews-header">
              <h2>Reviews & Ratings</h2>
              <div className="rating-summary">
                <div className="average-rating">
                  <span className="rating-value">{averageRating.toFixed(1)}</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="review-count">({totalReviews} reviews)</span>
                </div>
                
                {token && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>
            </div>
            
            {showReviewForm && (
              <div className="review-form">
                <h3>Write a Review</h3>
                {reviewError && (
                  <div className="alert alert-error">{reviewError}</div>
                )}
                <form onSubmit={submitReview}>
                  <div className="form-group">
                    <label>Rating:</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          className={`star ${star <= reviewForm.rating ? 'filled' : ''}`}
                          onClick={() => handleRatingChange(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={reviewForm.title}
                      onChange={handleReviewFormChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="content">Review:</label>
                    <textarea
                      id="content"
                      name="content"
                      value={reviewForm.content}
                      onChange={handleReviewFormChange}
                      className="form-textarea"
                      rows="4"
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
            
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.user?.email || 'Anonymous'}</span>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`star ${star <= review.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="review-title">{review.title}</h4>
                    <p className="review-content">{review.content}</p>
                    <div className="review-actions">
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => markReviewAsHelpful(review._id)}
                      >
                        Helpful ({review.helpfulCount || 0})
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review this college!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDetailsPage;