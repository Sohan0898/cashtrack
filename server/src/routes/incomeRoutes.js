import express from 'express';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getIncomes).post(protect, createIncome);
router.route('/:id').put(protect, updateIncome).delete(protect, deleteIncome);

export default router;
