import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import { Landmark, Plus, HeartHandshake, History, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BankInterest = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [interestTx, setInterestTx] = useState({ type: null, amount: '', bank: '' });

  const { data: interestData, isLoading: isInterestLoading } = useQuery({
    queryKey: ['interest'],
    queryFn: async () => {
      const res = await api.get('/interest');
      return res.data;
    }
  });

  const interestMutation = useMutation({
    mutationFn: (data) => {
      if (data.type === 'Add') {
        return api.post('/interest/add', { amount: data.amount, bank: data.bank });
      } else {
        return api.post('/interest/infaq', { amount: data.amount });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interest']);
      toast.success('Interest transaction successful');
      setInterestTx({ type: null, amount: '', bank: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/interest/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries(['interest']);
      toast.success('All interest data cleared');
      document.getElementById('clear_interest_modal').close();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to clear data');
      document.getElementById('clear_interest_modal').close();
    }
  });

  const handleInterestTx = (e) => {
    e.preventDefault();
    if (!interestTx.amount || interestTx.amount <= 0) return toast.error('Valid amount required');
    if (interestTx.type === 'Add' && !interestTx.bank) return toast.error('Bank name required');
    interestMutation.mutate(interestTx);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-error/20 text-error rounded-xl">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">{t('Bank Interest')}</h2>
        </div>
        <button 
          className="btn btn-sm btn-ghost text-error" 
          onClick={() => document.getElementById('clear_interest_modal').showModal()}
        >
          <Trash2 className="w-4 h-4" /> Clear Data
        </button>
      </div>

      <dialog id="clear_interest_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2 text-error">
            <AlertTriangle className="w-5 h-5" />
            Warning: Clear All Data
          </h3>
          <p className="py-4">Are you sure you want to delete ALL your bank interest and infaq history? This action cannot be undone.</p>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => document.getElementById('clear_interest_modal').close()}>Cancel</button>
            <button type="button" className="btn bg-error text-error-content hover:bg-error/90 border-none" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
              {clearMutation.isPending ? <span className="loading loading-bars"></span> : 'Yes, Delete All'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-error/10 to-transparent border-l-4 border-l-error mb-6">
        <div>
          <h3 className="text-base-content/60 font-medium">Total Accumulated Interest</h3>
          <h1 className="text-4xl font-bold text-error">{formatCurrency(interestData?.totalInterest || 0, user?.currency)}</h1>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button className="btn btn-sm bg-error/10 text-error hover:bg-error hover:text-error-content border-none" onClick={() => setInterestTx({ type: 'Add', amount: '', bank: '' })}>
            <Plus className="w-4 h-4" /> Add Interest
          </button>
          <button className="btn btn-sm bg-success/10 text-success hover:bg-success hover:text-success-content border-none" onClick={() => setInterestTx({ type: 'Infaq', amount: '', bank: '' })}>
            <HeartHandshake className="w-4 h-4" /> Withdraw Infaq
          </button>
        </div>
      </div>

      {interestTx.type && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`glass-card p-6 mb-6 border ${interestTx.type === 'Add' ? 'border-error/20 bg-error/5' : 'border-success/20 bg-success/5'}`}>
          <h3 className={`font-semibold mb-4 ${interestTx.type === 'Add' ? 'text-error' : 'text-success'}`}>{interestTx.type === 'Add' ? 'Add New Interest' : 'Withdraw Infaq'}</h3>
          <form onSubmit={handleInterestTx} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="form-control w-full md:w-auto">
              <label className="label"><span className="label-text">Amount</span></label>
              <input type="number" step="0.01" className={`input input-bordered focus:border-${interestTx.type === 'Add' ? 'error' : 'success'}`} value={interestTx.amount} onChange={e => setInterestTx({...interestTx, amount: e.target.value})} autoFocus />
            </div>
            {interestTx.type === 'Add' && (
              <div className="form-control w-full md:w-auto">
                <label className="label"><span className="label-text">Bank Name</span></label>
                <input type="text" className="input input-bordered focus:border-error" value={interestTx.bank} onChange={e => setInterestTx({...interestTx, bank: e.target.value})} placeholder="e.g. City Bank" />
              </div>
            )}
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button type="button" className="btn btn-ghost" onClick={() => setInterestTx({ type: null, amount: '', bank: '' })}>Cancel</button>
              <button type="submit" className={`btn border-none ${interestTx.type === 'Add' ? 'bg-error text-error-content hover:bg-error/90' : 'bg-success text-success-content hover:bg-success/90'}`} disabled={interestMutation.isPending}>
                {interestMutation.isPending ? <span className="loading loading-bars"></span> : 'Confirm'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-card mt-6 p-0 overflow-hidden flex flex-col border border-error/10">
        <div className="p-6 border-b border-base-200/50 bg-error/10">
          <h3 className="text-lg font-bold flex items-center gap-2 text-error">
            <History className="w-5 h-5" />
            Interest History
          </h3>
        </div>
        
          {/* Cards layout for all devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {isInterestLoading ? (
              <div className="col-span-full text-center py-8"><span className="loading loading-bars text-error"></span></div>
            ) : interestData?.history?.length === 0 ? (
              <div className="col-span-full text-center py-8 text-base-content/50">No interest history found.</div>
            ) : (
              interestData?.history?.map((tx) => (
                <div key={tx._id} className="bg-error/20 p-4 rounded-xl border border-error/30 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-base">{tx.type === 'Add' ? tx.bank || 'Bank' : 'Charity/Donation'}</h4>
                      <div className="text-xs text-base-content/70 mt-1">
                        {format(new Date(tx.date), 'dd MMM, yyyy')} • {format(new Date(tx.date), 'hh:mm a')}
                      </div>
                    </div>
                    <span className={`font-semibold text-lg ${tx.type === 'Add' ? 'text-error' : 'text-success'}`}>
                      {tx.type === 'Add' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-end items-center mt-2 pt-3 border-t border-error/10">
                    <div className={`badge badge-sm border-error/40 ${tx.type === 'Add' ? 'text-error' : 'text-success'}`}>
                      {tx.type === 'Add' ? 'Added' : 'Infaq'}
                    </div>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
};

export default BankInterest;
