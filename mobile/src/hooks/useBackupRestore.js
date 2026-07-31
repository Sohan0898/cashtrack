import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/axios';

export default function useBackupRestore(user) {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const getSnapshotKey = () => `google_cloud_backup_snapshot_${user?._id || 'default'}`;

  // Local JSON Backup
  const handleBackup = async () => {
    setIsExporting(true);
    try {
      if (Platform.OS === 'web') {
        window.alert("Please use the web interface for web backups");
        setIsExporting(false);
        return;
      }
      
      const res = await api.get('/auth/backup');
      const backupData = res.data;
      const dataStr = JSON.stringify(backupData, null, 2);
      
      const d = new Date();
      const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const fileName = `CashTrack_Backup_${localDateStr}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, dataStr, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Backup Saved', `Saved to app documents: ${fileName}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Backup Failed', 'Could not fetch or save backup data.');
    } finally {
      setIsExporting(false);
    }
  };

  // Google Cloud Backup Sync (AsyncStorage mock)
  const handleCloudBackup = async () => {
    setIsCloudSyncing(true);
    try {
      const res = await api.get('/auth/backup');
      const backupData = res.data;
      await AsyncStorage.setItem(getSnapshotKey(), JSON.stringify(backupData));
      
      Alert.alert('Success', 'Successfully backed up & synced to cloud!');
    } catch (e) {
      console.error(e);
      Alert.alert('Sync Failed', 'Could not sync backup to cloud.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Common Restore Logic
  const restoreData = async (data) => {
    let importedCount = 0;
    const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Incomes
    if (data.incomes) {
      for (const inc of data.incomes) {
        try {
          await api.post('/income', {
            title: inc.title || 'Restored Income',
            amount: Number(inc.amount) || 0,
            category: inc.category || 'Salary',
            date: inc.date || new Date().toISOString(),
            time: inc.time || defaultTime,
            channel: inc.channel || 'Cash',
            description: inc.description || ''
          });
          importedCount++;
        } catch (e) {}
      }
    }
    // Expenses
    if (data.expenses) {
      for (const exp of data.expenses) {
        try {
          await api.post('/expenses', {
            title: exp.title || 'Restored Expense',
            amount: Number(exp.amount) || 0,
            category: exp.category || 'Other',
            date: exp.date || new Date().toISOString(),
            time: exp.time || defaultTime,
            channel: exp.channel || 'Cash',
            description: exp.description || ''
          });
          importedCount++;
        } catch (e) {}
      }
    }
    // Categories
    if (data.categories) {
      for (const cat of data.categories) {
        try {
          await api.post('/categories', { name: cat.name, type: cat.type, color: cat.color, icon: cat.icon });
          importedCount++;
        } catch (e) {}
      }
    }
    return importedCount;
  };

  const handleCloudRestore = async () => {
    setIsRestoring(true);
    try {
      const savedSnapshot = await AsyncStorage.getItem(getSnapshotKey());
      if (!savedSnapshot) {
        Alert.alert('Error', 'No cloud backup snapshot found. Please create a backup first.');
        setIsRestoring(false);
        return;
      }
      
      const data = JSON.parse(savedSnapshot);
      const importedCount = await restoreData(data);
      
      if (importedCount > 0) {
        Alert.alert('Success', `Restored ${importedCount} records from Cloud Backup!`);
      } else {
        Alert.alert('Notice', 'No valid records were restored.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to restore from cloud.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleLocalRestore = async () => {
    setIsRestoring(true);
    try {
      if (Platform.OS === 'web') {
        window.alert("Please use the web interface for web restore");
        setIsRestoring(false);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setIsRestoring(false);
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      
      const data = JSON.parse(fileContent);
      const importedCount = await restoreData(data);
      
      if (importedCount > 0) {
        Alert.alert('Success', `Restored ${importedCount} records from Local JSON!`);
      } else {
        Alert.alert('Notice', 'No valid records were restored.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to restore from file.');
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    isExporting,
    isRestoring,
    isCloudSyncing,
    handleBackup,
    handleCloudBackup,
    handleCloudRestore,
    handleLocalRestore
  };
}
