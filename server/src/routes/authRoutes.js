import express from 'express';
import { login, logout, getUserProfile, updateUserProfile, clearData, deleteAccount, backupData, restoreData, getSessions, revokeSession, revokeAllOtherSessions } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/backup', protect, backupData);
router.post('/restore', protect, restoreData);
router.delete('/data', protect, clearData);
router.delete('/account', protect, deleteAccount);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, revokeSession);
router.delete('/sessions', protect, revokeAllOtherSessions);

export default router;
