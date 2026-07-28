import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import TransactionForm from '../components/TransactionForm';
import { Trash2, Pencil, ArrowUpFromLine } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Expenses = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [editingRecord, setEditingRecord] = useState(null);
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expense'],
    queryFn: async () => {
      const res = await api.get('/expenses');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['expense']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Expense deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete expense');
    }
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const formatDate = (d) => {
    const date = new Date(d);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(h, m, 0);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-error/20 text-error rounded-xl">
          <ArrowUpFromLine className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">{t('Expenses') || 'Expense Tracking'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 h-fit"
        >
          <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
          <TransactionForm type="expense" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h3 className="text-lg font-semibold">Expense History</h3>
            <div className="flex gap-2">
              <select 
                className="select select-bordered select-sm" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i + 1, 0).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                className="select select-bordered select-sm" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary"></span></div>
          ) : expenses?.length === 0 ? (
            <div className="text-center py-10 text-base-content/50">No expense records found.</div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar">
              {/* Cards layout for all devices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                {(filteredExpenses || []).map(exp => (
                  <div key={exp._id} className="bg-error/20 p-4 rounded-xl border border-error/30 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-base">{exp.title}</h4>
                        <div className="text-xs text-base-content/70 mt-1">
                          {formatDate(exp.date)} • {formatTime(exp.time)}
                        </div>
                      </div>
                      <span className="text-error font-semibold text-lg">-{formatCurrency(exp.amount, user?.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-error/10">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="badge badge-sm badge-outline border-error/40 text-error">{exp.category}</span>
                        <span className="text-xs text-base-content/60">{exp.channel}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingRecord(exp)} className="btn btn-ghost btn-sm btn-circle text-info">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(exp._id)} disabled={deleteMutation.isPending} className="btn btn-ghost btn-sm btn-circle text-error">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      {/* Edit Modal */}
      {editingRecord && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-base-300/50 backdrop-blur-sm">
          <div className="modal-box glass-card">
            <h3 className="font-bold text-lg mb-4">Edit Expense</h3>
            <TransactionForm 
              type="expense" 
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

export default Expenses;
