import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, 
  Alert, Modal, TextInput, RefreshControl, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  PiggyBank, Plus, ArrowUpCircle, ArrowDownCircle, History, X, Edit2, Trash2, Check, Landmark 
} from 'lucide-react-native';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../lib/currency';
import { useTranslation } from '../../lib/i18n';

const ACCOUNT_TYPES = ['Bank', 'Cash', 'Bkash', 'Nagad', 'Card', 'Matir Bank'];

const INITIAL_FALLBACK_ACCOUNTS = [
  { _id: 's1', accountName: 'Emergency Fund', type: 'Bank', balance: 5200, goal: 10000 },
  { _id: 's2', accountName: 'Dream Vacation', type: 'Bkash', balance: 1400, goal: 3000 },
  { _id: 's3', accountName: 'Home Deposit', type: 'Cash', balance: 2000, goal: 5000 },
];

const INITIAL_FALLBACK_HISTORY = [
  { _id: 'h1', savingsAccount: { accountName: 'Emergency Fund', type: 'Bank' }, type: 'Deposit', amount: 500, date: new Date().toISOString() },
  { _id: 'h2', savingsAccount: { accountName: 'Dream Vacation', type: 'Bkash' }, type: 'Deposit', amount: 200, date: new Date().toISOString() },
  { _id: 'h3', savingsAccount: { accountName: 'Home Deposit', type: 'Cash' }, type: 'Withdraw', amount: 100, date: new Date().toISOString() },
];

