import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import { PiggyBank, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, History, Landmark, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Savings = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({ accountName: '', type: 'Bank', goal: '' });
  
  const [txData, setTxData] = useState({ accountId: null, type: 'Deposit', amount: '' });
  const [interestTx, setInterestTx] = useState({ type: null, amount: '', bank: '' });

  const { data: savings, isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: async () => {
      const res = await api.get('/savings');
      return res.data;
    }
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['savingsHistoryAll'],
    queryFn: async () => {
      const res = await api.get('/savings/history/all');
      return res.data;
    }
  });

  const { data: interestData, isLoading: isInterestLoading } = useQuery({
    queryKey: ['interest'],
    queryFn: async () => {
      const res = await api.get('/interest');
      return res.data;
    }
  });

  const totalSavings = savings?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/savings', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['savings']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Savings account created');
      setIsAdding(false);
      setNewAccount({ accountName: '', type: 'Bank', goal: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/savings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['savings']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Account deleted');
    }
  });

  const txMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/savings/${id}/transaction`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['savings']);
      queryClient.invalidateQueries(['savingsHistoryAll']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Transaction successful');
      setTxData({ accountId: null, type: 'Deposit', amount: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Transaction failed');
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

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newAccount.accountName) return toast.error('Account name required');
    createMutation.mutate(newAccount);
  };

  const handleTx = (e) => {
    e.preventDefault();
    if (!txData.amount || txData.amount <= 0) return toast.error('Valid amount required');
    txMutation.mutate({ id: txData.accountId, data: { type: txData.type, amount: Number(txData.amount) } });
  };

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
          <div className="p-2 bg-accent/20 text-accent rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">{t('Savings') || 'Savings Accounts'}</h2>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <h3 className="font-semibold mb-4">Create New Account</h3>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="form-control w-full md:w-auto">
              <label className="label"><span className="label-text">Account Name</span></label>
              <input type="text" className="input input-bordered" value={newAccount.accountName} onChange={e => setNewAccount({...newAccount, accountName: e.target.value})} placeholder="Emergency Fund" />
            </div>
            <div className="form-control w-full md:w-auto">
              <label className="label"><span className="label-text">Type</span></label>
              <select className="select select-bordered" value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})}>
                {['Bank', 'Cash', 'Bkash', 'Nagad', 'Card', 'Matir Bank'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-control w-full md:w-auto">
              <label className="label"><span className="label-text">Goal Amount (Optional)</span></label>
              <input type="number" className="input input-bordered" value={newAccount.goal} onChange={e => setNewAccount({...newAccount, goal: e.target.value})} placeholder="0.00" />
            </div>
            <button type="submit" className="btn btn-primary mt-4 md:mt-0" disabled={createMutation.isPending}>Create</button>
          </form>
        </motion.div>
      )}

      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-l-accent mb-6">
        <div>
          <h3 className="text-base-content/60 font-medium">Total Savings</h3>
          <h1 className="text-4xl font-bold text-accent">{formatCurrency(totalSavings, user?.currency)}</h1>
        </div>
      </div>

      {txData.accountId && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">{txData.type} to Savings</h3>
            <form onSubmit={handleTx} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Amount</span></label>
                <input type="number" step="0.01" className="input input-bordered" autoFocus value={txData.amount} onChange={e => setTxData({...txData, amount: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" className="btn btn-ghost" onClick={() => setTxData({ accountId: null, type: 'Deposit', amount: '' })}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={txMutation.isPending}>Confirm</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           <div className="col-span-full flex justify-center py-10"><span className="loading loading-spinner text-accent"></span></div>
        ) : savings?.length === 0 ? (
          <div className="col-span-full text-center py-10 text-base-content/50">No savings accounts found.</div>
        ) : (
          savings?.map((acc) => (
            <motion.div key={acc._id} layout className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{acc.accountName}</h3>
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle"><Trash2 className="w-4 h-4 text-base-content/50" /></button>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-200">
                      <li><a className="text-error" onClick={() => deleteMutation.mutate(acc._id)}>Delete</a></li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs font-medium text-base-content/60 mb-4">{acc.type}</p>
                <div className="text-3xl font-bold text-accent mb-2">{formatCurrency(acc.balance, user?.currency)}</div>
                
                {acc.goal ? (
                  <div className="w-full bg-base-200 rounded-full h-2.5 mt-4 mb-1">
                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${Math.min((acc.balance / acc.goal) * 100, 100)}%` }}></div>
                  </div>
                ) : null}
                {acc.goal && <p className="text-xs text-base-content/50 text-right">Goal: {formatCurrency(acc.goal, user?.currency)}</p>}
              </div>

              <div className="flex gap-2 mt-6">
                <button className="btn btn-sm flex-1 bg-accent/10 text-accent hover:bg-accent hover:text-accent-content border-none" onClick={() => setTxData({ accountId: acc._id, type: 'Deposit', amount: '' })}>
                  <ArrowUpCircle className="w-4 h-4" /> Deposit
                </button>
                <button className="btn btn-sm flex-1 bg-base-200 hover:bg-base-300 border-none" onClick={() => setTxData({ accountId: acc._id, type: 'Withdraw', amount: '' })}>
                  <ArrowDownCircle className="w-4 h-4" /> Withdraw
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="glass-card mt-8 p-0 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-base-200/50 bg-base-200/20">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            Savings History
          </h3>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <table className="table w-full">
            <thead className="bg-base-200/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isHistoryLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <span className="loading loading-spinner text-accent"></span>
                  </td>
                </tr>
              ) : history?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-base-content/50">
                    No saving history found.
                  </td>
                </tr>
              ) : (
                history?.map((tx) => (
                  <tr key={tx._id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="font-medium">{format(new Date(tx.date), 'dd MMM, yyyy')}</div>
                      <div className="text-xs text-base-content/50">{format(new Date(tx.date), 'hh:mm a')}</div>
                    </td>
                    <td>
                      <div className="font-medium">{tx.savingsAccount?.accountName || 'Deleted Account'}</div>
                      <div className="text-xs opacity-60">{tx.savingsAccount?.type || ''}</div>
                    </td>
                    <td>
                      <div className={`badge badge-sm ${tx.type === 'Deposit' ? 'badge-success badge-outline' : 'badge-error badge-outline'}`}>
                        {tx.type}
                      </div>
                    </td>
                    <td className={`text-right font-medium ${tx.type === 'Deposit' ? 'text-success' : 'text-error'}`}>
                      {tx.type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Interest Section */}
      <div className="mt-12 mb-8">
        <div className="flex items-center gap-3 mb-6">
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
            <button className="btn btn-sm bg-base-200 hover:bg-base-300 border-none text-base-content" onClick={() => setInterestTx({ type: 'Infaq', amount: '', bank: '' })}>
              <HeartHandshake className="w-4 h-4" /> Withdraw Infaq
            </button>
          </div>
        </div>

        {interestTx.type && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6 border border-error/20 bg-error/5">
            <h3 className="font-semibold mb-4 text-error">{interestTx.type === 'Add' ? 'Add New Interest' : 'Withdraw Infaq'}</h3>
            <form onSubmit={handleInterestTx} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="form-control w-full md:w-auto">
                <label className="label"><span className="label-text">Amount</span></label>
                <input type="number" step="0.01" className="input input-bordered focus:border-error" value={interestTx.amount} onChange={e => setInterestTx({...interestTx, amount: e.target.value})} autoFocus />
              </div>
              {interestTx.type === 'Add' && (
                <div className="form-control w-full md:w-auto">
                  <label className="label"><span className="label-text">Bank Name</span></label>
                  <input type="text" className="input input-bordered focus:border-error" value={interestTx.bank} onChange={e => setInterestTx({...interestTx, bank: e.target.value})} placeholder="e.g. City Bank" />
                </div>
              )}
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button type="button" className="btn btn-ghost" onClick={() => setInterestTx({ type: null, amount: '', bank: '' })}>Cancel</button>
                <button type="submit" className="btn bg-error text-error-content hover:bg-error/90 border-none" disabled={interestMutation.isPending}>
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
          
          <div className="overflow-x-auto custom-scrollbar max-h-[400px]">
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
                        <div className={`badge badge-sm ${tx.type === 'Add' ? 'badge-error badge-outline' : 'badge-neutral badge-outline'}`}>
                          {tx.type === 'Add' ? 'Added' : 'Infaq'}
                        </div>
                      </td>
                      <td className={`text-right font-medium ${tx.type === 'Add' ? 'text-error' : 'text-base-content/70'}`}>
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
    </div>
  );
};

export default Savings;
