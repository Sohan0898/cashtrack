import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // Point to the live Render backend API
  baseURL: 'https://cashtrack-dhd4.onrender.com/api',
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // You can add logic here to redirect to Login or clear state
      // We will handle clearing state in authStore
    }
    return Promise.reject(error);
  }
);

export default api;
