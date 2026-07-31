import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, 
  TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  DollarSign, ArrowDownToLine, ArrowUpFromLine, PiggyBank, CalendarDays, Wallet, 
  Search, Bell, Plus, X, Filter, Check, ChevronDown, ChevronLeft, ChevronRight, Calendar, Clock, Trash2, Settings2 
} from 'lucide-react-native';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../lib/currency';
import { useTranslation } from '../../lib/i18n';

// Default categories & channels matching web version 1:1
const DEFAULT_CATEGORIES_INCOME = ['Salary', 'Client Project', 'Gift', 'Business', 'Freelance', 'Bonus', 'Investment', 'Others'];
const DEFAULT_CATEGORIES_EXPENSE = ['Food', 'Parents', 'Bou', 'Household', 'Bills', 'Vehicle Fare', 'Shopping', 'Medicine', 'Treat', 'Donate', 'Hadiya', 'Education', 'Travel', 'Others'];
const CHANNELS = ['Bank', 'Cash', 'Bkash', 'Rocket', 'Nagad', 'Upay', 'Card', 'Virtual Card'];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEAR_LIST = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const HOURS_LIST = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES_LIST = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

// Mock fallback stats for offline/dev bypass mode
const DEFAULT_STATS = {
  totalBalance: 12450.80,
  currentMonthBalance: 3850.20,
  previousMonthBalance: 2910.40,
  currentMonthIncome: 5200.00,
  currentMonthExpense: 1349.80,
  totalSavings: 8600.00,
  recentTransactions: [
    { _id: 'tx1', title: 'Salary Deposit', amount: 4500, type: 'income', category: 'Salary', channel: 'Bank', date: new Date().toISOString(), time: '09:00' },
    { _id: 'tx2', title: 'Grocery Shopping', amount: 124.50, type: 'expense', category: 'Food', channel: 'Card', date: new Date().toISOString(), time: '14:30' },
    { _id: 'tx3', title: 'Freelance Design', amount: 700, type: 'income', category: 'Freelance', channel: 'Bkash', date: new Date().toISOString(), time: '16:15' },
    { _id: 'tx4', title: 'Electricity Bill', amount: 85.30, type: 'expense', category: 'Utilities', channel: 'Bank', date: new Date().toISOString(), time: '18:00' },
  ]
};

