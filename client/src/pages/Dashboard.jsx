import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import StatCard from '../components/StatCard';
import { DollarSign, ArrowDownToLine, ArrowUpFromLine, PiggyBank, CalendarDays, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    }
  });

  if (isLoading) return <div className="flex justify-center p-10"><span className="loading loading-dots loading-lg text-primary"></span></div>;

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const prevDate = new Date();
  prevDate.setMonth(now.getMonth() - 1);
  const previousMonthName = prevDate.toLocaleString('default', { month: 'long' });

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

  const cards = [
    { 
      title: t('Total Available Balance') || 'Total Available Balance', 
      value: formatCurrency(stats?.totalBalance || 0, user?.currency), 
      icon: DollarSign, 
      colorClass: 'bg-emerald-500/20 text-emerald-400',
      cardBgClass: 'bg-gradient-to-br from-emerald-950/80 via-emerald-900/70 to-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-xl shadow-emerald-950/40'
    },
    { 
      title: t('Current Month Balance') || 'Current my balance', 
      value: formatCurrency(stats?.currentMonthBalance || 0, user?.currency), 
      icon: Wallet, 
      colorClass: 'bg-rose-500/20 text-rose-400',
      cardBgClass: 'bg-gradient-to-br from-rose-950/80 via-red-950/70 to-rose-950/90 border-rose-500/40 text-rose-100 shadow-xl shadow-rose-950/40'
    },
    { 
      title: t('Previous Month Balance') || `Remain ${previousMonthName} Balance`, 
      value: formatCurrency(stats?.previousMonthBalance || 0, user?.currency), 
      icon: CalendarDays, 
      colorClass: 'bg-blue-500/20 text-blue-400',
      cardBgClass: 'bg-gradient-to-br from-slate-950/80 via-blue-950/70 to-indigo-950/90 border-blue-500/40 text-blue-100 shadow-xl shadow-blue-950/40'
    },
    { title: `${t('Income')} (${currentMonthName})`, value: formatCurrency(stats?.currentMonthIncome || 0, user?.currency), icon: ArrowDownToLine, colorClass: 'bg-success/20 text-success' },
    { title: `${t('Expenses')} (${currentMonthName})`, value: formatCurrency(stats?.currentMonthExpense || 0, user?.currency), icon: ArrowUpFromLine, colorClass: 'bg-error/20 text-error' },
    { title: t('Total Savings') || 'Total Savings', value: formatCurrency(stats?.totalSavings || 0, user?.currency), icon: PiggyBank, colorClass: 'bg-accent/20 text-accent' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold">{t('Dashboard') || 'Dashboard'}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="font-semibold text-lg mb-4">{t('Cash Flow') || 'Cash Flow'} (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-lg mb-4">{t('Recent Transactions') || 'Recent Transactions'}</h3>
          <div className="space-y-4">
            {stats?.recentTransactions?.length === 0 && (
              <p className="text-base-content/50 text-sm text-center py-10">No recent transactions</p>
            )}
            {stats?.recentTransactions?.map((tx, idx) => (
              <div key={tx._id || idx} className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-xl transition-all duration-300 hover:bg-warning/20 hover:-translate-y-[2px] hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                    {tx.type === 'income' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.title}</p>
                    <p className="text-xs text-base-content/60">{formatDate(tx.date)} &middot; {formatTime(tx.time)} &middot; {tx.category} &middot; {tx.channel}</p>
                  </div>
                </div>
                <div className={`font-semibold ${tx.type === 'income' ? 'text-success' : 'text-error'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};


export default Dashboard;
