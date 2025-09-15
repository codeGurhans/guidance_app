import api from './api';

// Get user analytics data
export const getUserAnalytics = async (userId) => {
  try {
    const response = await api.get(`/analytics/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user analytics');
  }
};

// Get segment analytics data
export const getSegmentAnalytics = async () => {
  try {
    const response = await api.get('/analytics/segment-analytics');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch segment analytics');
  }
};

// Get detailed segment analytics
export const getSegmentDetails = async (segmentId) => {
  try {
    const response = await api.get(`/analytics/segment/${segmentId}/analytics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch segment details');
  }
};

// Get comparative analytics
export const getComparativeAnalytics = async (userIds, segmentIds) => {
  try {
    const response = await api.post('/analytics/comparative', {
      userIds,
      segmentIds
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch comparative analytics');
  }
};

// Get visualization data for quiz results
export const getVisualizationData = async (assessmentId) => {
  try {
    const response = await api.get(`/visualization/results/${assessmentId}/visualization`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch visualization data');
  }
};

// Get comparative analysis data
export const getComparativeAnalysis = async (assessmentId) => {
  try {
    const response = await api.get(`/comparative-analysis/results/${assessmentId}/comparative-analysis`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch comparative analysis data');
  }
};

export default {
  getUserAnalytics,
  getSegmentAnalytics,
  getSegmentDetails,
  getComparativeAnalytics,
  getVisualizationData,
  getComparativeAnalysis
};