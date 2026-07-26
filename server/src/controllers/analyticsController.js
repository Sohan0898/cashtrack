import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Savings from '../models/Savings.js';

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Dates for current and previous month calculations
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const incomes = await Income.find({ user: userId });
    const expenses = await Expense.find({ user: userId });
    const savingsAccounts = await Savings.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let prevMonthIncome = 0;
    let prevMonthExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;
    
    incomes.forEach(i => {
      totalIncome += i.amount;
      if (i.date >= startOfCurrentMonth) currentMonthIncome += i.amount;
      if (i.date >= startOfPrevMonth && i.date <= endOfPrevMonth) prevMonthIncome += i.amount;
      if (i.date >= startOfToday) todayIncome += i.amount;
    });

    expenses.forEach(e => {
      totalExpense += e.amount;
      if (e.date >= startOfCurrentMonth) currentMonthExpense += e.amount;
      if (e.date >= startOfPrevMonth && e.date <= endOfPrevMonth) prevMonthExpense += e.amount;
      if (e.date >= startOfToday) todayExpense += e.amount;
    });

    const totalSavings = savingsAccounts.reduce((acc, curr) => acc + curr.balance, 0);

    const availableBalance = totalIncome - totalExpense - totalSavings;
    const currentMonthBalance = currentMonthIncome - currentMonthExpense;
    const prevMonthBalance = prevMonthIncome - prevMonthExpense;

    // Recent transactions (combine income & expense, sort by date desc, take top 5)
    const recentIncomes = incomes.map(i => ({ ...i._doc, type: 'income' }));
    const recentExpenses = expenses.map(e => ({ ...e._doc, type: 'expense' }));
    const allTransactions = [...recentIncomes, ...recentExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // Chart Data (Last 30 days cash flow)
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayIncomes = incomes.filter(inc => new Date(inc.date).toISOString().split('T')[0] === dateStr).reduce((a, b) => a + b.amount, 0);
      const dayExpenses = expenses.filter(exp => new Date(exp.date).toISOString().split('T')[0] === dateStr).reduce((a, b) => a + b.amount, 0);

      chartData.push({
        date: dateStr,
        income: dayIncomes,
        expense: dayExpenses
      });
    }

    res.json({
      totalBalance: availableBalance,
      currentMonthBalance,
      previousMonthBalance: prevMonthBalance,
      todayIncome,
      todayExpense,
      currentMonthIncome,
      currentMonthExpense,
      totalSavings,
      recentTransactions: allTransactions,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get data for reports
// @route   GET /api/analytics/reports
// @access  Private
export const getReportsData = async (req, res) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    const userId = req.user._id;

    const targetMonth = month !== undefined ? parseInt(month) : new Date().getMonth();
    const targetYear = year !== undefined ? parseInt(year) : new Date().getFullYear();

    const startOfTargetMonth = new Date(targetYear, targetMonth, 1);
    const endOfTargetMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    
    const startOfTargetYear = new Date(targetYear, 0, 1);
    const endOfTargetYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    let dateFilter = {};
    if (req.query.fetchAll === 'true') {
      dateFilter = {};
    } else if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      dateFilter = {
        date: {
          $gte: startOfTargetMonth,
          $lte: endOfTargetMonth
        }
      };
    }

    const incomes = await Income.find({ user: userId, ...dateFilter });
    const expenses = await Expense.find({ user: userId, ...dateFilter });

    const [monthIncomeAgg] = await Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfTargetMonth, $lte: endOfTargetMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [yearIncomeAgg] = await Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfTargetYear, $lte: endOfTargetYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [monthExpenseAgg] = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfTargetMonth, $lte: endOfTargetMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [yearExpenseAgg] = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfTargetYear, $lte: endOfTargetYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({ 
      incomes, 
      expenses,
      totals: {
        monthlyIncome: monthIncomeAgg?.total || 0,
        monthlyExpense: monthExpenseAgg?.total || 0,
        yearlyIncome: yearIncomeAgg?.total || 0,
        yearlyExpense: yearExpenseAgg?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
