import express from 'express';
import {
  exchangeCodeForToken,
  getUserProfile,
  getAdAccounts,
  getCampaigns,
  getCampaignInsights,
  getAdSets,
  getAdSetInsights,
  getDemographicInsights,
  getPlacementInsights,
  getLocationInsights
} from '../controllers/facebookController';
// Removed authMiddleware - Facebook routes use FACEBOOK_ACCESS_TOKEN from .env

const router = express.Router();

// Exchange authorization code for access token (for System User Access Token)
router.post('/exchange-token', exchangeCodeForToken);

// Get Facebook user profile (uses user's login token from request)
router.post('/profile', getUserProfile);

// Get ad accounts (uses FACEBOOK_ACCESS_TOKEN from .env)
router.post('/adaccounts', getAdAccounts);

// Get campaigns for an ad account (uses FACEBOOK_ACCESS_TOKEN from .env)
router.post('/campaigns', getCampaigns);

// Get insights for a campaign (uses FACEBOOK_ACCESS_TOKEN from .env)
router.post('/insights', getCampaignInsights);

// Get demographic insights (age, gender breakdown) for a campaign
router.post('/demographic-insights', getDemographicInsights);

// Get placement insights (Facebook Reels, Feed, Stories, etc.) for a campaign
router.post('/placement-insights', getPlacementInsights);

// Get location/region breakdown insights for a campaign
router.post('/location-insights', getLocationInsights);

// Get ad sets for a campaign (uses FACEBOOK_ACCESS_TOKEN from .env)
router.post('/adsets', getAdSets);

// Get insights for an ad set (uses FACEBOOK_ACCESS_TOKEN from .env)
router.post('/adset-insights', getAdSetInsights);

export default router;
