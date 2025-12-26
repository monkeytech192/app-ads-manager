import { Router } from 'express';
import {
  getAccounts,
  toggleAccount,
  getCampaigns,
  updateCampaignStatus,
  getCampaignDetail,
  getCampaignStats,
  getCampaignChart,
  getCampaignDemographics,
  compareCampaigns
} from '../controllers/managementController';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Accounts
router.get('/accounts', authMiddleware, getAccounts);
router.patch('/accounts/:id/toggle', authMiddleware, toggleAccount);

// Campaigns
router.get('/campaigns', authMiddleware, getCampaigns);
router.get('/campaigns/:id', authMiddleware, getCampaignDetail);
router.patch('/campaigns/:id/status', authMiddleware, updateCampaignStatus);
router.get('/campaigns/:id/stats', authMiddleware, getCampaignStats);
router.get('/campaigns/:id/chart', authMiddleware, getCampaignChart);
router.get('/campaigns/:id/demographics', authMiddleware, getCampaignDemographics);

// Reports
router.get('/reports/compare', authMiddleware, compareCampaigns);

export default router;
