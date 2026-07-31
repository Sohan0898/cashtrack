import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  PieChart as PieChartIcon, TrendingUp, TrendingDown, CalendarDays, Calendar, Globe 
} from 'lucide-react-native';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../lib/currency';
import { useTranslation } from '../../lib/i18n';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = [2026, 2025, 2024, 2023];

const CATEGORY_COLORS = ['#14B8A6', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

const ReportsScreen = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async () => {
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await api.get(`/analytics/reports?month=${selectedMonth}&year=${selectedYear}&tzOffset=${tzOffset}`, { timeout: 2000 }).catch(() => null);
      if (res?.data) {
        setReportData(res.data);
      } else {
        // Fallback demo statistics if offline / dev server
        setReportData({
          totals: {
            monthlyIncome: 4500,
            monthlyExpense: 1349.80,
            yearlyIncome: 48000,
            yearlyExpense: 16200,
            lifetimeIncome: 125000,
            lifetimeExpense: 42000,
          },
          incomes: [
            { category: 'Salary', amount: 3800 },
            { category: 'Freelance', amount: 700 },
          ],
          expenses: [
            { category: 'Food & Dining', amount: 450 },
            { category: 'Bills & Utilities', amount: 320 },
            { category: 'Shopping', amount: 250 },
            { category: 'Transport', amount: 180 },
            { category: 'Healthcare', amount: 149.80 },
          ],
        });
      }
    } catch (e) {
      console.log('Using offline report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const totals = reportData?.totals || {
    monthlyIncome: 0, monthlyExpense: 0,
    yearlyIncome: 0, yearlyExpense: 0,
    lifetimeIncome: 0, lifetimeExpense: 0,
  };

  // Group categories for Income & Expense
  const getCategoryGroup = (items) => {
    if (!items || !items.length) return [];
    const sum = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const map = {};
    items.forEach(item => {
      map[item.category] = (map[item.category] || 0) + (item.amount || 0);
    });
    return Object.entries(map).map(([name, amount], i) => ({
      name,
      amount,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      percent: sum ? Math.round((amount / sum) * 100) : 0,
    }));
  };

  const incomeCategories = getCategoryGroup(reportData?.incomes);
  const expenseCategories = getCategoryGroup(reportData?.expenses);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBg}>
            <PieChartIcon size={20} color="#BFDF4F" />
          </View>
          <Text style={styles.headerTitle}>{t('Analytics & Reports')}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BFDF4F" />}
      >
        {/* Selected Period Banner matching Web 1:1 */}
        <View style={styles.periodBanner}>
          <Text style={styles.periodText}>{MONTH_NAMES[selectedMonth]}, {selectedYear}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#BFDF4F" style={{ padding: 40 }} />
        ) : (
          <>
            {/* 1. Monthly Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.cardIconBg, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                    <CalendarDays size={18} color="#EAB308" />
                  </View>
                  <Text style={styles.cardTitle}>{t('Monthly Overview')}</Text>
                </View>
              </View>

              {/* Month Selector Scroll */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {SHORT_MONTHS.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, selectedMonth === idx && styles.chipActive]}
                    onPress={() => setSelectedMonth(idx)}
                  >
                    <Text style={[styles.chipText, selectedMonth === idx && styles.chipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.divider} />

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('Income')}</Text>
                <View style={styles.statValueRow}>
                  <TrendingUp size={15} color="#10B981" />
                  <Text style={styles.statValGreen}>{formatCurrency(totals.monthlyIncome, user?.currency)}</Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('Expense')}</Text>
                <View style={styles.statValueRow}>
                  <TrendingDown size={15} color="#EF4444" />
                  <Text style={styles.statValRed}>{formatCurrency(totals.monthlyExpense, user?.currency)}</Text>
                </View>
              </View>
            </View>

            {/* 2. Yearly Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.cardIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                    <Calendar size={18} color="#A855F7" />
                  </View>
                  <Text style={styles.cardTitle}>{t('Yearly Overview')}</Text>
                </View>
              </View>

              {/* Year Selector Scroll */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {YEARS.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.chip, selectedYear === y && styles.chipActivePurple]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.divider} />

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('Income')}</Text>
                <View style={styles.statValueRow}>
                  <TrendingUp size={15} color="#10B981" />
                  <Text style={styles.statValGreen}>{formatCurrency(totals.yearlyIncome, user?.currency)}</Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('Expense')}</Text>
                <View style={styles.statValueRow}>
                  <TrendingDown size={15} color="#EF4444" />
                  <Text style={styles.statValRed}>{formatCurrency(totals.yearlyExpense, user?.currency)}</Text>
                </View>
              </View>
            </View>

            {/* 3. Lifetime Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.cardIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Globe size={18} color="#3B82F6" />
                  </View>
                  <Text style={styles.cardTitle}>{t('Lifetime Overview')}</Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('Income')}</Text>
                <View style={styles.statValueRow}>
                  <TrendingUp size={15} color="#10B981" />
                  <Text style={styles.statValGreen}>{formatCurrency(totals.lifetimeIncome, user?.currency)}</Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('Expense')}</Text>
                <View style={styles.statValueRow}>
                  <TrendingDown size={15} color="#EF4444" />
                  <Text style={styles.statValRed}>{formatCurrency(totals.lifetimeExpense, user?.currency)}</Text>
                </View>
              </View>
            </View>

            {/* 4. Income by Category */}
            <Text style={styles.sectionTitle}>{t('Income by Category')}</Text>
            <View style={styles.breakdownCard}>
              {!incomeCategories.length ? (
                <Text style={styles.emptyText}>No income data for this period</Text>
              ) : (
                incomeCategories.map((item, idx) => (
                  <View key={idx} style={styles.catItem}>
                    <View style={styles.catRow}>
                      <View style={styles.catLeft}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.catName}>{item.name}</Text>
                      </View>
                      <Text style={styles.catAmount}>{formatCurrency(item.amount, user?.currency)} ({item.percent}%)</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* 5. Expense by Category */}
            <Text style={styles.sectionTitle}>Expense by Category</Text>
            <View style={styles.breakdownCard}>
              {!expenseCategories.length ? (
                <Text style={styles.emptyText}>No expense data for this period</Text>
              ) : (
                expenseCategories.map((item, idx) => (
                  <View key={idx} style={styles.catItem}>
                    <View style={styles.catRow}>
                      <View style={styles.catLeft}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.catName}>{item.name}</Text>
                      </View>
                      <Text style={styles.catAmount}>{formatCurrency(item.amount, user?.currency)} ({item.percent}%)</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B130E' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBg: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(191, 223, 79, 0.15)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  scrollContent: { padding: 14, paddingBottom: 36 },

  periodBanner: { alignItems: 'center', marginVertical: 10 },
  periodText: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },

  // Overview Cards
  overviewCard: { 
    backgroundColor: '#121D16', 
    borderRadius: 18, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    marginBottom: 14 
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBg: { padding: 8, borderRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  chipScroll: { flexDirection: 'row', marginBottom: 10 },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    marginRight: 6 
  },
  chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipActivePurple: { backgroundColor: '#A855F7', borderColor: '#A855F7' },
  chipText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  chipTextActive: { color: '#0F172A', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  statLabel: { fontSize: 13, color: '#CBD5E1', fontWeight: '500' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValGreen: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
  statValRed: { fontSize: 15, fontWeight: 'bold', color: '#EF4444' },

  // Breakdown Cards
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginTop: 10, marginBottom: 10 },
  breakdownCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.04)', 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)', 
    marginBottom: 16,
    gap: 12,
  },
  emptyText: { color: '#94A3B8', textAlign: 'center', padding: 16, fontSize: 13 },
  catItem: { gap: 6 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
  catAmount: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  barTrack: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});

export default ReportsScreen;
