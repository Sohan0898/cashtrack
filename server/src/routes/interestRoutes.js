import express from 'express';
import { getInterest, addInterest, infaqInterest, deleteInterestTransaction } from '../controllers/interestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getInterest);
router.route('/add').post(protect, addInterest);
router.route('/infaq').post(protect, infaqInterest);
router.route('/:id').delete(protect, deleteInterestTransaction);

export default router;
