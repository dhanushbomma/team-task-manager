// =============================================
// utils/api.js - Axios instance with auth header
// =============================================

import axios from 'axios';

// Create an axios instance pointing to our backend
const api = axios.create({
  baseURL: '/api', // Vite dev proxy handles this → http://localhost:5000/api
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a 401 comes back, it means the token expired → log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
