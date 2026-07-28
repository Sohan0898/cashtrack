import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, ShieldAlert, AlertTriangle, LogOut, Laptop, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const Settings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({ daily: false, weekly: false, monthly: false });
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const res = await api.get('/auth/sessions');
        setSessions(res.data);
      } catch (error) {
        console.error('Failed to fetch sessions');
      } finally {
        setLoadingSessions(false);
      }
    };
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/notifications/preferences');
        setNotificationPrefs(res.data.preferences || { daily: false, weekly: false, monthly: false });
      } catch (err) {
        console.error('Failed to fetch notification preferences');
      }
    };
    fetchSessions();
    fetchPrefs();
  }, []);

  const handleRevokeSession = async (id) => {
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
      toast.success('Device logged out successfully');
    } catch (error) {
      toast.error('Failed to log out device');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await api.delete('/auth/sessions');
      setSessions(sessions.filter(s => s.isCurrent));
      toast.success('All other devices logged out');
    } catch (error) {
      toast.error('Failed to log out devices');
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await api.delete('/auth/data');
      toast.success('All data cleared successfully');
      document.getElementById('clear_data_modal').close();
    } catch (error) {
      toast.error('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleTogglePref = async (key) => {
    const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(newPrefs);
    try {
      await api.put('/notifications/preferences', { preferences: newPrefs });
      
      if (newPrefs[key] && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          subscribeUserToPush();
        } else {
          toast.error('Notification permission denied');
          setNotificationPrefs(notificationPrefs);
          await api.put('/notifications/preferences', { preferences: notificationPrefs });
        }
      } else if (newPrefs[key]) {
         subscribeUserToPush();
      }
    } catch (err) {
      toast.error('Failed to update preferences');
    }
  };

  const subscribeUserToPush = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      toast.error('Push notifications are not configured on the server.');
      return;
    }

    try {
      setIsSubscribing(true);
      const registration = await navigator.serviceWorker.ready;
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      };
      
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe(subscribeOptions);
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await api.post('/notifications/subscribe', {
        subscription,
        timezone
      });
      toast.success('Notifications enabled on this device');
    } catch (err) {
      console.error('Failed to subscribe to push', err);
      toast.error('Failed to enable notifications');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', { currency, language });
      updateUser(res.data);
      localStorage.setItem('cashtrack_language', language);
      i18n.changeLanguage(language);
      toast.success(t('Settings saved successfully') || 'Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-base-300 text-base-content rounded-xl">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 space-y-8">

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-base-200 pb-2">
            <Globe className="w-5 h-5" /> Localization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Default Currency</span></label>
              <select className="select select-bordered" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Language</span></label>
              <select className="select select-bordered" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English (US)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="ar">Arabic (العربية)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>
        </div>


        <div className="flex justify-end pt-4">
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <span className="loading loading-bars"></span> : 'Save Changes'}
          </button>
        </div>

        {/* Notifications */}
        <div className="mt-8 pt-8 border-t border-base-200">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-warning" /> Notifications & Reminders
          </h3>
          <p className="text-sm text-base-content/70 mb-4">
            Get automated push notifications directly to this device. For iOS devices, make sure to add this app to your Home Screen to receive notifications.
          </p>
          
          <div className="bg-base-200/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium block">Daily Reminders</span>
                <span className="text-xs text-base-content/70">Receive a friendly reminder at 12 PM and 10 PM.</span>
              </div>
              <input type="checkbox" className="toggle toggle-primary" checked={notificationPrefs.daily} onChange={() => handleTogglePref('daily')} disabled={isSubscribing} />
            </div>
            <div className="flex items-center justify-between border-t border-base-300 pt-4">
              <div>
                <span className="font-medium block">Weekly Summary</span>
                <span className="text-xs text-base-content/70">A quick update every Sunday morning.</span>
              </div>
              <input type="checkbox" className="toggle toggle-primary" checked={notificationPrefs.weekly} onChange={() => handleTogglePref('weekly')} disabled={isSubscribing} />
            </div>
            <div className="flex items-center justify-between border-t border-base-300 pt-4">
              <div>
                <span className="font-medium block">Monthly Summary</span>
                <span className="text-xs text-base-content/70">A complete recap on the 1st of every month.</span>
              </div>
              <input type="checkbox" className="toggle toggle-primary" checked={notificationPrefs.monthly} onChange={() => handleTogglePref('monthly')} disabled={isSubscribing} />
            </div>
          </div>
        </div>

        {/* Security / Login Info */}
        <div className="mt-8 pt-8 border-t border-base-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-info" /> Active Devices
            </h3>
            {sessions.length > 1 && (
              <button onClick={handleRevokeAll} className="btn btn-sm btn-outline btn-error">
                Log out all other devices
              </button>
            )}
          </div>
          
          <div className="bg-base-200/50 rounded-xl p-4 space-y-4">
            {loadingSessions ? (
              <div className="flex justify-center p-4"><span className="loading loading-bars"></span></div>
            ) : (
              sessions.map((session) => (
                <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-300 last:border-0 pb-4 last:pb-0 gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-success/20 text-success' : 'bg-base-300'}`}>
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm max-w-[200px] sm:max-w-xs truncate" title={session.device}>{session.device || 'Unknown Device'}</span>
                        {session.isCurrent && <span className="badge badge-success badge-sm">Current</span>}
                      </div>
                      <div className="text-xs text-base-content/70 mt-1">
                        IP: <span className="font-mono">{session.ipAddress}</span> • Last active: {new Date(session.lastActive).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button 
                      onClick={() => handleRevokeSession(session._id)}
                      className="btn btn-sm btn-ghost text-error hover:bg-error/20"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  )}
                </div>
              ))
            )}
            {sessions.length === 0 && !loadingSessions && (
              <div className="text-center text-base-content/70 text-sm">No active sessions found (You may need to log back in to activate tracking).</div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-error/20">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-error">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-error/5 border border-error/20 rounded-xl gap-4">
              <div>
                <h4 className="font-semibold text-error">Clear All Data</h4>
                <p className="text-sm text-base-content/70">Permanently delete all your transactions and records. Your account will remain active.</p>
              </div>
              <button 
                className="btn btn-error btn-outline whitespace-nowrap"
                onClick={() => document.getElementById('clear_data_modal').showModal()}
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Clear Data Modal */}
      <dialog id="clear_data_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2 text-error"><AlertTriangle className="w-5 h-5"/> Are you absolutely sure?</h3>
          <p className="py-4">This action cannot be undone. This will permanently delete all your financial records, transactions, and categories.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn mr-2">Cancel</button>
              <button className="btn btn-error" onClick={(e) => { e.preventDefault(); handleClearData(); }} disabled={isClearing}>
                {isClearing ? <span className="loading loading-bars"></span> : 'Yes, clear my data'}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Settings;
