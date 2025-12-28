import { Request, Response } from 'express';
import axios from 'axios';

/**
 * ==========================================
 * FACEBOOK CONTROLLER
 * ==========================================
 * 
 * QUAN TRỌNG: Controller này sử dụng 2 LOẠI TOKEN RIÊNG BIỆT:
 * 
 * 1. USER LOGIN TOKEN (từ request body - qua Facebook Login SDK):
 *    - Dùng CHỈ cho: getUserProfile() - lấy profile user sau khi login
 *    - Token ngắn hạn (1-2 giờ)
 *    - Được gửi từ frontend sau khi user login bằng Facebook
 * 
 * 2. FACEBOOK_ACCESS_TOKEN (từ .env - long-lived token):
 *    - Dùng cho: getAdAccounts(), getCampaigns(), getCampaignInsights()
 *    - Token dài hạn (60 ngày)
 *    - Admin cấu hình trong .env khi deploy
 *    - KHÔNG expose lên frontend, chỉ sử dụng trên backend
 * 
 * Lý do tách biệt:
 * - Bảo mật: Access token có quyền cao không nên để frontend biết
 * - Ổn định: Token dài hạn không bị expired giữa chừng
 * - Đơn giản: Frontend không cần quản lý token cho ads data
 * 
 * ==========================================
 */

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || '';
// Long-lived access token để truy xuất ads data - LẤY TỪ .env
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';

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
    const tokenUrl = `https://graph.facebook.com/v24.0/oauth/access_token`;
    const params = {
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      code: code,
      redirect_uri: FACEBOOK_REDIRECT_URI
    };

    const response = await axios.get(tokenUrl, { params });
    
    const { access_token, token_type, expires_in } = response.data;

    // Get client business ID from the token
    const meResponse = await axios.get(`https://graph.facebook.com/v24.0/me`, {
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
 * 
 * MỤC ĐÍCH: Lấy thông tin profile sau khi user đăng nhập
 * SỬ DỤNG: User login token từ Facebook Login SDK (request body)
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

    const response = await axios.get(`https://graph.facebook.com/v24.0/me`, {
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
 * 
 * MỤC ĐÍCH: Lấy danh sách tài khoản quảng cáo
 * SỬ DỤNG: FACEBOOK_ACCESS_TOKEN từ .env (long-lived token)
 */
export const getAdAccounts = async (req: Request, res: Response) => {
  try {
    // Kiểm tra FACEBOOK_ACCESS_TOKEN có được config không
    if (!FACEBOOK_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'FACEBOOK_ACCESS_TOKEN chưa được cấu hình trong .env. Vui lòng thêm token vào biến môi trường.'
      });
    }

    const response = await axios.get(`https://graph.facebook.com/v24.0/me/adaccounts`, {
      params: {
        fields: 'id,name,account_id,account_status,currency,timezone_name,business',
        access_token: FACEBOOK_ACCESS_TOKEN // Dùng token từ .env
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
 * 
 * MỤC ĐÍCH: Lấy danh sách chiến dịch của một ad account
 * SỬ DỤNG: FACEBOOK_ACCESS_TOKEN từ .env (long-lived token)
 */
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { ad_account_id } = req.body;

    // Kiểm tra FACEBOOK_ACCESS_TOKEN có được config không
    if (!FACEBOOK_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'FACEBOOK_ACCESS_TOKEN chưa được cấu hình trong .env. Vui lòng thêm token vào biến môi trường.'
      });
    }

    if (!ad_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Ad account ID is required'
      });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v24.0/${ad_account_id}/campaigns`,
      {
        params: {
          fields: 'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time',
          access_token: FACEBOOK_ACCESS_TOKEN // Dùng token từ .env
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
 * 
 * MỤC ĐÍCH: Lấy số liệu phân tích của chiến dịch
 * SỬ DỤNG: FACEBOOK_ACCESS_TOKEN từ .env (long-lived token)
 */
export const getCampaignInsights = async (req: Request, res: Response) => {
  try {
    const { campaign_id, date_preset } = req.body;

    // Kiểm tra FACEBOOK_ACCESS_TOKEN có được config không
    if (!FACEBOOK_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'FACEBOOK_ACCESS_TOKEN chưa được cấu hình trong .env. Vui lòng thêm token vào biến môi trường.'
      });
    }

    if (!campaign_id) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required'
      });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v24.0/${campaign_id}/insights`,
      {
        params: {
          fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,conversions,cost_per_conversion',
          date_preset: date_preset || 'last_7d',
          access_token: FACEBOOK_ACCESS_TOKEN // Dùng token từ .env
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
