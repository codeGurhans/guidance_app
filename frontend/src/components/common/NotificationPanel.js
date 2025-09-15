import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark notification as dismissed
  const dismissNotification = async (id) => {
    try {
      await api.put(`/notifications/${id}/dismiss`);
      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'urgent';
      case 'High':
        return 'high';
      case 'Low':
        return 'low';
      default:
        return 'medium';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Notifications</h3>
          <div className="notification-actions">
            <button 
              className="btn btn-small btn-secondary"
              onClick={markAllAsRead}
              disabled={notifications.length === 0}
            >
              Mark All as Read
            </button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${getPriorityClass(notification.priority)}`}
              >
                <div className="notification-content">
                  <div className="notification-header-row">
                    <h4 className="notification-title">{notification.title}</h4>
                    {!notification.isRead && <span className="unread-indicator"></span>}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className="notification-time">{formatDate(notification.deliveredAt)}</span>
                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => markAsRead(notification._id)}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => dismissNotification(notification._id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;