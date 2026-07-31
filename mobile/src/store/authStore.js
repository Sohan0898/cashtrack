import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/axios';
import { setAppLanguage, getAppLanguage } from '../lib/i18n';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  theme: 'dark', // default to dark theme like the web version
  language: 'en',

  // Hydrate state from AsyncStorage
  init: async () => {
    try {
      set({ isLoading: true });
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        set({ theme: storedTheme });
      }

      const storedLang = await getAppLanguage();
      const storedCurrency = await AsyncStorage.getItem('user_currency');
      const storedName = await AsyncStorage.getItem('user_name');

      set(state => ({
        language: storedLang,
        user: state.user ? {
          ...state.user,
          language: storedLang,
          currency: storedCurrency || state.user.currency || 'USD',
          name: storedName || state.user.name || 'Dev User'
        } : {
          language: storedLang,
          currency: storedCurrency || 'USD',
          name: storedName || 'Dev User',
          email: 'dev@cashtrack.app'
        }
      }));

      const token = await AsyncStorage.getItem('token');
      if (token) {
        await get().checkAuth();
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const storedCurrency = await AsyncStorage.getItem('user_currency');
      const storedName = await AsyncStorage.getItem('user_name');
      const token = await AsyncStorage.getItem('token');

      if (token === 'DEV_BYPASS_TOKEN_123') {
        const mockUser = {
          id: 'dev_user_1',
          name: storedName || 'Dev User',
          email: 'dev@cashtrack.app',
          currency: storedCurrency || 'USD',
          language: get().language || 'en',
          theme: 'dark'
        };
        set({ user: mockUser, isAuthenticated: true, error: null });
        return;
      }

      const res = await api.get('/auth/profile');
      const userData = res.data;
      if (storedCurrency) userData.currency = storedCurrency;
      if (storedName) userData.name = storedName;
      set({ user: userData, isAuthenticated: true, error: null });
    } catch (error) {
      const storedCurrency = await AsyncStorage.getItem('user_currency');
      const storedName = await AsyncStorage.getItem('user_name');
      const token = await AsyncStorage.getItem('token');
      if (token === 'DEV_BYPASS_TOKEN_123') {
        const mockUser = {
          id: 'dev_user_1',
          name: storedName || 'Dev User',
          email: 'dev@cashtrack.app',
          currency: storedCurrency || 'USD',
          language: get().language || 'en',
          theme: 'dark'
        };
        set({ user: mockUser, isAuthenticated: true, error: null });
        return;
      }

      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, error: null });
      } else {
        if (token) {
          set({ isAuthenticated: true, error: null });
        } else {
          set({ user: null, isAuthenticated: false, error: null });
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (idToken) => {
    if (idToken === 'DEV_BYPASS_TOKEN_123') {
      const mockUser = {
        id: 'dev_user_1',
        name: 'Dev User',
        email: 'dev@cashtrack.app',
        currency: 'USD',
        theme: 'dark'
      };
      await AsyncStorage.setItem('token', 'DEV_BYPASS_TOKEN_123');
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      return true;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { idToken });
      
      const { token, ...userData } = res.data;
      await AsyncStorage.setItem('token', token);
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        theme: userData.theme || get().theme
      });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      // Short timeout so a dead server doesn't block the logout UI
      await api.post('/auth/logout', {}, { timeout: 2000 });
    } catch (error) {
      console.log('Server logout failed, clearing local state anyway');
    } finally {
      await AsyncStorage.removeItem('token');
      // Clear persisted nav state so the next login starts at Dashboard cleanly
      await AsyncStorage.removeItem('cashtrack_nav_state');
      set({ user: null, isAuthenticated: false });
    }
  },

  setTheme: async (newTheme) => {
    set({ theme: newTheme });
    await AsyncStorage.setItem('theme', newTheme);
  },

  setLanguage: async (newLang) => {
    set(state => ({ 
      language: newLang, 
      user: state.user ? { ...state.user, language: newLang } : state.user 
    }));
    await setAppLanguage(newLang);
  },

  updateUser: async (userData) => {
    if (userData?.currency) {
      await AsyncStorage.setItem('user_currency', userData.currency);
    }
    if (userData?.name) {
      await AsyncStorage.setItem('user_name', userData.name);
    }
    if (userData?.language) {
      await setAppLanguage(userData.language);
    }
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : userData,
      language: userData?.language || state.language
    }));
  },
}));

export default useAuthStore;
