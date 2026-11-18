import axios from 'axios';

// Create base Axios instance pointing to Express backend API
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatically attach JWT token to outgoing requests if available
API.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('bugTrackerUser');
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;