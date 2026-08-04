import Expense from '../models/Expense.js';

// @desc    Get user expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, channel, description } = req.body;

    const expense = new Expense({
      user: req.user._id,
      title,
      amount,
      category,
      date,

      channel,
      description,
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense && expense.user.toString() === req.user._id.toString()) {
      expense.title = req.body.title || expense.title;
      expense.amount = req.body.amount || expense.amount;
      expense.category = req.body.category || expense.category;
      expense.date = req.body.date || expense.date;

      expense.channel = req.body.channel || expense.channel;
      expense.description = req.body.description !== undefined ? req.body.description : expense.description;

      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense && expense.user.toString() === req.user._id.toString()) {
      await expense.deleteOne();
      res.json({ message: 'Expense removed' });
    } else {
      res.status(404).json({ message: 'Expense not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
