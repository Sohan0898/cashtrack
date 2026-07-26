import Category from '../models/Category.js';
import User from '../models/User.js';

// @desc    Get all categories for user (default + custom)
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    
    if (!user.hasSeededCategories) {
      const defaultIncome = ['Salary', 'Client Project', 'Gift', 'Business', 'Freelance', 'Bonus', 'Investment', 'Others'];
      const defaultExpense = ['Food', 'Parents', 'Bou', 'Household', 'Bills', 'Vehicle Fare', 'Shopping', 'Medicine', 'Treat', 'Donate', 'Hadiya', 'Education', 'Travel', 'Others'];
      
      const toInsert = [
        ...defaultIncome.map(n => ({ name: n, type: 'income', isCustom: true, user: user._id })),
        ...defaultExpense.map(n => ({ name: n, type: 'expense', isCustom: true, user: user._id }))
      ];
      
      await Category.insertMany(toInsert);
      user.hasSeededCategories = true;
      await user.save();
    }

    const categories = await Category.find({ user: req.user._id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    const { name, type, icon } = req.body;

    const category = new Category({
      name,
      type,
      icon,
      isCustom: true,
      user: req.user._id
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete custom category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category && category.user && category.user.toString() === req.user._id.toString()) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found or you are not authorized to delete default categories' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
