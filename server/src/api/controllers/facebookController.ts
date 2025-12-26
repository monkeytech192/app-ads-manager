import { Request, Response } from 'express';
import axios from 'axios';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || '';

/**
 * Exchange Facebook authorization code for access token
 * Required for System User Access Token (Business Integration)
 */
export const exchangeCodeForToken = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token`;
    const params = {
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      code: code,
      redirect_uri: FACEBOOK_REDIRECT_URI
    };

    const response = await axios.get(tokenUrl, { params });
    
    const { access_token, token_type, expires_in } = response.data;

    // Get client business ID from the token
    const meResponse = await axios.get(`https://graph.facebook.com/v21.0/me`, {
      params: {
        fields: 'client_business_id',
        access_token: access_token
      }
    });

    res.json({
      success: true,
      data: {
        access_token,
        token_type,
        expires_in,
        client_business_id: meResponse.data.client_business_id,
        app_scoped_id: meResponse.data.id
      },
      message: 'Access token obtained successfully'
    });
  } catch (error: any) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get Facebook user profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const response = await axios.get(`https://graph.facebook.com/v21.0/me`, {
      params: {
        fields: 'id,name,email,picture.width(400).height(400)',
        access_token: access_token
      }
    });

    res.json({
      success: true,
      data: response.data,
      message: 'User profile retrieved successfully'
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get Facebook Ad Accounts
 */
export const getAdAccounts = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const response = await axios.get(`https://graph.facebook.com/v21.0/me/adaccounts`, {
      params: {
        fields: 'id,name,account_id,account_status,currency,timezone_name,business',
        access_token: access_token
      }
    });

    res.json({
      success: true,
      data: response.data.data,
      message: 'Ad accounts retrieved successfully'
    });
  } catch (error: any) {
    console.error('Ad accounts fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get campaigns for an ad account
 */
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { access_token, ad_account_id } = req.body;

    if (!access_token || !ad_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Access token and ad account ID are required'
      });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${ad_account_id}/campaigns`,
      {
        params: {
          fields: 'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time',
          access_token: access_token
        }
      }
    );

    res.json({
      success: true,
      data: response.data.data,
      message: 'Campaigns retrieved successfully'
    });
  } catch (error: any) {
    console.error('Campaigns fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get insights/metrics for campaigns
 */
export const getCampaignInsights = async (req: Request, res: Response) => {
  try {
    const { access_token, campaign_id, date_preset } = req.body;

    if (!access_token || !campaign_id) {
      return res.status(400).json({
        success: false,
        message: 'Access token and campaign ID are required'
      });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${campaign_id}/insights`,
      {
        params: {
          fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,conversions,cost_per_conversion',
          date_preset: date_preset || 'last_7d',
          access_token: access_token
        }
      }
    );

    res.json({
      success: true,
      data: response.data.data[0] || {},
      message: 'Campaign insights retrieved successfully'
    });
  } catch (error: any) {
    console.error('Insights fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};
