import express from 'express';
import {
  exchangeCodeForToken,
  getUserProfile,
  getAdAccounts,
  getCampaigns,
  getCampaignInsights
} from '../controllers/facebookController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Exchange authorization code for access token (for System User Access Token)
router.post('/exchange-token', exchangeCodeForToken);

// Get Facebook user profile
router.post('/profile', getUserProfile);

// Get ad accounts
router.post('/adaccounts', getAdAccounts);

// Get campaigns for an ad account
router.post('/campaigns', getCampaigns);

// Get insights for a campaign
router.post('/insights', getCampaignInsights);

export default router;
