import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import useAutoSync from '../hooks/useAutoSync';

const NAV_STATE_KEY = 'cashtrack_nav_state';

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [navReady, setNavReady] = useState(false);
  const [initialNavState, setInitialNavState] = useState(undefined);

  // Initialize auto-sync if user is authenticated
  useAutoSync();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Restore saved navigation state on mount
  useEffect(() => {
    const restoreNavState = async () => {
      try {
        const savedStateStr = await AsyncStorage.getItem(NAV_STATE_KEY);
        if (savedStateStr) {
          const savedState = JSON.parse(savedStateStr);
          setInitialNavState(savedState);
        }
      } catch (e) {
        // If restore fails, just start fresh at Dashboard
      } finally {
        setNavReady(true);
      }
    };
    restoreNavState();
  }, []);

  // Save navigation state whenever it changes
  const onNavStateChange = useCallback(async (state) => {
    try {
      if (state) {
        await AsyncStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
      }
    } catch (e) {}
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  // Wait until nav state is loaded from storage before rendering
  if (!navReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      initialState={isAuthenticated ? initialNavState : undefined}
      onStateChange={onNavStateChange}
    >
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
