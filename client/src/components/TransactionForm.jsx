import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Settings2, Trash2 } from 'lucide-react';

const transactionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  channel: z.enum(['Bank', 'Cash', 'Bkash', 'Rocket', 'Nagad', 'Upay', 'Card', 'Virtual Card']),
  description: z.string().optional(),
});



const TransactionForm = ({ type, onSuccess, initialData = null }) => {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      amount: initialData.amount,
      category: initialData.category,
      date: initialData.date.split('T')[0],
      time: initialData.time,
      channel: initialData.channel,
      description: initialData.description || ''
    } : {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      channel: 'Bank'
    }
  });

  const mutation = useMutation({
    mutationFn: (newTx) => {
      const endpoint = type === 'expense' ? '/expenses' : `/${type}`;
      if (initialData && initialData._id) {
        return api.put(`${endpoint}/${initialData._id}`, newTx);
      }
      return api.post(endpoint, newTx);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([type]);
      queryClient.invalidateQueries(['dashboard']);
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} ${initialData ? 'updated' : 'added'} successfully`);
      if (!initialData) reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const addCategoryMutation = useMutation({
    mutationFn: (name) => api.post('/categories', { name, type: 'both', icon: 'Circle' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['categories']);
      setValue('category', res.data.name);
      setNewCategoryName('');
      toast.success('Custom category added');
    },
    onError: () => toast.error('Failed to add category')
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category')
  });

  const categories = dbCategories
    .filter(c => c.type === 'both' || c.type === type)
    .map(c => c.name);
  const selectedCategory = watch('category');
  
  const modalCategories = dbCategories.filter(c => c.type === 'both' || c.type === type);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Title</span></label>
          <input type="text" className={`input input-bordered ${errors.title ? 'input-error' : ''}`} {...register('title')} placeholder={type === 'income' ? 'e.g. Monthly Salary' : 'e.g. Monthly Bill'} />
          {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Amount</span></label>
          <input type="number" step="0.01" className={`input input-bordered ${errors.amount ? 'input-error' : ''}`} {...register('amount', { valueAsNumber: true })} placeholder="0.00" />
          {errors.amount && <span className="text-error text-sm mt-1">{errors.amount.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Category</span></label>
          <select className={`select select-bordered ${errors.category ? 'select-error' : ''}`} {...register('category')}>
            <option value="">Select a category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className="text-error text-sm mt-1">{errors.category.message}</span>}
          
          <button 
            type="button" 
            onClick={() => setIsManageModalOpen(true)}
            className="btn btn-ghost btn-xs text-info hover:bg-info/20 mt-1 self-start flex gap-1 items-center"
          >
            <Settings2 className="w-3 h-3" /> Manage Categories
          </button>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Channel</span></label>
          <select className={`select select-bordered ${errors.channel ? 'select-error' : ''}`} {...register('channel')}>
            {['Bank', 'Cash', 'Bkash', 'Rocket', 'Nagad', 'Upay', 'Card', 'Virtual Card'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.channel && <span className="text-error text-sm mt-1">{errors.channel.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Date</span></label>
          <input type="date" className={`input input-bordered ${errors.date ? 'input-error' : ''}`} {...register('date')} />
          {errors.date && <span className="text-error text-sm mt-1">{errors.date.message}</span>}
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Time</span></label>
          <input type="time" className={`input input-bordered ${errors.time ? 'input-error' : ''}`} {...register('time')} />
          {errors.time && <span className="text-error text-sm mt-1">{errors.time.message}</span>}
        </div>
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Description (Optional)</span></label>
        <textarea className="textarea textarea-bordered h-24" {...register('description')} placeholder="Any additional notes..."></textarea>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? <span className="loading loading-spinner"></span> : `${initialData ? 'Update' : 'Add'} ${type === 'income' ? 'Income' : 'Expense'}`}
      </button>
    </form>

    {isManageModalOpen && (
      <dialog open className="modal modal-bottom sm:modal-middle bg-base-300/50 backdrop-blur-sm z-50">
        <div className="modal-box glass-card">
          <h3 className="font-bold text-lg mb-4">Manage Categories</h3>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="New Category Name" 
              className="input input-sm input-bordered w-full"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button 
              type="button" 
              className="btn btn-sm btn-primary"
              disabled={!newCategoryName || addCategoryMutation.isPending}
              onClick={() => addCategoryMutation.mutate(newCategoryName)}
            >
              {addCategoryMutation.isPending ? <span className="loading loading-spinner loading-xs"></span> : 'Add'}
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {modalCategories.length === 0 ? (
              <p className="text-sm text-base-content/60">No categories found.</p>
            ) : (
              modalCategories.map(cat => (
                <div key={cat._id} className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-base-content/60 opacity-60 capitalize">{cat.type}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => deleteCategoryMutation.mutate(cat._id)}
                    disabled={deleteCategoryMutation.isPending}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="modal-action mt-6">
            <button type="button" className="btn btn-ghost" onClick={() => setIsManageModalOpen(false)}>Done</button>
          </div>
        </div>
      </dialog>
    )}
    </>
  );
};

export default TransactionForm;
