import { Router } from 'express';
import { getDashboardSummary, getChartData, getAdSets } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/summary', authMiddleware, getDashboardSummary);
router.get('/chart-data', authMiddleware, getChartData);
router.get('/ad-sets', authMiddleware, getAdSets);

export default router;
