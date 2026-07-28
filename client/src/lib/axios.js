import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ['/', '/login', '/features', '/pricing', '/about', '/currency-converter'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('cashtrack_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
