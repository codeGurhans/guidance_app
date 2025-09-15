import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        // Only set user/token if both exist and are valid
        if (storedToken && storedUser && storedToken !== 'undefined' && storedUser !== 'undefined') {
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // If anything fails, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // Make API call to login
      const response = await api.post('/users/login', { email, password });
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      setToken(userToken);
      
      // Store in localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { user: userData, token: userToken };
    } catch (error) {
      // Clear any existing auth data on failed login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Update user profile
  const updateUserProfile = (profileData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...profileData
    }));
    
    // Update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const updatedUser = {
          ...userData,
          ...profileData
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating user profile in localStorage:', error);
      }
    }
  };

  // Update user avatar
  const updateUserAvatar = (avatarUrl) => {
    setUser(prevUser => ({
      ...prevUser,
      avatar: avatarUrl
    }));
    
    // Update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const updatedUser = {
          ...userData,
          avatar: avatarUrl
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating user avatar in localStorage:', error);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUserProfile,
    updateUserAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;