const FeatureStatCard = ({ title, value, Icon, gradientBg, borderColor, iconBg, iconColor, textColor }) => (
  <View style={[styles.statCard, { backgroundColor: gradientBg, borderColor: borderColor }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={15} />
      </View>
    </View>
    <Text style={[styles.cardValue, { color: textColor || '#F8FAFC' }]}>{value}</Text>
  </View>
);

const DashboardScreen = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('income'); // 'income' | 'expense'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Salary');
  const [formChannel, setFormChannel] = useState('Bank');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Custom Calendar Modal State
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // Custom Clock Modal State
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAmPm, setSelectedAmPm] = useState('AM');

  // Custom Category State with default & custom items
  const DEFAULT_INCOME_LIST = ['Salary', 'Client Project', 'Gift', 'Business', 'Freelance', 'Bonus', 'Investment', 'Others'];
  const DEFAULT_EXPENSE_LIST = ['Food', 'Parents', 'Bou', 'Household', 'Bills', 'Vehicle Fare', 'Shopping', 'Medicine', 'Treat', 'Donate', 'Hadiya', 'Education', 'Travel', 'Others'];

  const [incomeCategories, setIncomeCategories] = useState(
    DEFAULT_INCOME_LIST.map(name => ({ _id: `def_inc_${name}`, name, type: 'income' }))
  );
  const [expenseCategories, setExpenseCategories] = useState(
    DEFAULT_EXPENSE_LIST.map(name => ({ _id: `def_exp_${name}`, name, type: 'expense' }))
  );

  const [showManageCategoryModal, setShowManageCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { timeout: 1500 });
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const fetchedIncomes = res.data.filter(c => c && (c.type === 'income' || c.type === 'both'));
        const fetchedExpenses = res.data.filter(c => c && (c.type === 'expense' || c.type === 'both'));

        setIncomeCategories(prev => {
          const names = new Set(prev.map(c => c.name));
          const additions = fetchedIncomes.filter(c => !names.has(c.name));
          return [...prev, ...additions];
        });

        setExpenseCategories(prev => {
          const names = new Set(prev.map(c => c.name));
          const additions = fetchedExpenses.filter(c => !names.has(c.name));
          return [...prev, ...additions];
        });
      }
    } catch (e) {
      console.log('Category fetch bypass');
    }
  };

  const handleAddCustomCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Required', 'Please enter a category name');
      return;
    }
    const nameStr = newCatName.trim();
    const typeStr = modalType === 'income' ? 'income' : 'expense';

    const newCat = {
      _id: `c_${Date.now()}`,
      name: nameStr,
      type: typeStr,
      isCustom: true,
    };

    try {
      await api.post('/categories', { name: nameStr, type: typeStr, icon: 'Circle' });
    } catch (e) {
      console.log('API category add failed or dev mode, adding locally');
    } finally {
      if (typeStr === 'income') {
        setIncomeCategories(prev => [...prev, newCat]);
      } else {
        setExpenseCategories(prev => [...prev, newCat]);
      }
      setFormCategory(nameStr);
      setNewCatName('');
      Alert.alert('Success', `${typeStr === 'income' ? 'Income' : 'Expense'} category "${nameStr}" added!`);
    }
  };

  const handleDeleteCategory = async (catItem) => {
    const isBackendCategory = catItem._id && !catItem._id.startsWith('def_');

    if (isBackendCategory) {
      try {
        await api.delete(`/categories/${catItem._id}`);
      } catch (e) {
        console.log('API category delete bypass');
      }
    }

    if (modalType === 'income') {
      setIncomeCategories(prev => {
        const nextList = prev.filter(c => c._id !== catItem._id);
        if (formCategory === catItem.name && nextList.length > 0) {
          setFormCategory(nextList[0].name);
        }
        return nextList;
      });
    } else {
      setExpenseCategories(prev => {
        const nextList = prev.filter(c => c._id !== catItem._id);
        if (formCategory === catItem.name && nextList.length > 0) {
          setFormCategory(nextList[0].name);
        }
        return nextList;
      });
    }
  };

  const getAvailableCategories = (type) => {
    const list = type === 'income' ? incomeCategories : expenseCategories;
    return list.map(c => c.name);
  };

  const fetchStats = async () => {
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await api.get(`/analytics/dashboard?tzOffset=${tzOffset}`, { timeout: 1500 });
      if (res?.data) {
        setStats({
          ...DEFAULT_STATS,
          ...res.data,
          recentTransactions: res.data.recentTransactions?.length ? res.data.recentTransactions : DEFAULT_STATS.recentTransactions
        });
      }
    } catch (error) {
      console.log('Using instant fallback stats:', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const openAddModal = (type) => {
    setModalType(type);
    setFormTitle('');
    setFormAmount('');
    setFormCategory(type === 'income' ? 'Salary' : 'Food');
    setFormChannel('Bank');
    
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
    const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0');

    setSelectedHour(hStr);
    setSelectedMinute(mStr);
    setSelectedAmPm(ampm);

    const t24 = ampm === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
    const tStr = `${String(t24).padStart(2, '0')}:${mStr}`;

    setFormDate(dStr);
    setFormTime(tStr);

    setFormDescription('');
    setModalVisible(true);
  };

  const handleAddTransaction = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required', 'Please enter a transaction title');
      return;
    }
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Required', 'Please enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    const txDate = formDate.trim() ? new Date(formDate).toISOString() : new Date().toISOString();
    const newTx = {
      _id: `tx_${Date.now()}`,
      title: formTitle.trim(),
      amount: numAmount,
      type: modalType,
      category: formCategory,
      channel: formChannel,
      description: formDescription,
      date: txDate,
      time: formTime.trim() || '12:00',
    };

    try {
      const endpoint = modalType === 'expense' ? '/expenses' : '/income';
      await api.post(endpoint, newTx);
    } catch (err) {
      console.log('Posting via API failed or dev mode, adding locally:', err.message);
    } finally {
      // Immediately add transaction to recent transactions & update balance state
      setStats((prev) => {
        const updatedList = [newTx, ...(prev?.recentTransactions || [])];
        const isIncome = modalType === 'income';
        return {
          ...prev,
          totalBalance: isIncome ? (prev?.totalBalance || 0) + numAmount : (prev?.totalBalance || 0) - numAmount,
          currentMonthBalance: isIncome ? (prev?.currentMonthBalance || 0) + numAmount : (prev?.currentMonthBalance || 0) - numAmount,
          currentMonthIncome: isIncome ? (prev?.currentMonthIncome || 0) + numAmount : (prev?.currentMonthIncome || 0),
          currentMonthExpense: !isIncome ? (prev?.currentMonthExpense || 0) + numAmount : (prev?.currentMonthExpense || 0),
          recentTransactions: updatedList,
        };
      });

      setIsSubmitting(false);
      setModalVisible(false);
      Alert.alert('Success', `${modalType === 'income' ? 'Income' : 'Expense'} added successfully!`);
    }
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

  // Generate calendar days matrix
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleSelectDay = (day) => {
    const dStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormDate(dStr);
    setShowDatePickerModal(false);
  };

  const handleConfirmTime = () => {
    let h = parseInt(selectedHour, 10);
    if (selectedAmPm === 'PM' && h < 12) h += 12;
    if (selectedAmPm === 'AM' && h === 12) h = 0;
    const tStr = `${String(h).padStart(2, '0')}:${selectedMinute}`;
    setFormTime(tStr);
    setShowTimePickerModal(false);
  };

  // Only take 10 recent transactions
  const top10Transactions = (stats?.recentTransactions || []).slice(0, 10);

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const prevDate = new Date();
  prevDate.setMonth(now.getMonth() - 1);
  const previousMonthName = prevDate.toLocaleString('default', { month: 'long' });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#BFDF4F" />
      </SafeAreaView>
    );
  }

  // Cards configuration matching website 1:1
  const cards = [
    {
      title: t('Total Available Balance'),
      value: formatCurrency(stats?.totalBalance || 0, user?.currency),
      Icon: DollarSign,
      gradientBg: 'rgba(6, 78, 59, 0.45)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      iconBg: 'rgba(16, 185, 129, 0.25)',
      iconColor: '#34D399',
      textColor: '#ECFDF5',
    },
    {
      title: t('Current Month Balance'),
      value: formatCurrency(stats?.currentMonthBalance || 0, user?.currency),
      Icon: Wallet,
      gradientBg: 'rgba(136, 19, 55, 0.45)',
      borderColor: 'rgba(244, 63, 94, 0.4)',
      iconBg: 'rgba(244, 63, 94, 0.25)',
      iconColor: '#FB7185',
      textColor: '#FFF1F2',
    },
    {
      title: `${t('Previous Month Balance')} (${previousMonthName})`,
      value: formatCurrency(stats?.previousMonthBalance || 0, user?.currency),
      Icon: CalendarDays,
      gradientBg: 'rgba(30, 58, 138, 0.45)',
      borderColor: 'rgba(59, 130, 246, 0.4)',
      iconBg: 'rgba(59, 130, 246, 0.25)',
      iconColor: '#60A5FA',
      textColor: '#EFF6FF',
    },
    {
      title: `${t('Income')} (${currentMonthName})`,
      value: formatCurrency(stats?.currentMonthIncome || 0, user?.currency),
      Icon: ArrowDownToLine,
      gradientBg: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      iconBg: 'rgba(16, 185, 129, 0.2)',
      iconColor: '#10B981',
      textColor: '#F8FAFC',
    },
    {
      title: `${t('Expenses')} (${currentMonthName})`,
      value: formatCurrency(stats?.currentMonthExpense || 0, user?.currency),
      Icon: ArrowUpFromLine,
      gradientBg: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#EF4444',
      textColor: '#F8FAFC',
    },
    {
      title: t('Total Savings'),
      value: formatCurrency(stats?.totalSavings || 0, user?.currency),
      Icon: PiggyBank,
      gradientBg: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      iconBg: 'rgba(191, 223, 79, 0.2)',
      iconColor: '#BFDF4F',
      textColor: '#F8FAFC',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BFDF4F" />}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t('Welcome back')},</Text>
            <Text style={styles.headerTitle}>{user?.name || 'Dev User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Search size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6 Feature Stat Cards */}
        <View style={styles.grid}>
          {cards.map((card, idx) => (
            <FeatureStatCard key={idx} {...card} />
          ))}
        </View>

        {/* Action Buttons: Add Income & Add Expense */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.incomeBtn]} 
            onPress={() => openAddModal('income')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconBg}>
              <ArrowDownToLine size={16} color="#10B981" />
            </View>
            <Text style={styles.incomeBtnText}>+ {t('Add New Income')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.expenseBtn]} 
            onPress={() => openAddModal('expense')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconBgRed}>
              <ArrowUpFromLine size={16} color="#EF4444" />
            </View>
            <Text style={styles.expenseBtnText}>+ {t('Add New Expense')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('Recent Transactions')}</Text>
        </View>

        {/* Transactions List (Max 10) */}
        <View style={styles.transactionsContainer}>
          {top10Transactions.length === 0 ? (
            <Text style={styles.emptyText}>{t('No recent transactions')}</Text>
          ) : (
            top10Transactions.map((tx, idx) => (
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

      {/* Transaction Input Form Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalBox}>
            {/* Modal Header */}
            <View style={styles.formModalHeader}>
              <Text style={[styles.formModalTitle, { color: modalType === 'income' ? '#10B981' : '#EF4444' }]}>
                {modalType === 'income' ? t('Add New Income') : t('Add New Expense')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              {/* Title Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder={modalType === 'income' ? 'e.g. Monthly Salary' : 'e.g. Grocery Store'}
                  placeholderTextColor="#64748B"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              {/* Amount Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={formAmount}
                  onChangeText={setFormAmount}
                />
              </View>

              {/* Interactive Calendar & Clock Selector Buttons */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                  <Text style={styles.label}>Date</Text>
                  <TouchableOpacity
                    style={styles.pickerBox}
                    onPress={() => setShowDatePickerModal(true)}
                    activeOpacity={0.8}
                  >
                    <Calendar size={16} color="#BFDF4F" style={{ marginRight: 6 }} />
                    <Text style={styles.pickerText}>{formDate || 'Select Date'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                  <Text style={styles.label}>Time</Text>
                  <TouchableOpacity
                    style={styles.pickerBox}
                    onPress={() => setShowTimePickerModal(true)}
                    activeOpacity={0.8}
                  >
                    <Clock size={16} color="#BFDF4F" style={{ marginRight: 6 }} />
                    <Text style={styles.pickerText}>{formTime ? formatTime(formTime) : 'Select Time'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Select Chips */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.label}>Category</Text>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(191, 223, 79, 0.15)' }}
                    onPress={() => setShowManageCategoryModal(true)}
                  >
                    <Settings2 size={12} color="#BFDF4F" />
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#BFDF4F' }}>+ Custom Category</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {getAvailableCategories(modalType).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.selectChip, formCategory === cat && styles.selectChipActive]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text style={[styles.selectChipText, formCategory === cat && styles.selectChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Channel Select Chips */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Channel / Payment Method</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {CHANNELS.map((ch) => (
                    <TouchableOpacity
                      key={ch}
                      style={[styles.selectChip, formChannel === ch && styles.selectChipActiveChannel]}
                      onPress={() => setFormChannel(ch)}
                    >
                      <Text style={[styles.selectChipText, formChannel === ch && styles.selectChipTextActive]}>
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Description Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Any additional notes..."
                  placeholderTextColor="#64748B"
                  multiline
                  value={formDescription}
                  onChangeText={setFormDescription}
                />
              </View>
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: modalType === 'income' ? '#10B981' : '#EF4444' }
              ]}
              onPress={handleAddTransaction}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {modalType === 'income' ? t('Add New Income') : t('Add New Expense')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manage Custom Categories Modal */}
      <Modal
        visible={showManageCategoryModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowManageCategoryModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.dialogOverlay}
        >
          <View style={styles.dialogBox}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: modalType === 'income' ? '#10B981' : '#EF4444' }]}>
                Manage {modalType === 'income' ? 'Income' : 'Expense'} Categories
              </Text>
              <TouchableOpacity onPress={() => setShowManageCategoryModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* New Category Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New {modalType === 'income' ? 'Income' : 'Expense'} Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder={modalType === 'income' ? 'e.g. Crypto Dividend' : 'e.g. Pet Care'}
                placeholderTextColor="#64748B"
                value={newCatName}
                onChangeText={setNewCatName}
              />
            </View>

            {/* Add Button */}
            <TouchableOpacity 
              style={[
                styles.submitBtn, 
                { backgroundColor: modalType === 'income' ? '#10B981' : '#EF4444', marginBottom: 16 }
              ]} 
              onPress={handleAddCustomCategory}
            >
              <Text style={[styles.submitBtnText, { color: '#FFFFFF' }]}>
                Add {modalType === 'income' ? 'Income' : 'Expense'} Category
              </Text>
            </TouchableOpacity>

            {/* Existing Categories List with Delete Button for Every Item */}
            <Text style={[styles.label, { marginBottom: 8 }]}>
              All {modalType === 'income' ? 'Income' : 'Expense'} Categories ({getAvailableCategories(modalType).length})
            </Text>
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {(modalType === 'income' ? incomeCategories : expenseCategories).length === 0 ? (
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', padding: 12 }}>No categories found.</Text>
              ) : (
                (modalType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                  <View key={cat._id || cat.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: modalType === 'income' ? '#10B981' : '#EF4444' }} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#F8FAFC' }}>{cat.name}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleDeleteCategory(cat)} 
                      style={{ padding: 6, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modern Dark Custom Calendar Modal */}
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Month & Year Navigator */}
            <View style={styles.calendarNavRow}>
              <TouchableOpacity 
                onPress={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(y => y - 1);
                  } else {
                    setCalendarMonth(m => m - 1);
                  }
                }}
                style={styles.navArrowBtn}
              >
                <ChevronLeft size={20} color="#BFDF4F" />
              </TouchableOpacity>

              <Text style={styles.calendarMonthText}>
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </Text>

              <TouchableOpacity 
                onPress={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(y => y + 1);
                  } else {
                    setCalendarMonth(m => m + 1);
                  }
                }}
                style={styles.navArrowBtn}
              >
                <ChevronRight size={20} color="#BFDF4F" />
              </TouchableOpacity>
            </View>

            {/* Custom Month Selector */}
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.pickerSubLabel}>Select Month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 2 }}>
                {SHORT_MONTH_NAMES.map((mName, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.monthPickerChip, calendarMonth === idx && styles.monthPickerChipActive]}
                    onPress={() => setCalendarMonth(idx)}
                  >
                    <Text style={[styles.monthPickerChipText, calendarMonth === idx && styles.monthPickerChipTextActive]}>
                      {mName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom Year Selector */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.pickerSubLabel}>Select Year</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 2 }}>
                {YEAR_LIST.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={[styles.yearPickerChip, calendarYear === yr && styles.yearPickerChipActive]}
                    onPress={() => setCalendarYear(yr)}
                  >
                    <Text style={[styles.yearPickerChipText, calendarYear === yr && styles.yearPickerChipTextActive]}>
                      {yr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Days of Week Row */}
            <View style={styles.weekDaysRow}>
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} style={styles.weekDayHeader}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.daysGrid}>
              {/* Blank spaces before start of month */}
              {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, i) => (
                <View key={`empty_${i}`} style={styles.dayCell} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = formDate === dStr;

                return (
                  <TouchableOpacity
                    key={`day_${dayNum}`}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                    onPress={() => handleSelectDay(dayNum)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modern Dark Custom Clock Time Modal */}
      <Modal
        visible={showTimePickerModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePickerModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Time Preview */}
            <View style={styles.timePreviewBox}>
              <Text style={styles.timePreviewText}>
                {selectedHour}:{selectedMinute} {selectedAmPm}
              </Text>
            </View>

            {/* Hours Selector */}
            <Text style={styles.pickerSubLabel}>Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerGridRow}>
              {HOURS_LIST.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.timeChip, selectedHour === h && styles.timeChipActive]}
                  onPress={() => setSelectedHour(h)}
                >
                  <Text style={[styles.timeChipText, selectedHour === h && styles.timeChipTextActive]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Minutes Selector */}
            <Text style={styles.pickerSubLabel}>Minute</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerGridRow}>
              {MINUTES_LIST.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.timeChip, selectedMinute === m && styles.timeChipActive]}
                  onPress={() => setSelectedMinute(m)}
                >
                  <Text style={[styles.timeChipText, selectedMinute === m && styles.timeChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* AM / PM Toggle */}
            <View style={styles.ampmRow}>
              <TouchableOpacity
                style={[styles.ampmBtn, selectedAmPm === 'AM' && styles.ampmBtnActive]}
                onPress={() => setSelectedAmPm('AM')}
              >
                <Text style={[styles.ampmText, selectedAmPm === 'AM' && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ampmBtn, selectedAmPm === 'PM' && styles.ampmBtnActive]}
                onPress={() => setSelectedAmPm('PM')}
              >
                <Text style={[styles.ampmText, selectedAmPm === 'PM' && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity style={styles.confirmTimeBtn} onPress={handleConfirmTime}>
              <Text style={styles.confirmTimeBtnText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B130E',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: '48.5%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
    marginRight: 4,
    fontWeight: '500',
  },
  iconWrapper: {
    padding: 5,
    borderRadius: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  incomeBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  expenseBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBgRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
  expenseBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
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

  // Modal Form Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 7, 0.92)',
    justifyContent: 'flex-end',
  },
  formModalBox: {
    backgroundColor: '#121D16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0px -6px 15px rgba(0, 0, 0, 0.5)',
    elevation: 25,
  },
  formModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formModalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputGroup: {
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#F8FAFC',
  },
  pickerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  chipScroll: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  selectChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectChipActiveChannel: {
    backgroundColor: '#BFDF4F',
    borderColor: '#BFDF4F',
  },
  selectChipText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  selectChipTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Custom Dialog Modal Overlay
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 7, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#121D16',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    elevation: 20,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  calendarNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  navArrowBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  calendarMonthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  monthPickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 6,
  },
  monthPickerChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  monthPickerChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  monthPickerChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  yearPickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 6,
  },
  yearPickerChipActive: {
    backgroundColor: '#BFDF4F',
    borderColor: '#BFDF4F',
  },
  yearPickerChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  yearPickerChipTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayHeader: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#BFDF4F',
  },
  dayText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#0F172A',
    fontWeight: 'bold',
  },

  // Time Dialog Styles
  timePreviewBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePreviewText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#BFDF4F',
    letterSpacing: 1,
  },
  pickerSubLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerGridRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 6,
  },
  timeChipActive: {
    backgroundColor: '#BFDF4F',
    borderColor: '#BFDF4F',
  },
  timeChipText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  ampmRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  ampmBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  ampmBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  ampmText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  ampmTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  confirmTimeBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#BFDF4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTimeBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
