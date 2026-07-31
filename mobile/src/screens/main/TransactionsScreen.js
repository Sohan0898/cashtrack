import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, 
  TouchableOpacity, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowDownToLine, ArrowUpFromLine, Filter, CalendarDays, Wallet, TrendingUp, TrendingDown 
} from 'lucide-react-native';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../lib/currency';
import { useTranslation } from '../../lib/i18n';

const { width } = Dimensions.get('window');

const MONTH_OPTIONS = ['Current Month', 'All Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEAR_OPTIONS = ['Current Year', 'All Years', '2026', '2025', '2024'];

const TransactionsScreen = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('Current Month');
  const [selectedYear, setSelectedYear] = useState('Current Year');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'

  // Cash Flow Stats
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const fetchTransactions = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        api.get('/income', { timeout: 2000 }).catch(() => ({ data: [] })),
        api.get('/expenses', { timeout: 2000 }).catch(() => ({ data: [] }))
      ]);

      const incomes = (incomeRes.data || []).map(item => ({ ...item, type: 'income' }));
      const expenses = (expenseRes.data || []).map(item => ({ ...item, type: 'expense' }));
      
      const allTx = [...incomes, ...expenses].sort((a, b) => new Date(b.date || Date.now()) - new Date(a.date || Date.now()));

      // Fallback mock data if dev/offline
      if (!allTx.length) {
        const mockData = [
          { _id: 'tx1', title: 'Salary Deposit', amount: 4500, type: 'income', category: 'Salary', channel: 'Bank', date: new Date().toISOString(), time: '09:00' },
          { _id: 'tx2', title: 'Grocery Shopping', amount: 124.50, type: 'expense', category: 'Food', channel: 'Card', date: new Date().toISOString(), time: '14:30' },
          { _id: 'tx3', title: 'Freelance Design', amount: 700, type: 'income', category: 'Freelance', channel: 'Bkash', date: new Date().toISOString(), time: '16:15' },
          { _id: 'tx4', title: 'Electricity Bill', amount: 85.30, type: 'expense', category: 'Utilities', channel: 'Bank', date: new Date().toISOString(), time: '18:00' },
          { _id: 'tx5', title: 'Restaurant Dinner', amount: 65.00, type: 'expense', category: 'Food', channel: 'Cash', date: new Date().toISOString(), time: '20:30' },
        ];
        setTransactions(mockData);
      } else {
        setTransactions(allTx);
      }
    } catch (error) {
      console.log('Using fallback transactions:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions whenever selection changes
  useEffect(() => {
    const now = new Date();
    const currMonthIndex = now.getMonth(); // 0-11
    const currYearNum = now.getFullYear();

    let list = [...transactions];

    // Filter by type
    if (typeFilter !== 'all') {
      list = list.filter(tx => tx.type === typeFilter);
    }

    // Filter by month & year
    list = list.filter(tx => {
      if (!tx.date) return true;
      const d = new Date(tx.date);
      const txMonth = d.getMonth();
      const txYear = d.getFullYear();

      // Month filter
      if (selectedMonth === 'Current Month') {
        if (txMonth !== currMonthIndex) return false;
      } else if (selectedMonth !== 'All Months') {
        const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        if (txMonth !== monthMap[selectedMonth]) return false;
      }

      // Year filter
      if (selectedYear === 'Current Year') {
        if (txYear !== currYearNum) return false;
      } else if (selectedYear !== 'All Years') {
        if (txYear !== parseInt(selectedYear, 10)) return false;
      }

      return true;
    });

    setFilteredTx(list);

    // Calculate Cash Flow strictly for the Last 30 Days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysTx = transactions.filter(tx => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      return d >= thirtyDaysAgo;
    });

    const incSum = last30DaysTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
    const expSum = last30DaysTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
    setTotalIncome(incSum);
    setTotalExpense(expSum);

  }, [transactions, selectedMonth, selectedYear, typeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`;
    } catch (e) {
      return '';
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [h, m] = timeStr.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return timeStr;
    }
  };

  const netCashFlow = totalIncome - totalExpense;
  const cashFlowMax = Math.max(totalIncome, totalExpense, 1);
  const incomePercent = Math.min(Math.round((totalIncome / cashFlowMax) * 100), 100);
  const expensePercent = Math.min(Math.round((totalExpense / cashFlowMax) * 100), 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('All Transactions')}</Text>
        <Text style={styles.headerSubtitle}>{t('Income')} & {t('Expense')} {t('Overview')}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BFDF4F" />}
      >
        {/* Cash Flow Overview Chart Card */}
        <View style={styles.cashFlowCard}>
          <View style={styles.cashFlowHeader}>
            <View>
              <Text style={styles.cashFlowTitle}>{t('Cash Flow')}</Text>
              <Text style={styles.cashFlowSub}>{t('Last 30 Days')}</Text>
            </View>
            <View style={[styles.netBadge, { backgroundColor: netCashFlow >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.netBadgeText, { color: netCashFlow >= 0 ? '#10B981' : '#EF4444' }]}>
                Net: {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, user?.currency)}
              </Text>
            </View>
          </View>

          {/* Side by Side Income & Expense Stat Boxes */}
          <View style={styles.statBoxRow}>
            <View style={[styles.statBox, styles.statBoxIncome]}>
              <View style={styles.statBoxHeader}>
                <View style={styles.statIconBgIncome}>
                  <TrendingUp size={14} color="#10B981" />
                </View>
                <Text style={styles.statBoxLabel}>{t('Income')}</Text>
              </View>
              <Text style={styles.statBoxValGreen}>+{formatCurrency(totalIncome, user?.currency)}</Text>
            </View>

            <View style={[styles.statBox, styles.statBoxExpense]}>
              <View style={styles.statBoxHeader}>
                <View style={styles.statIconBgExpense}>
                  <TrendingDown size={14} color="#EF4444" />
                </View>
                <Text style={styles.statBoxLabel}>{t('Expense')}</Text>
              </View>
              <Text style={styles.statBoxValRed}>-{formatCurrency(totalExpense, user?.currency)}</Text>
            </View>
          </View>

          {/* Combined Ratio Progress Bar */}
          <View style={styles.ratioBarSection}>
            <View style={styles.barLabelRow}>
              <Text style={styles.ratioTextGreen}>{t('Income')} {incomePercent}%</Text>
              <Text style={styles.ratioTextRed}>{t('Expense')} {expensePercent}%</Text>
            </View>
            <View style={styles.combinedBarTrack}>
              <View style={[styles.combinedBarIncome, { width: `${incomePercent}%` }]} />
              <View style={[styles.combinedBarExpense, { width: `${100 - incomePercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filterSection}>
          {/* Type Filter Buttons */}
          <View style={styles.typeFilterRow}>
            <TouchableOpacity 
              style={[styles.typeBtn, typeFilter === 'all' && styles.typeBtnActive]} 
              onPress={() => setTypeFilter('all')}
            >
              <Text style={[styles.typeBtnText, typeFilter === 'all' && styles.typeBtnTextActive]}>{t('All')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeBtn, typeFilter === 'income' && styles.typeBtnActiveIncome]} 
              onPress={() => setTypeFilter('income')}
            >
              <Text style={[styles.typeBtnText, typeFilter === 'income' && styles.typeBtnTextActive]}>{t('Income')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeBtn, typeFilter === 'expense' && styles.typeBtnActiveExpense]} 
              onPress={() => setTypeFilter('expense')}
            >
              <Text style={[styles.typeBtnText, typeFilter === 'expense' && styles.typeBtnTextActive]}>{t('Expense')}</Text>
            </TouchableOpacity>
          </View>

          {/* Month Filter Scroll */}
          <View style={styles.chipRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MONTH_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, selectedMonth === m && styles.chipActive]}
                  onPress={() => setSelectedMonth(m)}
                >
                  <Text style={[styles.chipText, selectedMonth === m && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Year Filter Scroll */}
          <View style={styles.chipRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {YEAR_OPTIONS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.chip, selectedYear === y && styles.chipActiveYear]}
                  onPress={() => setSelectedYear(y)}
                >
                  <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#BFDF4F" style={{ padding: 30 }} />
          ) : filteredTx.length === 0 ? (
            <Text style={styles.emptyText}>{t('No transactions found')}</Text>
          ) : (
            filteredTx.map((tx, idx) => (
              <View key={tx._id || idx} style={styles.transactionRow}>
                <View style={styles.txLeft}>
                  <View style={[styles.txIconWrapper, { backgroundColor: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                    {tx.type === 'income' ? (
                      <ArrowDownToLine color="#10B981" size={16} />
                    ) : (
                      <ArrowUpFromLine color="#EF4444" size={16} />
                    )}
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txMeta}>
                      {formatDate(tx.date)}{tx.time ? ` · ${formatTime(tx.time)}` : ''} · {tx.category || 'General'} · {tx.channel || 'Cash'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#10B981' : '#EF4444' }]}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B130E',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 36,
  },

  // Cash Flow Card
  cashFlowCard: {
    backgroundColor: '#121D16',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
  },
  cashFlowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cashFlowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  cashFlowSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  netBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  netBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statBoxRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statBoxIncome: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statBoxExpense: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statIconBgIncome: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statIconBgExpense: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statBoxValGreen: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statBoxValRed: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#EF4444',
  },

  // Ratio Bar Section
  ratioBarSection: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratioTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  ratioTextRed: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  combinedBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  combinedBarIncome: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  combinedBarExpense: {
    height: '100%',
    backgroundColor: '#EF4444',
  },

  // Filters Section
  filterSection: {
    marginBottom: 14,
    gap: 8,
  },
  typeFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#BFDF4F',
    borderColor: '#BFDF4F',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  typeBtnActiveExpense: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  typeBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipActiveYear: {
    backgroundColor: '#BFDF4F',
    borderColor: '#BFDF4F',
  },
  chipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },

  // Transactions List
  transactionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    padding: 24,
    fontSize: 13,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  txIconWrapper: {
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  txMeta: {
    fontSize: 11,
    color: '#94A3B8',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TransactionsScreen;
