import { create } from 'zustand';
import api from '../lib/axios';
import i18n from '../lib/i18n';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: localStorage.getItem('cashtrack_theme') || 'dark',

  setTheme: (theme) => {
    localStorage.setItem('cashtrack_theme', theme);
    set({ theme });
  },

  updateUser: (user) => set({ user }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('cashtrack_token');
      const res = await api.get('/auth/profile');
      
      const newTheme = localStorage.getItem('cashtrack_theme') || 'dark';
      set({ user: res.data, isAuthenticated: true, theme: newTheme });
      localStorage.setItem('cashtrack_theme', newTheme);
      
      if (res.data.language) {
        localStorage.setItem('cashtrack_language', res.data.language);
        i18n.changeLanguage(res.data.language);
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (idToken) => {
    try {
      const res = await api.post('/auth/login', { idToken });
      if (res.data && res.data.token) {
        localStorage.setItem('cashtrack_token', res.data.token);
      }
      
      const newTheme = localStorage.getItem('cashtrack_theme') || 'dark';
      set({ user: res.data, isAuthenticated: true, theme: newTheme });
      localStorage.setItem('cashtrack_theme', newTheme);
      
      if (res.data.language) {
        localStorage.setItem('cashtrack_language', res.data.language);
        i18n.changeLanguage(res.data.language);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('cashtrack_token');
      set({ user: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
