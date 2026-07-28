import BankInterest from '../models/BankInterest.js';

// @desc    Get user bank interest data
// @route   GET /api/interest
// @access  Private
export const getInterest = async (req, res) => {
  try {
    const interests = await BankInterest.find({ user: req.user._id }).sort({ date: -1 });
    
    // Calculate total interest (Add - Infaq)
    const totalInterest = interests.reduce((total, tx) => {
      if (tx.type === 'Add') return total + tx.amount;
      if (tx.type === 'Infaq') return total - tx.amount;
      return total;
    }, 0);

    res.json({ totalInterest, history: interests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new bank interest
// @route   POST /api/interest/add
// @access  Private
export const addInterest = async (req, res) => {
  try {
    const { amount, bank, date } = req.body;

    const interest = new BankInterest({
      user: req.user._id,
      type: 'Add',
      amount: Number(amount),
      bank,
      date: date || Date.now(),
    });

    const createdInterest = await interest.save();
    res.status(201).json(createdInterest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Withdraw interest (Infaq)
// @route   POST /api/interest/infaq
// @access  Private
export const infaqInterest = async (req, res) => {
  try {
    const { amount, date } = req.body;
    const withdrawAmount = Number(amount);

    // Calculate current total to ensure they have enough to infaq
    const interests = await BankInterest.find({ user: req.user._id });
    const totalInterest = interests.reduce((total, tx) => {
      if (tx.type === 'Add') return total + tx.amount;
      if (tx.type === 'Infaq') return total - tx.amount;
      return total;
    }, 0);

    if (withdrawAmount > totalInterest) {
      return res.status(400).json({ message: 'Insufficient interest balance for this Infaq' });
    }

    const infaq = new BankInterest({
      user: req.user._id,
      type: 'Infaq',
      amount: withdrawAmount,
      date: date || Date.now(),
    });

    const createdInfaq = await infaq.save();
    res.status(201).json(createdInfaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an interest transaction
// @route   DELETE /api/interest/:id
// @access  Private
export const deleteInterestTransaction = async (req, res) => {
  try {
    const interest = await BankInterest.findById(req.params.id);

    if (interest && interest.user.toString() === req.user._id.toString()) {
      await interest.deleteOne();
      res.json({ message: 'Interest transaction removed' });
    } else {
      res.status(404).json({ message: 'Interest transaction not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all bank interest data
// @route   DELETE /api/interest/clear
// @access  Private
export const clearAllInterest = async (req, res) => {
  try {
    await BankInterest.deleteMany({ user: req.user._id });
    res.json({ message: 'All interest data cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
