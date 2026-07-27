import Savings from '../models/Savings.js';
import SavingsHistory from '../models/SavingsHistory.js';

// @desc    Get user savings accounts
// @route   GET /api/savings
// @access  Private
export const getSavings = async (req, res) => {
  try {
    const savings = await Savings.find({ user: req.user._id });
    res.json(savings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new savings account
// @route   POST /api/savings
// @access  Private
export const createSavings = async (req, res) => {
  try {
    const { accountName, balance, goal, type } = req.body;

    const savings = new Savings({
      user: req.user._id,
      accountName,
      balance: balance || 0,
      goal,
      type,
    });

    const createdSavings = await savings.save();
    res.status(201).json(createdSavings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete savings account
// @route   DELETE /api/savings/:id
// @access  Private
export const deleteSavings = async (req, res) => {
  try {
    const savings = await Savings.findById(req.params.id);

    if (savings && savings.user.toString() === req.user._id.toString()) {
      await savings.deleteOne();
      // Also delete history
      await SavingsHistory.deleteMany({ savingsAccount: req.params.id });
      res.json({ message: 'Savings account removed' });
    } else {
      res.status(404).json({ message: 'Savings account not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add transaction (Deposit/Withdraw) to a savings account
// @route   POST /api/savings/:id/transaction
// @access  Private
export const addSavingsTransaction = async (req, res) => {
  try {
    const { type, amount, date } = req.body; // type = 'Deposit' or 'Withdraw'
    const savingsId = req.params.id;

    const savings = await Savings.findById(savingsId);

    if (savings && savings.user.toString() === req.user._id.toString()) {
      const transAmount = Number(amount);
      if (type === 'Deposit') {
        savings.balance += transAmount;
      } else if (type === 'Withdraw') {
        if (savings.balance < transAmount) {
          return res.status(400).json({ message: 'Insufficient balance' });
        }
        savings.balance -= transAmount;
      } else {
        return res.status(400).json({ message: 'Invalid transaction type' });
      }

      await savings.save();

      const history = new SavingsHistory({
        user: req.user._id,
        savingsAccount: savings._id,
        type,
        amount: transAmount,
        date: date || Date.now(),
      });

      await history.save();

      res.status(201).json({ savings, history });
    } else {
      res.status(404).json({ message: 'Savings account not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get saving history
// @route   GET /api/savings/:id/history
// @access  Private
export const getSavingsHistory = async (req, res) => {
  try {
    const history = await SavingsHistory.find({ savingsAccount: req.params.id, user: req.user._id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
