import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { formatCurrency } from '../lib/currency';
import api from '../lib/axios';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, CalendarDays, Calendar, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#14B8A6', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

const Reports = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(10), (val, index) => currentYear - 5 + index);

  const formatChartDate = () => {
    return `${months[selectedMonth]}, ${selectedYear}`;
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reports', selectedMonth, selectedYear],
    queryFn: async () => {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await api.get(`/analytics/reports?month=${selectedMonth}&year=${selectedYear}&tzOffset=${tzOffset}`);
      return res.data;
    },
    placeholderData: keepPreviousData
  });

  const getCategoryData = (transactions) => {
    if (!transactions) return [];
    const grouped = transactions.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  };

  const incomeData = getCategoryData(data?.incomes);
  const expenseData = getCategoryData(data?.expenses);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/20 text-info rounded-xl">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            {t('Reports') || 'Analytics & Reports'}
            {isFetching && <span className="loading loading-bars loading-sm text-primary"></span>}
          </h2>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-success">{formatChartDate()}</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><span className="loading loading-bars loading-lg text-primary"></span></div>
      ) : (
        <div className="space-y-6">
          {data?.totals && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-600/20 text-yellow-600 rounded-lg">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Monthly Overview</h3>
                  </div>
                  <select 
                    className="select select-bordered select-sm" 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                  >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-base-content/10">
                    <span className="text-base-content/70 font-medium">Income</span>
                    <span className="text-xl font-bold text-success flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {formatCurrency(data.totals.monthlyIncome, user?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70 font-medium">Expense</span>
                    <span className="text-xl font-bold text-error flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      {formatCurrency(data.totals.monthlyExpense, user?.currency)}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 text-purple-600 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Yearly Overview</h3>
                  </div>
                  <select 
                    className="select select-bordered select-sm" 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(Number(e.target.value))}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-base-content/10">
                    <span className="text-base-content/70 font-medium">Income</span>
                    <span className="text-xl font-bold text-success flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {formatCurrency(data.totals.yearlyIncome, user?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70 font-medium">Expense</span>
                    <span className="text-xl font-bold text-error flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      {formatCurrency(data.totals.yearlyExpense, user?.currency)}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 text-blue-600 rounded-lg">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Lifetime Overview</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-base-content/10">
                    <span className="text-base-content/70 font-medium">Income</span>
                    <span className="text-xl font-bold text-success flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {formatCurrency(data.totals.lifetimeIncome, user?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70 font-medium">Expense</span>
                    <span className="text-xl font-bold text-error flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      {formatCurrency(data.totals.lifetimeExpense, user?.currency)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6 text-center">Income by Category</h3>
            {incomeData.length > 0 ? (
              <div className="h-[450px] lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeData} cx="50%" cy="40%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {incomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${formatCurrency(value, user?.currency)}`} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[450px] lg:h-[400px] flex items-center justify-center text-base-content/50">No income data for this period</div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6 text-center">Expense by Category</h3>
            {expenseData.length > 0 ? (
              <div className="h-[450px] lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseData} cx="50%" cy="40%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${formatCurrency(value, user?.currency)}`} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[450px] lg:h-[400px] flex items-center justify-center text-base-content/50">No expense data for this period</div>
            )}
          </motion.div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Reports;
