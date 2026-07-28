import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import { Landmark, Plus, HeartHandshake, History } from 'lucide-react';
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

  const handleInterestTx = (e) => {
    e.preventDefault();
    if (!interestTx.amount || interestTx.amount <= 0) return toast.error('Valid amount required');
    if (interestTx.type === 'Add' && !interestTx.bank) return toast.error('Bank name required');
    interestMutation.mutate(interestTx);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-error/20 text-error rounded-xl">
          <Landmark className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">{t('Bank Interest')}</h2>
      </div>

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
                {interestMutation.isPending ? <span className="loading loading-spinner"></span> : 'Confirm'}
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
        
        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <table className="table w-full">
            <thead className="bg-base-200/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th>Date</th>
                <th>Details</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isInterestLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <span className="loading loading-spinner text-error"></span>
                  </td>
                </tr>
              ) : interestData?.history?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-base-content/50">
                    No interest history found.
                  </td>
                </tr>
              ) : (
                interestData?.history?.map((tx) => (
                  <tr key={tx._id} className="hover:bg-error/5 transition-colors">
                    <td>
                      <div className="font-medium">{format(new Date(tx.date), 'dd MMM, yyyy')}</div>
                      <div className="text-xs text-base-content/50">{format(new Date(tx.date), 'hh:mm a')}</div>
                    </td>
                    <td>
                      <div className="font-medium">{tx.type === 'Add' ? tx.bank || 'Bank' : 'Charity/Donation'}</div>
                    </td>
                    <td>
                      <div className={`badge badge-sm ${tx.type === 'Add' ? 'badge-error badge-outline' : 'badge-success badge-outline'}`}>
                        {tx.type === 'Add' ? 'Added' : 'Infaq'}
                      </div>
                    </td>
                    <td className={`text-right font-medium ${tx.type === 'Add' ? 'text-error' : 'text-success'}`}>
                      {tx.type === 'Add' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BankInterest;
