/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Simple in-memory cache to prevent duplicate API calls
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

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
  effective_status?: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'IN_PROCESS' | 'WITH_ISSUES' | 'CAMPAIGN_PAUSED';
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
  // Engagement & Actions metrics
  actions?: Array<{ action_type: string; value: string }>;
  video_play_actions?: Array<{ action_type: string; value: string }>;
  video_p25_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p50_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p75_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p100_watched_actions?: Array<{ action_type: string; value: string }>;
  // Link & Website metrics
  inline_link_clicks?: string;
  inline_link_click_ctr?: string;
  outbound_clicks?: Array<{ action_type: string; value: string }>;
  unique_outbound_clicks?: Array<{ action_type: string; value: string }>;
  website_ctr?: Array<{ action_type: string; value: string }>;
  // Social metrics
  social_spend?: string;
  unique_clicks?: string;
  unique_ctr?: string;
}

/**
 * Get all ad accounts from Facebook (cached)
 */
export async function getAdAccounts(): Promise<AdAccount[]> {
  const cacheKey = 'adaccounts';
  const cached = getCached<AdAccount[]>(cacheKey);
  if (cached) return cached;

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
  if (cached) return cached;

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
  if (cached) return cached;

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
 * Placement breakdown data from Facebook Insights API
 */
export interface PlacementData {
  publisher_platform: string;
  platform_position: string;
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  ctr: string;
  cpc: string;
  actions?: Array<{ action_type: string; value: string }>;
}

/**
 * Location/Region breakdown data from Facebook Insights API
 */
export interface LocationData {
  region: string;
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

/**
 * Get placement insights (Facebook Reels, Feed, Stories, etc.) for a campaign
 */
export async function getPlacementInsights(
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<PlacementData[]> {
  return fetchApi<PlacementData[]>('/facebook/placement-insights', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
      date_preset: datePreset,
    }),
  });
}

/**
 * Get location/region breakdown insights for a campaign
 */
export async function getLocationInsights(
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<LocationData[]> {
  return fetchApi<LocationData[]>('/facebook/location-insights', {
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
  // Demographics aggregated from all active campaigns
  demographics?: {
    byGender: Array<{ gender: string; impressions: number; clicks: number; spend: number }>;
    byAge: Array<{ age: string; impressions: number; clicks: number; spend: number }>;
  };
}

/**
 * Get dashboard summary metrics
 * This aggregates data from ACTIVE campaigns only
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

    // Count active and paused campaigns
    const activeCampaigns = allCampaigns.filter(c => c.status === 'ACTIVE').length;
    const pausedCampaigns = allCampaigns.filter(c => c.status === 'PAUSED').length;
    
    // Filter only ACTIVE campaigns for metrics
    const activeCampaignsList = allCampaigns.filter(c => c.status === 'ACTIVE');

    // Get insights for ACTIVE campaigns only
    const insightsPromises = activeCampaignsList.map(campaign => 
      getCampaignInsights(campaign.id).catch(() => ({} as CampaignInsights))
    );
    const allInsights = await Promise.all(insightsPromises);

    // Get demographics for ACTIVE campaigns
    const demographicsPromises = activeCampaignsList.map(campaign => 
      getDemographicInsights(campaign.id).catch(() => [] as DemographicData[])
    );
    const allDemographics = await Promise.all(demographicsPromises);

    // Aggregate metrics from ACTIVE campaigns
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    allInsights.forEach((insights) => {
      totalSpend += parseFloat(insights.spend || '0');
      totalImpressions += parseInt(insights.impressions || '0');
      totalClicks += parseInt(insights.clicks || '0');
    });

    const averageCTR = totalImpressions > 0 
      ? (totalClicks / totalImpressions) * 100 
      : 0;

    // Aggregate demographics
    const genderMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
    const ageMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
    
    allDemographics.flat().forEach(d => {
      // Aggregate by gender
      const genderKey = d.gender || 'unknown';
      const genderExisting = genderMap.get(genderKey) || { impressions: 0, clicks: 0, spend: 0 };
      genderMap.set(genderKey, {
        impressions: genderExisting.impressions + parseInt(d.impressions || '0'),
        clicks: genderExisting.clicks + parseInt(d.clicks || '0'),
        spend: genderExisting.spend + parseFloat(d.spend || '0'),
      });

      // Aggregate by age
      const ageKey = d.age || 'unknown';
      const ageExisting = ageMap.get(ageKey) || { impressions: 0, clicks: 0, spend: 0 };
      ageMap.set(ageKey, {
        impressions: ageExisting.impressions + parseInt(d.impressions || '0'),
        clicks: ageExisting.clicks + parseInt(d.clicks || '0'),
        spend: ageExisting.spend + parseFloat(d.spend || '0'),
      });
    });

    const demographics = {
      byGender: Array.from(genderMap.entries()).map(([gender, data]) => ({ gender, ...data })),
      byAge: Array.from(ageMap.entries())
        .map(([age, data]) => ({ age, ...data }))
        .sort((a, b) => {
          // Sort by age range
          const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
          return ageOrder.indexOf(a.age) - ageOrder.indexOf(b.age);
        }),
    };

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      averageCTR,
      activeCampaigns,
      pausedCampaigns,
      demographics: demographics.byGender.length > 0 || demographics.byAge.length > 0 ? demographics : undefined,
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
