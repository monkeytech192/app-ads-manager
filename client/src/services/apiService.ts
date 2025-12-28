/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Simple in-memory cache to prevent duplicate API calls
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

// Debug: Track all API calls
const apiCallLog: { endpoint: string; time: string; cached: boolean; stack: string }[] = [];
(window as any).__apiCallLog = apiCallLog;
(window as any).__apiCache = apiCache;

function logApiCall(endpoint: string, cached: boolean) {
  const stack = new Error().stack?.split('\n').slice(2, 5).join(' <- ') || '';
  const entry = {
    endpoint,
    time: new Date().toISOString().substr(11, 12),
    cached,
    stack: stack.replace(/\s+/g, ' ').substring(0, 200)
  };
  apiCallLog.push(entry);
  console.log(
    `%c[API ${cached ? 'CACHE' : 'FETCH'}]%c ${endpoint}`,
    cached ? 'background: #22c55e; color: white; padding: 2px 6px;' : 'background: #ef4444; color: white; padding: 2px 6px;',
    'color: inherit',
    '\n  Stack:', stack.substring(0, 150)
  );
}

function getCached<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  apiCache.clear();
}

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
  spend_cap?: string;
  spent?: string;
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
  date_start?: string;
  date_stop?: string;
}

/**
 * Get all ad accounts from Facebook (cached)
 */
export async function getAdAccounts(): Promise<AdAccount[]> {
  const cacheKey = 'adaccounts';
  const cached = getCached<AdAccount[]>(cacheKey);
  if (cached) {
    logApiCall('/facebook/adaccounts', true);
    return cached;
  }

  logApiCall('/facebook/adaccounts', false);
  const data = await fetchApi<AdAccount[]>('/facebook/adaccounts', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  setCache(cacheKey, data);
  return data;
}

/**
 * Get campaigns for a specific ad account (cached)
 */
export async function getCampaigns(adAccountId: string): Promise<Campaign[]> {
  const cacheKey = `campaigns-${adAccountId}`;
  const cached = getCached<Campaign[]>(cacheKey);
  if (cached) {
    logApiCall(`/facebook/campaigns [${adAccountId}]`, true);
    return cached;
  }

  logApiCall(`/facebook/campaigns [${adAccountId}]`, false);
  const data = await fetchApi<Campaign[]>('/facebook/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      ad_account_id: adAccountId,
    }),
  });
  setCache(cacheKey, data);
  return data;
}

/**
 * Get insights/metrics for a specific campaign
 */
export async function getCampaignInsights(
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<CampaignInsights> {
  const cacheKey = `insights-${campaignId}-${datePreset}`;
  const cached = getCached<CampaignInsights>(cacheKey);
  if (cached) {
    logApiCall(`/facebook/insights [${campaignId}] ${datePreset}`, true);
    return cached;
  }

  logApiCall(`/facebook/insights [${campaignId}] ${datePreset}`, false);
  const data = await fetchApi<CampaignInsights>('/facebook/insights', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
      date_preset: datePreset,
    }),
  });
  setCache(cacheKey, data);
  return data;
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

/**
 * Demographic breakdown data from Facebook Insights API
 */
export interface DemographicData {
  age: string;
  gender: string;
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  ctr: string;
  cpc: string;
}

/**
 * Get demographic insights (age, gender breakdown) for a campaign
 */
export async function getDemographicInsights(
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<DemographicData[]> {
  return fetchApi<DemographicData[]>('/facebook/demographic-insights', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
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
