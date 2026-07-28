import express from 'express';
import { login, logout, getUserProfile, updateUserProfile, clearData, deleteAccount, backupData } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/backup', protect, backupData);
router.delete('/data', protect, clearData);
router.delete('/account', protect, deleteAccount);

export default router;
