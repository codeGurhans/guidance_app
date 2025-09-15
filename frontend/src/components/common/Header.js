import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import NotificationPanel from './NotificationPanel';
import api from '../../services/api';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications?isRead=false');
          setUnreadCount(res.data.totalCount);
        } catch (err) {
          console.error('Failed to fetch unread notifications:', err);
        }
      }
    };

    fetchUnreadCount();
    
    // Set up interval to refresh count
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            GuidanceHub
          </Link>
          
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/quiz/1" className="nav-link">Quiz</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>
                <Link to="/colleges" className="nav-link">Colleges</Link>
                <Link to="/admission-calendar" className="nav-link">Calendar</Link>
                <Link to="/applications" className="nav-link">Applications</Link>
                <Link to="/eligibility-checker" className="nav-link">Eligibility</Link>
                <Link to="/cutoff-predictor" className="nav-link">Cutoff Predictor</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                
                <div className="nav-notification" onClick={() => setIsNotificationPanelOpen(true)}>
                  <span className="notification-icon">🔔</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </div>
                
                <button onClick={logout} className="nav-button">Logout</button>
              </>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </nav>
        </div>
        
        <style>{`
          .nav-button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
          }
          
          .nav-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          
          .nav-notification {
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 0.5rem;
            border-radius: 8px;
            transition: background 0.3s ease;
          }
          
          .nav-notification:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .notification-icon {
            font-size: 1.2rem;
          }
          
          .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #ef4444;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
          }
          
          @media (max-width: 768px) {
            .nav-container {
              flex-direction: column;
              gap: 1rem;
            }
            
            .nav-menu {
              flex-wrap: wrap;
              justify-content: center;
            }
            
            .nav-notification {
              order: -1;
            }
          }
        `}</style>
      </header>
      
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
};

export default Header;