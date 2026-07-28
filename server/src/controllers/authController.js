import admin from '../config/firebase.js';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import Savings from '../models/Savings.js';
import SavingsHistory from '../models/SavingsHistory.js';
import BankInterest from '../models/BankInterest.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'ID Token is required' });
  }

  try {
    if (!admin) {
      return res.status(500).json({ message: 'Firebase Admin not configured' });
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ firebaseUid: uid });
    
    // Get login tracking info
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const now = new Date();

    if (!user) {
      // Check if user with same email exists
      user = await User.findOne({ email });
      if (user) {
        // Link firebase UID
        user.firebaseUid = uid;
        user.avatar = picture || user.avatar;
        user.lastLogin = now;
        user.lastLoginIp = ip;
        user.lastLoginDevice = userAgent;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: name || 'User',
          email,
          firebaseUid: uid,
          avatar: picture || '',
          lastLogin: now,
          lastLoginIp: ip,
          lastLoginDevice: userAgent,
        });
      }
    } else {
      // User exists
      user.lastLogin = now;
      user.lastLoginIp = ip;
      user.lastLoginDevice = userAgent;
      await user.save();
    }

    const token = generateToken(res, user._id);

    res.status(200).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
      lastLogin: user.lastLogin,
      lastLoginIp: user.lastLoginIp,
      lastLoginDevice: user.lastLoginDevice,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
      lastLogin: user.lastLogin,
      lastLoginIp: user.lastLoginIp,
      lastLoginDevice: user.lastLoginDevice,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;
    user.currency = req.body.currency || user.currency;
    user.language = req.body.language || user.language;
    user.theme = req.body.theme || user.theme;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      currency: updatedUser.currency,
      language: updatedUser.language,
      theme: updatedUser.theme,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Clear user data (transactions)
// @route   DELETE /api/auth/data
// @access  Private
export const clearData = async (req, res) => {
  try {
    await Income.deleteMany({ user: req.user._id });
    await Expense.deleteMany({ user: req.user._id });
    await Savings.deleteMany({ user: req.user._id });
    await SavingsHistory.deleteMany({ user: req.user._id });
    await BankInterest.deleteMany({ user: req.user._id });
    res.status(200).json({ message: 'Data cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear data' });
  }
};

// @desc    Backup all user data
// @route   GET /api/auth/backup
// @access  Private
export const backupData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUid');
    const incomes = await Income.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });
    const savings = await Savings.find({ user: req.user._id });
    const savingsHistory = await SavingsHistory.find({ user: req.user._id });
    const bankInterest = await BankInterest.find({ user: req.user._id });
    const categories = await Category.find({ user: req.user._id });

    const backup = {
      user,
      incomes,
      expenses,
      savingsAccounts: savings,
      savingsHistories: savingsHistory,
      bankInterest,
      categories,
      timestamp: new Date()
    };

    res.json(backup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate backup' });
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    // Delete associated data
    await Income.deleteMany({ user: req.user._id });
    await Expense.deleteMany({ user: req.user._id });
    await Category.deleteMany({ user: req.user._id });
    await Savings.deleteMany({ user: req.user._id });
    await SavingsHistory.deleteMany({ user: req.user._id });
    await BankInterest.deleteMany({ user: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);

    // Clear cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0),
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
};
