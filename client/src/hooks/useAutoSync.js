import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';

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
        
        localStorage.setItem(getSnapshotKey(), JSON.stringify(backupData));
        const syncTime = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        localStorage.setItem(getSyncKey(), syncTime);
        console.log(`[Auto-Sync] Backup successful for user ${user.email} at ${syncTime}`);
      } catch (error) {
        console.error('[Auto-Sync] Failed to backup data', error);
      }
    };

    // Check if auto-sync is enabled
    const checkAndRunSync = () => {
      const isEnabled = (localStorage.getItem(getAutoSyncKey()) || localStorage.getItem('google_autosync')) === 'true';
      if (isEnabled) {
        performBackup();
      }
    };

    // Run once on mount (login/refresh)
    checkAndRunSync();

    // Run every 1 hour (3600000 ms)
    const interval = setInterval(checkAndRunSync, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};

export default useAutoSync;
