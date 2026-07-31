import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings as SettingsIcon, LogOut, Cloud, Trash2 } from 'lucide-react-native';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const { user, logout } = useAuthStore();
  const [autoSync, setAutoSync] = useState(false);
  
  const getAutoSyncKey = () => `google_autosync_${user?._id}`;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const val = await AsyncStorage.getItem(getAutoSyncKey());
        const generic = await AsyncStorage.getItem('google_autosync');
        if (val === 'true' || generic === 'true') {
          setAutoSync(true);
        }
      } catch (e) {}
    };
    if (user) loadSettings();
  }, [user]);

  const toggleAutoSync = async (value) => {
    setAutoSync(value);
    try {
      await AsyncStorage.setItem(getAutoSyncKey(), value ? 'true' : 'false');
      // If turning on, we might want to manually sync now or wait for the hook interval
      if (value) {
        Alert.alert('Auto-Sync Enabled', 'Your data will be backed up every 1 hour.');
      }
    } catch (e) {
      console.error('Failed to save auto-sync setting', e);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you absolutely sure? This will permanently delete all your financial records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, clear my data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/auth/data');
              Alert.alert('Success', 'All data cleared successfully');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Sync</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Cloud color="#3B82F6" size={20} />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Auto-Sync</Text>
                  <Text style={styles.rowSubtitle}>Backup data real-time every 1 hour</Text>
                </View>
              </View>
              <Switch 
                value={autoSync} 
                onValueChange={toggleAutoSync}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor="#F9FAFB"
              />
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Trash2 color="#EF4444" size={20} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Clear All Data</Text>
                  <Text style={styles.rowSubtitle}>Permanently delete all transactions</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleLogout}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: 'rgba(156, 163, 175, 0.2)' }]}>
                  <LogOut color="#9CA3AF" size={20} />
                </View>
                <Text style={styles.rowTitle}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#F9FAFB' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#9CA3AF', marginBottom: 12, marginLeft: 4 },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { padding: 10, borderRadius: 12, marginRight: 16 },
  rowTitle: { fontSize: 16, fontWeight: '500', color: '#F9FAFB', marginBottom: 2 },
  rowSubtitle: { fontSize: 12, color: '#9CA3AF' },
});

export default SettingsScreen;
