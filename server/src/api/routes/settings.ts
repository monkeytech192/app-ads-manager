import { Router } from 'express';
import { getSettings, updateSettings, getRecommendations, chatWithAI } from '../controllers/settingsController';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, updateSettings);
router.get('/recommendations', authMiddleware, getRecommendations);
router.post('/ai/chat', authMiddleware, chatWithAI);

export default router;
