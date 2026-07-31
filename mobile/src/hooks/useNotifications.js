import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import api from '../lib/axios';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useNotifications() {
  const [notificationPrefs, setNotificationPrefs] = useState({ daily: false, weekly: false, monthly: false });
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      setNotificationPrefs(res.data.preferences || { daily: false, weekly: false, monthly: false });
    } catch (e) {
      console.error('Failed to fetch notification prefs', e);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') return null;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#BFDF4F',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed', 'Failed to get push token for push notification!');
        return null;
      }
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      return token;
    } else {
      Alert.alert('Error', 'Must use physical device for Push Notifications');
      return null;
    }
  };

  const handleTogglePref = async (key) => {
    if (isSubscribing) return;
    setIsSubscribing(true);
    
    const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    const oldPrefs = { ...notificationPrefs };
    setNotificationPrefs(newPrefs);
    
    try {
      await api.put('/notifications/preferences', { preferences: newPrefs });
      
      if (newPrefs[key]) {
        const expoPushToken = await registerForPushNotificationsAsync();
        if (expoPushToken) {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          await api.post('/notifications/subscribe', {
            expoPushToken,
            timezone
          });
        } else {
          if (Platform.OS !== 'web') {
            setNotificationPrefs(oldPrefs);
            await api.put('/notifications/preferences', { preferences: oldPrefs });
          }
        }
      } else {
         // Optionally unsubscribe if turning all off, but backend can just keep the token.
      }
    } catch (e) {
      console.error('Toggle Pref Error:', e);
      setNotificationPrefs(oldPrefs);
    } finally {
      setIsSubscribing(false);
    }
  };

  return {
    notificationPrefs,
    isSubscribing,
    handleTogglePref
  };
}
