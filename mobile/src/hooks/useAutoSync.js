import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAutoSync = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const getSnapshotKey = () => `google_cloud_backup_snapshot_${user._id}`;
    const getSyncKey = () => `last_google_sync_${user._id}`;
    const getAutoSyncKey = () => `google_autosync_${user._id}`;

    const performBackup = async () => {
      try {
        const res = await api.get('/auth/backup');
        const backupData = res.data;
        
        await AsyncStorage.setItem(getSnapshotKey(), JSON.stringify(backupData));
        const syncTime = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        await AsyncStorage.setItem(getSyncKey(), syncTime);
        console.log(`[Auto-Sync] Backup successful for user ${user.email} at ${syncTime}`);
      } catch (error) {
        console.error('[Auto-Sync] Failed to backup data', error);
      }
    };

    const checkAndRunSync = async () => {
      try {
        // Checking specific user key and generic key
        const userSpecific = await AsyncStorage.getItem(getAutoSyncKey());
        const generic = await AsyncStorage.getItem('google_autosync');
        
        const isEnabled = userSpecific === 'true' || generic === 'true';
        
        if (isEnabled) {
          await performBackup();
        }
      } catch (e) {
        console.error('[Auto-Sync] error reading from async storage', e);
      }
    };

    // Run once on mount
    checkAndRunSync();

    // Run every 1 hour (3600000 ms)
    const interval = setInterval(checkAndRunSync, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};

export default useAutoSync;
