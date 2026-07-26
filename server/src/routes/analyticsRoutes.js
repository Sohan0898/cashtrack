import express from 'express';
import { getDashboardStats, getReportsData } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/reports', protect, getReportsData);

export default router;
