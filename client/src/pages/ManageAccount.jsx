import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Camera, ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { logoutFirebase } from '../lib/firebase';

const ManageAccount = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      document.getElementById('delete_account_modal').close();
      navigate('/');
      await logoutFirebase();
      await logout();
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, avatar });
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-base-300 text-base-content rounded-xl">
          <UserIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Manage Account</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 space-y-8">
        
        {/* Profile Section */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-base-200 pb-2">
            <UserIcon className="w-5 h-5" /> Public Profile
          </h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center overflow-hidden border-4 border-base-100 shadow-sm">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-base-content/50" />
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-content rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
              </div>
              <span className="text-xs text-base-content/60">Max size 2MB</span>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Display Name</span></label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name"
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Email Address</span></label>
                <input 
                  type="email" 
                  className="input input-bordered opacity-50" 
                  value={user?.email || ''} 
                  disabled 
                />
                <label className="label"><span className="label-text-alt text-base-content/60">Linked to your Google account</span></label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 mt-4">
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <span className="loading loading-spinner"></span> : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-error/20">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-error">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-error/5 border border-error/20 rounded-xl gap-4">
              <div>
                <h4 className="font-semibold text-error">Delete Account</h4>
                <p className="text-sm text-base-content/70">Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button 
                className="btn btn-error whitespace-nowrap"
                onClick={() => document.getElementById('delete_account_modal').showModal()}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete Account
              </button>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Delete Account Modal */}
      <dialog id="delete_account_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box border border-error">
          <h3 className="font-bold text-lg flex items-center gap-2 text-error"><AlertTriangle className="w-5 h-5"/> Delete Account</h3>
          <p className="py-4">This is a highly destructive action. Your account and all associated data will be permanently wiped from our servers.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn mr-2">Cancel</button>
              <button className="btn btn-error" onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner"></span> : 'Yes, delete my account'}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ManageAccount;
