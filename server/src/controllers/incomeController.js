import Income from '../models/Income.js';
import Savings from '../models/Savings.js';

// @desc    Get user incomes
// @route   GET /api/income
// @access  Private
export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new income
// @route   POST /api/income
// @access  Private
export const createIncome = async (req, res) => {
  try {
    const { title, amount, category, date, time, channel, description } = req.body;

    const income = new Income({
      user: req.user._id,
      title,
      amount,
      category,
      date,
      time,
      channel,
      description,
    });

    const createdIncome = await income.save();

    // Optionally update savings/balance logic if channel maps to a savings account
    // But usually income just increases overall available balance
    
    res.status(201).json(createdIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
export const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (income && income.user.toString() === req.user._id.toString()) {
      income.title = req.body.title || income.title;
      income.amount = req.body.amount || income.amount;
      income.category = req.body.category || income.category;
      income.date = req.body.date || income.date;
      income.time = req.body.time || income.time;
      income.channel = req.body.channel || income.channel;
      income.description = req.body.description !== undefined ? req.body.description : income.description;

      const updatedIncome = await income.save();
      res.json(updatedIncome);
    } else {
      res.status(404).json({ message: 'Income not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (income && income.user.toString() === req.user._id.toString()) {
      await income.deleteOne();
      res.json({ message: 'Income removed' });
    } else {
      res.status(404).json({ message: 'Income not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