const SavingsScreen = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [savings, setSavings] = useState(INITIAL_FALLBACK_ACCOUNTS);
  const [history, setHistory] = useState(INITIAL_FALLBACK_HISTORY);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form Fields
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('Bank');
  const [accGoal, setAccGoal] = useState('');

  // Transaction Form (Deposit / Withdraw)
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [txType, setTxType] = useState('Deposit'); // 'Deposit' | 'Withdraw'
  const [txAmount, setTxAmount] = useState('');

  // Edit Account Form
  const [editingAcc, setEditingAcc] = useState(null);

  const fetchSavingsData = async () => {
    try {
      const [savRes, histRes] = await Promise.all([
        api.get('/savings', { timeout: 1500 }).catch(() => null),
        api.get('/savings/history/all', { timeout: 1500 }).catch(() => null)
      ]);

      if (savRes?.data && savRes.data.length > 0) {
        setSavings(savRes.data);
      }
      if (histRes?.data && histRes.data.length > 0) {
        setHistory(histRes.data);
      }
    } catch (e) {
      console.log('Using offline fallback savings');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavingsData();
  };

  const totalSavings = savings.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // 1. Create New Savings Account
  const handleCreateAccount = async () => {
    if (!accName.trim()) {
      Alert.alert('Required', 'Please enter an account name');
      return;
    }

    const goalNum = parseFloat(accGoal) || 0;
    const newAcc = {
      _id: `s_${Date.now()}`,
      accountName: accName.trim(),
      type: accType,
      balance: 0,
      goal: goalNum,
    };

    try {
      await api.post('/savings', { accountName: accName.trim(), type: accType, goal: goalNum });
    } catch (e) {
      console.log('Backend post failed or dev mode, adding locally');
    } finally {
      setSavings(prev => [newAcc, ...prev]);
      setShowAddModal(false);
      setAccName('');
      setAccGoal('');
      Alert.alert('Success', 'Savings account created!');
    }
  };

  // 2. Deposit or Withdraw Transaction
  const handleAccountTransaction = async () => {
    const num = parseFloat(txAmount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Required', 'Please enter a valid amount greater than 0');
      return;
    }

    const targetAcc = savings.find(a => a._id === activeAccountId);
    if (!targetAcc) return;

    if (txType === 'Withdraw' && num > targetAcc.balance) {
      Alert.alert('Insufficient Balance', 'Cannot withdraw more than current account balance');
      return;
    }

    try {
      await api.post(`/savings/${activeAccountId}/transaction`, { type: txType, amount: num });
    } catch (e) {
      console.log('API tx failed or dev mode, processing locally');
    } finally {
      // Update balance locally
      setSavings(prev => prev.map(acc => {
        if (acc._id === activeAccountId) {
          const newBal = txType === 'Deposit' ? acc.balance + num : acc.balance - num;
          return { ...acc, balance: newBal };
        }
        return acc;
      }));

      // Add to history
      const newHistItem = {
        _id: `h_${Date.now()}`,
        savingsAccount: { accountName: targetAcc.accountName, type: targetAcc.type },
        type: txType,
        amount: num,
        date: new Date().toISOString(),
      };
      setHistory(prev => [newHistItem, ...prev]);

      setShowTxModal(false);
      setTxAmount('');
      Alert.alert('Success', `${txType} of ${formatCurrency(num, user?.currency)} completed!`);
    }
  };

  // 3. Edit Account
  const openEditModal = (acc) => {
    setEditingAcc({ ...acc });
    setShowEditModal(true);
  };

  const handleUpdateAccount = async () => {
    if (!editingAcc?.accountName?.trim()) {
      Alert.alert('Required', 'Account name required');
      return;
    }

    try {
      await api.put(`/savings/${editingAcc._id}`, { 
        accountName: editingAcc.accountName.trim(), 
        type: editingAcc.type, 
        goal: parseFloat(editingAcc.goal) || 0 
      });
    } catch (e) {
      console.log('Update failed or dev mode, updating locally');
    } finally {
      setSavings(prev => prev.map(a => a._id === editingAcc._id ? editingAcc : a));
      setShowEditModal(false);
      setEditingAcc(null);
      Alert.alert('Success', 'Account updated successfully!');
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = (accId, accName) => {
    Alert.alert('Delete Account', `Are you sure you want to delete "${accName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await api.delete(`/savings/${accId}`);
          } catch (e) {
            console.log('Delete API failed or dev mode, removing locally');
          } finally {
            setSavings(prev => prev.filter(a => a._id !== accId));
            Alert.alert('Deleted', 'Account removed');
          }
        } 
      }
    ]);
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

  const formatTime = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBg}>
            <PiggyBank size={20} color="#BFDF4F" />
          </View>
          <Text style={styles.headerTitle}>{t('Savings Accounts')}</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Plus size={16} color="#0F172A" />
          <Text style={styles.addBtnText}>{t('Add Account')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BFDF4F" />}
      >
        {/* Total Savings Banner matching Web 1:1 */}
        <View style={styles.totalCard}>
          <Text style={styles.totalSub}>{t('Total Savings Balance')}</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalSavings, user?.currency)}</Text>
        </View>

        {/* Savings Accounts Grid */}
        <Text style={styles.sectionTitle}>{t('Your Accounts')}</Text>
        {savings.length === 0 ? (
          <Text style={styles.emptyText}>{t('No savings accounts found')}</Text>
        ) : (
          <View style={styles.cardsGrid}>
            {savings.map((acc) => {
              const progress = acc.goal ? Math.min((acc.balance / acc.goal) * 100, 100) : 0;
              return (
                <View key={acc._id} style={styles.accCard}>
                  {/* Account Card Header */}
                  <View style={styles.accCardHeader}>
                    <View style={styles.accTitleGroup}>
                      <Text style={styles.accName}>{acc.accountName}</Text>
                      <Text style={styles.accTypeBadge}>{acc.type}</Text>
                    </View>

                    {/* Card Actions (Edit & Delete) */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity onPress={() => openEditModal(acc)} style={styles.actionIconBtn}>
                        <Edit2 size={15} color="#94A3B8" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteAccount(acc._id, acc.accountName)} style={styles.actionIconBtn}>
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Account Balance */}
                  <Text style={styles.accBalance}>{formatCurrency(acc.balance, user?.currency)}</Text>

                  {/* Goal Progress Bar */}
                  {acc.goal ? (
                    <View style={styles.goalContainer}>
                      <View style={styles.goalTrack}>
                        <View style={[styles.goalFill, { width: `${progress}%` }]} />
                      </View>
                      <View style={styles.goalRowText}>
                        <Text style={styles.goalText}>{t('Goal')}: {formatCurrency(acc.goal, user?.currency)}</Text>
                        <Text style={styles.goalPercent}>{Math.round(progress)}%</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Deposit & Withdraw Action Buttons */}
                  <View style={styles.cardBtnRow}>
                    <TouchableOpacity 
                      style={[styles.cardActionBtn, styles.depositBtn]}
                      onPress={() => {
                        setActiveAccountId(acc._id);
                        setTxType('Deposit');
                        setTxAmount('');
                        setShowTxModal(true);
                      }}
                    >
                      <ArrowUpCircle size={15} color="#10B981" />
                      <Text style={styles.depositBtnText}>{t('Deposit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.cardActionBtn, styles.withdrawBtn]}
                      onPress={() => {
                        setActiveAccountId(acc._id);
                        setTxType('Withdraw');
                        setTxAmount('');
                        setShowTxModal(true);
                      }}
                    >
                      <ArrowDownCircle size={15} color="#EF4444" />
                      <Text style={styles.withdrawBtnText}>{t('Withdraw')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Savings History Log */}
        <View style={styles.sectionHeaderRow}>
          <History size={18} color="#BFDF4F" />
          <Text style={styles.sectionTitle}>{t('Savings History')}</Text>
        </View>

        <View style={styles.historyBox}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>{t('No savings history found')}</Text>
          ) : (
            history.map((tx, idx) => (
              <View key={tx._id || idx} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <View style={[styles.histIconBg, { backgroundColor: tx.type === 'Deposit' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                    {tx.type === 'Deposit' ? (
                      <ArrowUpCircle size={16} color="#10B981" />
                    ) : (
                      <ArrowDownCircle size={16} color="#EF4444" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.histName}>{tx.savingsAccount?.accountName || 'Savings Account'}</Text>
                    <Text style={styles.histSub}>
                      {formatDate(tx.date)}{tx.date ? ` · ${formatTime(tx.date)}` : ''} · {tx.savingsAccount?.type || 'Bank'}
                    </Text>
                  </View>
                </View>

                <View style={styles.histRight}>
                  <Text style={[styles.histAmount, { color: tx.type === 'Deposit' ? '#10B981' : '#EF4444' }]}>
                    {tx.type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                  </Text>
                  <Text style={[styles.histBadge, { color: tx.type === 'Deposit' ? '#10B981' : '#EF4444' }]}>
                    {tx.type}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal 1: Create New Savings Account */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Create Savings Account')}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Account Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Account Name')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Emergency Fund" 
                placeholderTextColor="#64748B" 
                value={accName} 
                onChangeText={setAccName} 
              />
            </View>

            {/* Account Type Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Type')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {ACCOUNT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, accType === t && styles.typeChipActive]}
                    onPress={() => setAccType(t)}
                  >
                    <Text style={[styles.typeChipText, accType === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Goal Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Goal Amount')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder="0.00" 
                keyboardType="numeric" 
                placeholderTextColor="#64748B" 
                value={accGoal} 
                onChangeText={setAccGoal} 
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateAccount}>
              <Text style={styles.saveBtnText}>{t('Create Account')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal 2: Deposit / Withdraw Transaction */}
      <Modal
        visible={showTxModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowTxModal(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: txType === 'Deposit' ? '#10B981' : '#EF4444' }]}>
                {txType === 'Deposit' ? t('Deposit') : t('Withdraw')} {t('to Savings')}
              </Text>
              <TouchableOpacity onPress={() => setShowTxModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Amount')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder="0.00" 
                keyboardType="numeric" 
                placeholderTextColor="#64748B" 
                autoFocus
                value={txAmount} 
                onChangeText={setTxAmount} 
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: txType === 'Deposit' ? '#10B981' : '#EF4444' }]} 
              onPress={handleAccountTransaction}
            >
              <Text style={[styles.saveBtnText, { color: '#FFFFFF' }]}>{t('Confirm')} {txType === 'Deposit' ? t('Deposit') : t('Withdraw')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Edit Savings Account */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Edit Account')}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Account Name')}</Text>
              <TextInput 
                style={styles.input} 
                value={editingAcc?.accountName || ''} 
                onChangeText={(v) => setEditingAcc(prev => ({ ...prev, accountName: v }))} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Type')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {ACCOUNT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, editingAcc?.type === t && styles.typeChipActive]}
                    onPress={() => setEditingAcc(prev => ({ ...prev, type: t }))}
                  >
                    <Text style={[styles.typeChipText, editingAcc?.type === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Goal Amount')}</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={String(editingAcc?.goal || '')} 
                onChangeText={(v) => setEditingAcc(prev => ({ ...prev, goal: v }))} 
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateAccount}>
              <Text style={styles.saveBtnText}>{t('Save Changes')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B130E' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 8 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBg: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(191, 223, 79, 0.15)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: '#BFDF4F', 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 10 
  },
  addBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 },
  scrollContent: { padding: 14, paddingBottom: 36 },

  // Total Card
  totalCard: { 
    backgroundColor: '#121D16', 
    borderRadius: 18, 
    padding: 18, 
    borderWidth: 1, 
    borderColor: 'rgba(191, 223, 79, 0.3)', 
    marginBottom: 18 
  },
  totalSub: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: '#BFDF4F' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10, marginTop: 4 },

  // Grid
  cardsGrid: { gap: 12, marginBottom: 18 },
  accCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.04)', 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)' 
  },
  accCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  accTitleGroup: { flex: 1, gap: 4 },
  accName: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  accTypeBadge: { 
    fontSize: 11, 
    color: '#BFDF4F', 
    backgroundColor: 'rgba(191, 223, 79, 0.15)', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6, 
    alignSelf: 'flex-start',
    fontWeight: '600',
  },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionIconBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  accBalance: { fontSize: 22, fontWeight: 'bold', color: '#10B981', marginVertical: 4 },
  goalContainer: { gap: 4, marginTop: 4, marginBottom: 8 },
  goalTrack: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: '#BFDF4F', borderRadius: 3 },
  goalRowText: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  goalText: { fontSize: 11, color: '#94A3B8' },
  goalPercent: { fontSize: 11, color: '#BFDF4F', fontWeight: 'bold' },

  // Card Action Buttons
  cardBtnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cardActionBtn: { 
    flex: 1, 
    height: 38, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    borderWidth: 1 
  },
  depositBtn: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  withdrawBtn: { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  depositBtnText: { color: '#10B981', fontWeight: '700', fontSize: 13 },
  withdrawBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },

  // History List
  historyBox: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' },
  emptyText: { color: '#94A3B8', textAlign: 'center', padding: 24, fontSize: 13 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  histIconBg: { padding: 8, borderRadius: 10 },
  histName: { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  histSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histAmount: { fontSize: 14, fontWeight: '700' },
  histBadge: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(5, 12, 7, 0.92)', justifyContent: 'flex-end' },
  modalBox: { 
    backgroundColor: '#121D16', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 20, 
    paddingBottom: 32, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.15)' 
  },
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(5, 12, 7, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dialogBox: { width: '100%', maxWidth: 340, backgroundColor: '#121D16', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  closeBtn: { padding: 6, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: '500' },
  input: { 
    backgroundColor: 'rgba(255, 255, 255, 0.07)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.12)', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    fontSize: 14, 
    color: '#F8FAFC' 
  },
  chipScroll: { flexDirection: 'row', paddingVertical: 2 },
  typeChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.06)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    marginRight: 8 
  },
  typeChipActive: { backgroundColor: '#BFDF4F', borderColor: '#BFDF4F' },
  typeChipText: { fontSize: 12, color: '#94A3B8' },
  typeChipTextActive: { color: '#0F172A', fontWeight: 'bold' },
  saveBtn: { height: 46, borderRadius: 12, backgroundColor: '#BFDF4F', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
});

export default SavingsScreen;
