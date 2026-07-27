import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import TransactionForm from '../components/TransactionForm';
import { Trash2, Pencil, ArrowDownToLine } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Income = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [editingRecord, setEditingRecord] = useState(null);
  const queryClient = useQueryClient();

  const { data: incomes, isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const res = await api.get('/income');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['income']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Income deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete income');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-success/20 text-success rounded-xl">
          <ArrowDownToLine className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">{t('Income') || 'Income Tracking'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 h-fit"
        >
          <h3 className="text-lg font-semibold mb-4">Add New Income</h3>
          <TransactionForm type="income" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4">Income History</h3>
          
          {isLoading ? (
            <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary"></span></div>
          ) : incomes?.length === 0 ? (
            <div className="text-center py-10 text-base-content/50">No income records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="whitespace-nowrap">
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Channel</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(incomes || []).map(inc => (
                    <tr key={inc._id} className="whitespace-nowrap">
                      <td>{new Date(inc.date).toLocaleDateString()}</td>
                      <td className="font-medium">{inc.title}</td>
                      <td>
                        <span className="badge badge-sm badge-outline">{inc.category}</span>
                      </td>
                      <td>{inc.channel}</td>
                      <td className="text-success font-semibold">+{formatCurrency(inc.amount, user?.currency)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingRecord(inc)}
                            className="btn btn-ghost btn-xs text-info hover:bg-info/20"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteMutation.mutate(inc._id)}
                            disabled={deleteMutation.isPending}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
      {/* Edit Modal */}
      {editingRecord && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-base-300/50 backdrop-blur-sm">
          <div className="modal-box glass-card">
            <h3 className="font-bold text-lg mb-4">Edit Income</h3>
            <TransactionForm 
              type="income" 
              initialData={editingRecord}
              onSuccess={() => setEditingRecord(null)}
            />
            <div className="modal-action mt-4">
              <button className="btn btn-ghost" onClick={() => setEditingRecord(null)}>Cancel</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default Income;
