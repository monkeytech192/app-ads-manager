/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data as T;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== FACEBOOK API ====================

export interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  business?: any;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
  updated_time: string;
}

export interface AdSet {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  end_time?: string;
  targeting?: any;
  billing_event?: string;
  optimization_goal?: string;
  created_time: string;
  updated_time: string;
}

export interface CampaignInsights {
  impressions?: string;
  clicks?: string;
  spend?: string;
  reach?: string;
  frequency?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  conversions?: string;
  cost_per_conversion?: string;
}

/**
 * Get all ad accounts from Facebook
 */
export async function getAdAccounts(): Promise<AdAccount[]> {
  return fetchApi<AdAccount[]>('/facebook/adaccounts', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Get campaigns for a specific ad account
 */
export async function getCampaigns(adAccountId: string): Promise<Campaign[]> {
  return fetchApi<Campaign[]>('/facebook/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      ad_account_id: adAccountId,
    }),
  });
}

/**
 * Get insights/metrics for a specific campaign
 */
export async function getCampaignInsights(
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<CampaignInsights> {
  return fetchApi<CampaignInsights>('/facebook/insights', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
      date_preset: datePreset,
    }),
  });
}

/**
 * Get ad sets for a specific campaign
 */
export async function getAdSets(campaignId: string): Promise<AdSet[]> {
  return fetchApi<AdSet[]>('/facebook/adsets', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
    }),
  });
}

/**
 * Get insights/metrics for a specific ad set
 */
export async function getAdSetInsights(
  adsetId: string,
  datePreset: string = 'last_7d'
): Promise<CampaignInsights> {
  return fetchApi<CampaignInsights>('/facebook/adset-insights', {
    method: 'POST',
    body: JSON.stringify({
      adset_id: adsetId,
      date_preset: datePreset,
    }),
  });
}

// ==================== AUTH API ====================

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

/**
 * Login with email/password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get current user profile
 */
export async function getMe(token: string): Promise<AuthResponse['user']> {
  return fetchApi<AuthResponse['user']>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==================== DASHBOARD API ====================

export interface DashboardMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  activeCampaigns: number;
  pausedCampaigns: number;
}

/**
 * Get dashboard summary metrics
 * This aggregates data from all campaigns
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Get all ad accounts
    const accounts = await getAdAccounts();
    
    if (accounts.length === 0) {
      return {
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        averageCTR: 0,
        activeCampaigns: 0,
        pausedCampaigns: 0,
      };
    }

    // Get campaigns for all accounts
    const campaignsPromises = accounts.map(acc => getCampaigns(acc.id));
    const campaignsArrays = await Promise.all(campaignsPromises);
    const allCampaigns = campaignsArrays.flat();

    // Get insights for all campaigns
    const insightsPromises = allCampaigns.map(campaign => 
      getCampaignInsights(campaign.id).catch(() => ({} as CampaignInsights))
    );
    const allInsights = await Promise.all(insightsPromises);

    // Aggregate metrics
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let activeCampaigns = 0;
    let pausedCampaigns = 0;

    allCampaigns.forEach((campaign, index) => {
      const insights = allInsights[index];
      
      totalSpend += parseFloat(insights.spend || '0');
      totalImpressions += parseInt(insights.impressions || '0');
      totalClicks += parseInt(insights.clicks || '0');
      
      if (campaign.status === 'ACTIVE') activeCampaigns++;
      if (campaign.status === 'PAUSED') pausedCampaigns++;
    });

    const averageCTR = totalImpressions > 0 
      ? (totalClicks / totalImpressions) * 100 
      : 0;

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      averageCTR,
      activeCampaigns,
      pausedCampaigns,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return value.toFixed(2) + '%';
}
