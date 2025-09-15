import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page-container">
      <h1 className="page-title" style={{fontWeight: "bold", fontSize: "2rem"}}>Welcome to GuidanceHub</h1>
      <div className="card">
        <h2 className="card-title" style={{fontWeight: "bold", fontSize: "1.5rem"}}>Your Personalized Career Guidance Platform</h2>
        <p>
          GuidanceHub is designed to help you navigate your educational journey by providing 
          personalized career and education guidance. Take our aptitude assessment to discover 
          your strengths and find the perfect path for your future.
        </p>
      </div>
      
      <div className="card">
        <h2 className="card-title" style={{fontWeight: "bold", fontSize: "1.5rem"}}>How It Works</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>1. Assess</h3>
            <p>Take our comprehensive aptitude and interest-based quiz to understand your strengths</p>
          </div>
          <div className="feature-item">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>2. Discover</h3>
            <p>Explore career paths and educational opportunities tailored to your profile</p>
          </div>
          <div className="feature-item">
            <h3 style={{fontWeight: "bold", fontSize: "1.2rem"}}>3. Plan</h3>
            <p>Create a personalized roadmap for your academic and career journey</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title" style={{fontWeight: "bold", fontSize: "1.5rem"}}>Get Started Today</h2>
        <p style={{marginBottom: "1rem"}}>Join thousands of students who have already discovered their path with GuidanceHub</p>
        <Link to="/quiz/1" className="btn btn-block">
          Take the Quiz
        </Link>
      </div>
      
      <style jsx>{`
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .feature-item {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .feature-item h3 {
          color: #333;
          margin-bottom: 1rem;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default HomePage;