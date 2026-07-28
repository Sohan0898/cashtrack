import express from 'express';
import { getSavings, createSavings, updateSavings, deleteSavings, addSavingsTransaction, getSavingsHistory, getAllSavingsHistory } from '../controllers/savingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSavings).post(protect, createSavings);
router.route('/history/all').get(protect, getAllSavingsHistory);
router.route('/:id').put(protect, updateSavings).delete(protect, deleteSavings);
router.route('/:id/transaction').post(protect, addSavingsTransaction);
router.route('/:id/history').get(protect, getSavingsHistory);

export default router;
