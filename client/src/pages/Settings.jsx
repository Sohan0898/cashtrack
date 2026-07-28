import { Settings as SettingsIcon, Globe, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
            {isSaving ? <span className="loading loading-spinner"></span> : 'Save Changes'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-error/20">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-error">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
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
                {isClearing ? <span className="loading loading-spinner"></span> : 'Yes, clear my data'}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Settings;
