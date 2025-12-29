import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, Users, TrendingUp, Wallet, BarChart3, MapPin, Layout, Sparkles, X } from 'lucide-react';
import { BrutalistCard, BrutalistHeader } from '../shared/UIComponents';
import { CampaignData } from '../types';
import { getCampaignInsights, getDemographicInsights, getPlacementInsights, getLocationInsights, formatNumber, type CampaignInsights, type DemographicData, type PlacementData, type LocationData } from '../services/apiService';
import { formatCurrencyWithSettings, getCurrencySettings } from '../utils/currency';
import { useTranslation } from '../services/i18n';
import { analyzeCampaign, type CampaignAnalysisData } from '../services/geminiService';

interface CampaignDetailScreenProps {
  onBack: () => void;
  campaign: CampaignData | null;
}

// Brutalist style stat card
const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="border-4 border-black bg-[#1e293b] p-3 flex flex-col justify-between h-24 sm:h-28 shadow-hard">
    <span className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wide">{label}</span>
    <span className={`text-2xl sm:text-3xl font-bold font-display tracking-tight ${highlight ? 'text-brutal-yellow' : 'text-white'}`}>{value}</span>
  </div>
);

type TabType = 'overview' | 'performance' | 'audience' | 'placements' | 'budget';

const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({ onBack, campaign }) => {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [lifetimeInsights, setLifetimeInsights] = useState<CampaignInsights | null>(null);
  const [demographics, setDemographics] = useState<DemographicData[]>([]);
  const [placements, setPlacements] = useState<PlacementData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [demographicsLoading, setDemographicsLoading] = useState(false);
  const [placementsLoading, setPlacementsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<string>('last_7d');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { t, lang } = useTranslation();
  
  // AI Analysis state
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  
  const dateOptions = [
    { value: 'last_7d', label: t('detail.last7days') },
    { value: 'last_14d', label: t('detail.last14days') },
    { value: 'last_30d', label: t('detail.last30days') },
    { value: 'this_month', label: t('detail.thisMonth') },
    { value: 'last_month', label: t('detail.lastMonth') },
  ];
  
  const selectedDateLabel = dateOptions.find(opt => opt.value === datePreset)?.label || t('detail.last7days');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('detail.overview'), icon: <BarChart3 size={16} /> },
    { id: 'performance', label: t('detail.performance'), icon: <TrendingUp size={16} /> },
    { id: 'audience', label: t('detail.audience'), icon: <Users size={16} /> },
    { id: 'placements', label: lang === 'vi' ? 'Vị trí' : 'Placements', icon: <Layout size={16} /> },
    { id: 'budget', label: t('detail.budgetTab'), icon: <Wallet size={16} /> },
  ];

  // Fetch campaign insights for selected date range
  useEffect(() => {
    if (!campaign?.id) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCampaignInsights(campaign.id, datePreset);
        setInsights(data);
      } catch (err: any) {
        console.error('Error fetching campaign insights:', err);
        setError(err.message || 'Không thể tải dữ liệu insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [campaign?.id, datePreset]);

  // Fetch lifetime insights for budget calculation (same logic as App.tsx)
  useEffect(() => {
    if (!campaign?.id) return;

    const fetchLifetimeInsights = async () => {
      try {
        // Use 'maximum' like App.tsx for consistent progress calculation
        const data = await getCampaignInsights(campaign.id, 'maximum');
        setLifetimeInsights(data);
      } catch (err) {
        console.error('Error fetching lifetime insights:', err);
      }
    };

    fetchLifetimeInsights();
  }, [campaign?.id]);

  // Fetch demographics when audience tab is active
  useEffect(() => {
    if (activeTab !== 'audience' || !campaign?.id) return;

    const fetchDemographics = async () => {
      try {
        setDemographicsLoading(true);
        const data = await getDemographicInsights(campaign.id, datePreset);
        setDemographics(data);
      } catch (err: any) {
        console.error('Error fetching demographics:', err);
        setDemographics([]);
      } finally {
        setDemographicsLoading(false);
      }
    };

    fetchDemographics();
  }, [activeTab, campaign?.id, datePreset]);

  // Fetch placements and locations when placements tab is active
  useEffect(() => {
    if (activeTab !== 'placements' || !campaign?.id) return;

    const fetchPlacementsAndLocations = async () => {
      try {
        setPlacementsLoading(true);
        setLocationsLoading(true);
        
        const [placementData, locationData] = await Promise.all([
          getPlacementInsights(campaign.id, datePreset),
          getLocationInsights(campaign.id, datePreset)
        ]);
        
        setPlacements(placementData);
        setLocations(locationData);
      } catch (err: any) {
        console.error('Error fetching placements/locations:', err);
        setPlacements([]);
        setLocations([]);
      } finally {
        setPlacementsLoading(false);
        setLocationsLoading(false);
      }
    };

    fetchPlacementsAndLocations();
  }, [activeTab, campaign?.id, datePreset]);
  
  const displayCampaign = campaign || {
      id: '',
      accountId: '',
      title: 'Chiến dịch không xác định',
      status: 'paused' as const,
      budget: '0đ',
      objective: 'N/A',
      progress: 0,
      spent: '0đ',
      impressions: '0',
      results: '0',
      costPerResult: '0đ',
      dailyBudget: undefined,
      lifetimeBudget: undefined,
  };

  const isPaused = displayCampaign.status === 'paused';

  // Helper function to get action value from actions array
  const getActionValue = (actionType: string): string => {
    if (!insights?.actions) return '0';
    const action = insights.actions.find(a => a.action_type === actionType);
    return action?.value || '0';
  };

  // Get real data from insights
  const spend = insights?.spend ? formatCurrencyWithSettings(parseFloat(insights.spend)) : displayCampaign.spent;
  const impressions = insights?.impressions ? formatNumber(parseInt(insights.impressions)) : displayCampaign.impressions;
  const clicks = insights?.clicks ? formatNumber(parseInt(insights.clicks)) : displayCampaign.results;
  const cpc = insights?.cpc ? formatCurrencyWithSettings(parseFloat(insights.cpc), 2) : displayCampaign.costPerResult;
  const reach = insights?.reach ? formatNumber(parseInt(insights.reach)) : '0';
  const frequency = insights?.frequency ? parseFloat(insights.frequency).toFixed(2) : '0';
  const ctr = insights?.ctr ? `${parseFloat(insights.ctr).toFixed(2)}%` : '0%';
  const cpm = insights?.cpm ? formatCurrencyWithSettings(parseFloat(insights.cpm), 2) : '0';
  
  // Actions metrics from Facebook
  const pageLikes = getActionValue('like');
  const pageEngagement = getActionValue('page_engagement');
  const postReactions = getActionValue('post_reaction');
  const postSaves = getActionValue('onsite_conversion.post_save');
  const postShares = getActionValue('post');
  const linkClicks = insights?.inline_link_clicks || getActionValue('link_click');
  const videoViews = insights?.video_play_actions?.[0]?.value || getActionValue('video_view');
  const video25 = insights?.video_p25_watched_actions?.[0]?.value || '0';
  const video50 = insights?.video_p50_watched_actions?.[0]?.value || '0';
  const video75 = insights?.video_p75_watched_actions?.[0]?.value || '0';
  const video100 = insights?.video_p100_watched_actions?.[0]?.value || '0';

  // Calculate budget progress using LIFETIME insights (same logic as App.tsx)
  const calculateBudgetProgress = () => {
    const dailyBudget = campaign?.dailyBudget;
    const lifetimeBudget = campaign?.lifetimeBudget;
    const budget = dailyBudget || lifetimeBudget || '0';
    const budgetInAccountCurrency = parseFloat(budget) / 100;
    
    const currencySettings = getCurrencySettings();
    // Assuming USD account for now - in real app, this should come from account data
    const accountCurrency = 'USD';
    
    let displayBudget = budgetInAccountCurrency;
    let displaySpend = 0;
    
    if (lifetimeInsights?.spend && budgetInAccountCurrency > 0) {
      const spendInAccountCurrency = parseFloat(lifetimeInsights.spend);
      displaySpend = spendInAccountCurrency;
      
      if (currencySettings.currency === 'VND' && accountCurrency === 'USD') {
        displayBudget = budgetInAccountCurrency * currencySettings.rate;
        displaySpend = spendInAccountCurrency * currencySettings.rate;
      }
      
      return {
        percentage: Math.min(Math.round((displaySpend / displayBudget) * 100), 100),
        spent: displaySpend,
        budget: displayBudget,
        remaining: Math.max(displayBudget - displaySpend, 0)
      };
    }
    
    return { percentage: 0, spent: 0, budget: displayBudget, remaining: displayBudget };
  };

  const budgetProgress = calculateBudgetProgress();

  // Process demographics data
  const processedDemographics = React.useMemo(() => {
    if (!demographics.length) return { byGender: [], byAge: [] };

    const genderMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
    const ageMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
    
    demographics.forEach(d => {
      const genderKey = d.gender === 'male' ? (lang === 'vi' ? 'Nam' : 'Male') : d.gender === 'female' ? (lang === 'vi' ? 'Nữ' : 'Female') : d.gender;
      const existing = genderMap.get(genderKey) || { impressions: 0, clicks: 0, spend: 0 };
      genderMap.set(genderKey, {
        impressions: existing.impressions + parseInt(d.impressions || '0'),
        clicks: existing.clicks + parseInt(d.clicks || '0'),
        spend: existing.spend + parseFloat(d.spend || '0'),
      });

      const ageExisting = ageMap.get(d.age) || { impressions: 0, clicks: 0, spend: 0 };
      ageMap.set(d.age, {
        impressions: ageExisting.impressions + parseInt(d.impressions || '0'),
        clicks: ageExisting.clicks + parseInt(d.clicks || '0'),
        spend: ageExisting.spend + parseFloat(d.spend || '0'),
      });
    });

    return {
      byGender: Array.from(genderMap.entries()).map(([gender, data]) => ({ gender, ...data })),
      byAge: Array.from(ageMap.entries()).map(([age, data]) => ({ age, ...data })).sort((a, b) => a.age.localeCompare(b.age))
    };
  }, [demographics]);

  const totalImpressions = processedDemographics.byGender.reduce((sum, g) => sum + g.impressions, 0);

  // Helper function to get display name for placement
  const getPlacementDisplayName = (platform: string, position: string, currentLang: string): string => {
    const names: Record<string, Record<string, string>> = {
      facebook: {
        feed: currentLang === 'vi' ? 'Bảng tin Facebook' : 'Facebook Feed',
        video_feeds: currentLang === 'vi' ? 'Video Feeds' : 'Video Feeds',
        right_hand_column: currentLang === 'vi' ? 'Cột bên phải' : 'Right Column',
        instant_article: currentLang === 'vi' ? 'Instant Article' : 'Instant Article',
        marketplace: 'Marketplace',
        story: currentLang === 'vi' ? 'Stories Facebook' : 'Facebook Stories',
        search: currentLang === 'vi' ? 'Tìm kiếm' : 'Search',
        reels: 'Facebook Reels',
        facebook_reels: 'Facebook Reels',
        instream_video: currentLang === 'vi' ? 'Video trong luồng' : 'In-stream Video',
      },
      instagram: {
        stream: currentLang === 'vi' ? 'Bảng tin Instagram' : 'Instagram Feed',
        story: currentLang === 'vi' ? 'Stories Instagram' : 'Instagram Stories',
        explore: currentLang === 'vi' ? 'Khám phá' : 'Explore',
        reels: 'Instagram Reels',
        profile_feed: currentLang === 'vi' ? 'Profile Feed' : 'Profile Feed',
      },
      audience_network: {
        classic: currentLang === 'vi' ? 'Audience Network' : 'Audience Network',
        rewarded_video: currentLang === 'vi' ? 'Video có thưởng' : 'Rewarded Video',
      },
      messenger: {
        messenger_inbox: currentLang === 'vi' ? 'Hộp thư Messenger' : 'Messenger Inbox',
        story: currentLang === 'vi' ? 'Stories Messenger' : 'Messenger Stories',
      }
    };
    
    const platformNames = names[platform?.toLowerCase()] || {};
    const positionName = platformNames[position?.toLowerCase()];
    
    if (positionName) return positionName;
    
    // Fallback: format the raw values
    const formattedPlatform = platform?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    const formattedPosition = position?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    
    return `${formattedPlatform} - ${formattedPosition}`;
  };

  // Process placements data - MOVED TO COMPONENT LEVEL
  type PlacementItem = { name: string; platform: string; position: string; impressions: number; clicks: number; spend: number };
  
  const processedPlacements = React.useMemo((): PlacementItem[] => {
    if (!placements.length) return [];
    
    const grouped: Record<string, PlacementItem> = {};
    
    placements.forEach(p => {
      const key = `${p.publisher_platform}_${p.platform_position}`;
      const displayName = getPlacementDisplayName(p.publisher_platform, p.platform_position, lang);
      
      if (!grouped[key]) {
        grouped[key] = {
          name: displayName,
          platform: p.publisher_platform,
          position: p.platform_position,
          impressions: 0,
          clicks: 0,
          spend: 0
        };
      }
      
      grouped[key].impressions += parseInt(p.impressions || '0');
      grouped[key].clicks += parseInt(p.clicks || '0');
      grouped[key].spend += parseFloat(p.spend || '0');
    });
    
    return Object.values(grouped).sort((a, b) => b.impressions - a.impressions);
  }, [placements, lang]);

  // Process locations data - MOVED TO COMPONENT LEVEL
  const processedLocations = React.useMemo(() => {
    if (!locations.length) return [];
    
    return locations
      .map(l => ({
        region: l.region,
        impressions: parseInt(l.impressions || '0'),
        clicks: parseInt(l.clicks || '0'),
        spend: parseFloat(l.spend || '0')
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10);
  }, [locations]);

  const totalPlacementImpressions = processedPlacements.reduce((sum, p) => sum + p.impressions, 0);
  const totalLocationImpressions = processedLocations.reduce((sum, l) => sum + l.impressions, 0);

  // ==================== AI ANALYSIS FUNCTION ====================
  const handleAIAnalysis = async () => {
    if (!insights || !campaign) return;
    
    setAnalysisLoading(true);
    setShowAnalysis(true);
    
    const analysisData: CampaignAnalysisData = {
      campaignName: displayCampaign.title,
      status: displayCampaign.status,
      objective: displayCampaign.objective,
      budget: budgetProgress.budget,
      spent: budgetProgress.spent,
      impressions: parseInt(insights.impressions || '0'),
      clicks: parseInt(insights.clicks || '0'),
      reach: parseInt(insights.reach || '0'),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: parseFloat(insights.cpc || '0'),
      cpm: parseFloat(insights.cpm || '0'),
      frequency: parseFloat(insights.frequency || '0'),
      budgetProgress: budgetProgress.percentage,
      dateRange: selectedDateLabel,
    };
    
    const result = await analyzeCampaign(analysisData, lang);
    setAnalysisResult(result);
    setAnalysisLoading(false);
  };

  // ==================== RENDER DATE DROPDOWN ====================
  const renderDateDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowDateDropdown(!showDateDropdown)}
        className="flex items-center gap-1 bg-black border-2 border-white px-3 py-1.5 text-xs font-bold uppercase"
      >
        <span>{selectedDateLabel}</span>
        <ChevronDown size={14} className={`transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showDateDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDateDropdown(false)} />
          <div className="absolute right-0 top-full mt-1 bg-black border-4 border-white z-50 min-w-[140px] shadow-hard">
            {dateOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setDatePreset(option.value);
                  setShowDateDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-bold uppercase transition-colors ${
                  datePreset === option.value ? 'bg-brutal-yellow text-black' : 'text-white hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ==================== RENDER TABS ====================

  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Date selector for Overview */}
      <div className="flex justify-end">
        {renderDateDropdown()}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={`${t('dashboard.spend')} (${selectedDateLabel})`} value={spend} highlight />
        <StatCard label={t('dashboard.impressions')} value={impressions} />
        <StatCard label={t('dashboard.clicks')} value={clicks} />
        <StatCard label={t('dashboard.cpc')} value={cpc} />
      </div>

      {insights && (
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">{lang === 'vi' ? 'Metrics Bổ Sung' : 'Additional Metrics'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">{t('dashboard.reach')}</span>
              <div className="font-bold text-xl">{reach}</div>
            </div>
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">{t('detail.frequency')}</span>
              <div className="font-bold text-xl">{frequency}</div>
            </div>
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">{t('dashboard.ctr')}</span>
              <div className="font-bold text-xl">{ctr}</div>
            </div>
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">{t('detail.cpm')}</span>
              <div className="font-bold text-xl">{cpm}</div>
            </div>
          </div>
          
          {/* Show actual date range from API */}
          {insights.date_start && insights.date_stop && (
            <div className="mt-4 pt-3 border-t-2 border-white/10 text-center text-xs text-gray-500">
              {lang === 'vi' ? 'Dữ liệu thực tế' : 'Actual data'}: {new Date(insights.date_start).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')} - {new Date(insights.date_stop).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
            </div>
          )}
        </div>
      )}

      {/* Engagement & Actions Metrics */}
      {insights?.actions && insights.actions.length > 0 && (
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">
            {lang === 'vi' ? 'Tương Tác & Kết Quả' : 'Engagement & Results'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pageLikes !== '0' && (
              <div className="border-2 border-blue-400/30 p-3 bg-blue-900/10">
                <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Lượt thích trang' : 'Page Likes'}</span>
                <div className="font-bold text-xl text-blue-400">{formatNumber(parseInt(pageLikes))}</div>
              </div>
            )}
            {pageEngagement !== '0' && (
              <div className="border-2 border-purple-400/30 p-3 bg-purple-900/10">
                <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Tương tác trang' : 'Page Engagement'}</span>
                <div className="font-bold text-xl text-purple-400">{formatNumber(parseInt(pageEngagement))}</div>
              </div>
            )}
            {postReactions !== '0' && (
              <div className="border-2 border-pink-400/30 p-3 bg-pink-900/10">
                <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Cảm xúc bài viết' : 'Post Reactions'}</span>
                <div className="font-bold text-xl text-pink-400">{formatNumber(parseInt(postReactions))}</div>
              </div>
            )}
            {linkClicks !== '0' && (
              <div className="border-2 border-green-400/30 p-3 bg-green-900/10">
                <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Click liên kết' : 'Link Clicks'}</span>
                <div className="font-bold text-xl text-green-400">{formatNumber(parseInt(linkClicks as string))}</div>
              </div>
            )}
            {postSaves !== '0' && (
              <div className="border-2 border-yellow-400/30 p-3 bg-yellow-900/10">
                <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Lượt lưu' : 'Post Saves'}</span>
                <div className="font-bold text-xl text-yellow-400">{formatNumber(parseInt(postSaves))}</div>
              </div>
            )}
            {postShares !== '0' && (
              <div className="border-2 border-orange-400/30 p-3 bg-orange-900/10">
                <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Lượt chia sẻ' : 'Post Shares'}</span>
                <div className="font-bold text-xl text-orange-400">{formatNumber(parseInt(postShares))}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Metrics */}
      {videoViews !== '0' && (
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">
            {lang === 'vi' ? 'Số Liệu Video' : 'Video Metrics'}
          </h3>
          <div className="space-y-3">
            <div className="border-2 border-red-400/30 p-3 bg-red-900/10">
              <span className="text-gray-400 text-xs uppercase">{lang === 'vi' ? 'Lượt xem video' : 'Video Views'}</span>
              <div className="font-bold text-2xl text-red-400">{formatNumber(parseInt(videoViews))}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="border-2 border-white/10 p-2 text-center bg-black/20">
                <div className="text-xs text-gray-500">25%</div>
                <div className="font-bold text-sm">{formatNumber(parseInt(video25))}</div>
              </div>
              <div className="border-2 border-white/10 p-2 text-center bg-black/20">
                <div className="text-xs text-gray-500">50%</div>
                <div className="font-bold text-sm">{formatNumber(parseInt(video50))}</div>
              </div>
              <div className="border-2 border-white/10 p-2 text-center bg-black/20">
                <div className="text-xs text-gray-500">75%</div>
                <div className="font-bold text-sm">{formatNumber(parseInt(video75))}</div>
              </div>
              <div className="border-2 border-white/10 p-2 text-center bg-black/20">
                <div className="text-xs text-gray-500">100%</div>
                <div className="font-bold text-sm">{formatNumber(parseInt(video100))}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              {lang === 'vi' ? 'Tỷ lệ xem video (số người xem đến % video)' : 'Video watch rate (viewers who watched to %)'}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg uppercase tracking-wide text-brutal-yellow">{lang === 'vi' ? 'Chi Tiết Hiệu Quả' : 'Performance Details'}</h3>
          {renderDateDropdown()}
        </div>

        {insights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="border-2 border-blue-500 bg-blue-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{impressions}</div>
                <div className="text-xs text-gray-400 uppercase">{t('dashboard.impressions')}</div>
              </div>
              <div className="border-2 border-green-500 bg-green-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{clicks}</div>
                <div className="text-xs text-gray-400 uppercase">{t('dashboard.clicks')}</div>
              </div>
              <div className="border-2 border-yellow-500 bg-yellow-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{reach}</div>
                <div className="text-xs text-gray-400 uppercase">{t('dashboard.reach')}</div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {[
                { label: lang === 'vi' ? 'Tỷ lệ nhấp (CTR)' : 'Click-through Rate (CTR)', value: ctr },
                { label: lang === 'vi' ? 'Chi phí mỗi click (CPC)' : 'Cost per Click (CPC)', value: cpc },
                { label: lang === 'vi' ? 'Chi phí 1000 hiển thị (CPM)' : 'Cost per 1000 Impressions (CPM)', value: cpm },
                { label: lang === 'vi' ? 'Tần suất (Frequency)' : 'Frequency', value: frequency },
                { label: lang === 'vi' ? 'Tổng chi tiêu' : 'Total Spend', value: spend, highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b-2 border-white/10">
                  <span className="text-gray-400 uppercase text-sm">{item.label}</span>
                  <span className={`font-bold text-lg ${item.highlight ? 'text-brutal-yellow' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {insights.date_start && insights.date_stop && (
              <div className="text-center text-xs text-gray-500 mt-4 pt-3 border-t-2 border-white/10 uppercase">
                {lang === 'vi' ? 'Dữ liệu' : 'Data'}: {new Date(insights.date_start).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')} - {new Date(insights.date_stop).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 uppercase font-bold">
            {t('common.noData')}
          </div>
        )}
      </div>
    </div>
  );

  const renderAudienceTab = () => (
    <div className="space-y-4">
      {demographicsLoading ? (
        <div className="border-4 border-black bg-[#1e293b] p-6 text-center shadow-hard">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/20 w-3/4 mx-auto"></div>
            <div className="h-4 bg-white/20 w-1/2 mx-auto"></div>
          </div>
          <p className="mt-3 font-bold uppercase">{t('common.loading')}</p>
        </div>
      ) : demographics.length > 0 ? (
        <>
          {/* Gender Distribution */}
          <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">{lang === 'vi' ? 'Phân Bổ Giới Tính' : 'Gender Distribution'}</h3>
            <div className="space-y-4">
              {processedDemographics.byGender.map((g) => {
                const percentage = totalImpressions > 0 ? (g.impressions / totalImpressions * 100) : 0;
                return (
                  <div key={g.gender} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold uppercase">{g.gender}</span>
                      <span className="text-gray-400">{percentage.toFixed(1)}% • {formatNumber(g.impressions)}</span>
                    </div>
                    <div className="h-4 bg-black border-2 border-white/20 overflow-hidden">
                      <div 
                        className={`h-full ${g.gender === (lang === 'vi' ? 'Nam' : 'Male') ? 'bg-blue-500' : 'bg-pink-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(g.clicks)} clicks • {formatCurrencyWithSettings(g.spend)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Age Distribution */}
          <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">{lang === 'vi' ? 'Phân Bổ Độ Tuổi' : 'Age Distribution'}</h3>
            <div className="space-y-3">
              {processedDemographics.byAge.map((a) => {
                const percentage = totalImpressions > 0 ? (a.impressions / totalImpressions * 100) : 0;
                return (
                  <div key={a.age} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{a.age}</span>
                      <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-black border-2 border-white/20 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(a.impressions)} hiển thị • {formatNumber(a.clicks)} clicks
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="border-4 border-black bg-[#1e293b] p-6 text-center shadow-hard">
          <Users size={48} className="mx-auto text-gray-600 mb-3" />
          <h3 className="font-bold text-lg mb-2 uppercase">Chưa Có Dữ Liệu</h3>
          <p className="text-gray-400 text-sm">
            {lang === 'vi' ? 'Dữ liệu demographic sẽ hiển thị khi chiến dịch có đủ lượt hiển thị.' : 'Demographic data will be displayed when the campaign has enough impressions.'}
          </p>
        </div>
      )}
    </div>
  );

  // Render Placements Tab
  const renderPlacementsTab = () => {
    const isLoading = placementsLoading || locationsLoading;

    return (
      <div className="space-y-4">
        {isLoading ? (
          <div className="border-4 border-black bg-[#1e293b] p-6 text-center shadow-hard">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/20 w-3/4 mx-auto"></div>
              <div className="h-4 bg-white/20 w-1/2 mx-auto"></div>
            </div>
            <p className="mt-3 font-bold uppercase">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {/* Placement Breakdown */}
            <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
              <div className="flex items-center gap-2 mb-4">
                <Layout size={20} className="text-brutal-yellow" />
                <h3 className="font-bold text-lg uppercase tracking-wide text-brutal-yellow">
                  {lang === 'vi' ? 'Vị Trí Quảng Cáo' : 'Ad Placements'}
                </h3>
              </div>
              
              {processedPlacements.length > 0 ? (
                <div className="space-y-3">
                  {processedPlacements.map((p, i) => {
                    const percentage = totalPlacementImpressions > 0 
                      ? (p.impressions / totalPlacementImpressions * 100) 
                      : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold truncate flex-1">{p.name}</span>
                          <span className="text-gray-400 ml-2">{formatNumber(p.impressions)}</span>
                        </div>
                        <div className="h-4 bg-black border-2 border-white/20 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                            style={{ width: `${Math.max(percentage, 1)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(p.clicks)} clicks • {formatCurrencyWithSettings(p.spend)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {lang === 'vi' ? 'Không có dữ liệu placement' : 'No placement data available'}
                </div>
              )}
            </div>

            {/* Location Breakdown */}
            <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-brutal-yellow" />
                <h3 className="font-bold text-lg uppercase tracking-wide text-brutal-yellow">
                  {lang === 'vi' ? 'Vị Trí Địa Lý' : 'Geographic Locations'}
                </h3>
              </div>
              
              {processedLocations.length > 0 ? (
                <div className="space-y-3">
                  {processedLocations.map((l, i) => {
                    const percentage = totalLocationImpressions > 0 
                      ? (l.impressions / totalLocationImpressions * 100) 
                      : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold truncate flex-1">{l.region}</span>
                          <span className="text-gray-400 ml-2">{formatNumber(l.impressions)}</span>
                        </div>
                        <div className="h-3 bg-black border-2 border-white/20 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                            style={{ width: `${Math.max(percentage, 1)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {lang === 'vi' ? 'Không có dữ liệu vị trí' : 'No location data available'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderBudgetTab = () => {
    const currencySettings = getCurrencySettings();
    const dailyBudget = campaign?.dailyBudget;
    const lifetimeBudget = campaign?.lifetimeBudget;
    
    return (
      <div className="space-y-4">
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">{lang === 'vi' ? 'Thông Tin Ngân Sách' : 'Budget Information'}</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">{lang === 'vi' ? 'Loại ngân sách' : 'Budget Type'}</span>
              <span className="font-bold">{lifetimeBudget ? t('detail.lifetime') : dailyBudget ? t('detail.daily') : 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">{t('detail.budgetTotal')}</span>
              <span className="font-bold text-xl">
                {currencySettings.currency === 'VND' 
                  ? `${budgetProgress.budget.toLocaleString('vi-VN')} ₫`
                  : `$${budgetProgress.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                }
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">{t('detail.spentTotal')} ({t('detail.lifetime')})</span>
              <span className="font-bold text-xl text-green-400">
                {currencySettings.currency === 'VND'
                  ? `${budgetProgress.spent.toLocaleString('vi-VN')} ₫`
                  : `$${budgetProgress.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                }
              </span>
            </div>

            {lifetimeBudget && (
              <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
                <span className="text-gray-400 uppercase text-sm">{t('detail.remaining')}</span>
                <span className="font-bold text-xl text-blue-400">
                  {currencySettings.currency === 'VND'
                    ? `${budgetProgress.remaining.toLocaleString('vi-VN')} ₫`
                    : `$${budgetProgress.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  }
                </span>
              </div>
            )}

            {/* Progress Bar */}
            {lifetimeBudget && (
              <div className="mt-4 pt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400 uppercase">{lang === 'vi' ? 'Tiến độ chi tiêu' : 'Spend Progress'}</span>
                  <span className="font-bold">{budgetProgress.percentage}%</span>
                </div>
                <div className="h-6 bg-black border-4 border-white/30 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      budgetProgress.percentage >= 90 ? 'bg-red-500' : 
                      budgetProgress.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${budgetProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Info */}
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">{lang === 'vi' ? 'Thông Tin Chiến Dịch' : 'Campaign Info'}</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">{t('management.status')}</span>
              <span className={`font-bold ${isPaused ? 'text-orange-400' : 'text-green-400'}`}>
                {isPaused ? t('status.paused') : t('status.active')}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">{lang === 'vi' ? 'Mục tiêu' : 'Objective'}</span>
              <span className="font-bold">{displayCampaign.objective}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0f172a] text-white font-sans">
      
      <BrutalistHeader 
        title={t('detail.title')} 
        onBack={onBack}
        variant="dark"
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        
        {loading && (
          <div className="border-4 border-black bg-[#1e293b] p-6 text-center shadow-hard">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/20 w-3/4 mx-auto"></div>
              <div className="h-4 bg-white/20 w-1/2 mx-auto"></div>
            </div>
            <p className="mt-3 font-bold uppercase">{t('common.loading')}</p>
          </div>
        )}

        {error && !loading && (
          <div className="border-4 border-red-600 bg-red-900/20 p-6 shadow-hard">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-400 shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-red-400 mb-2 uppercase">{t('error.loadFailed')}</h3>
                <p className="text-sm text-gray-300 mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white border-4 border-black font-bold px-4 py-2 uppercase shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {lang === 'vi' ? 'Thử Lại' : 'Retry'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Title & Status */}
            <div className="border-4 border-black bg-black p-4 shadow-hard">
              <h2 className="font-display font-bold text-2xl mb-2">{displayCampaign.title}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-3 h-3 ${isPaused ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                <span className={`font-bold uppercase ${isPaused ? 'text-orange-500' : 'text-green-500'}`}>
                    {isPaused ? t('status.paused') : t('status.active')}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 uppercase">{displayCampaign.objective}</span>
              </div>
            </div>

            {/* Navigation Tabs - Brutalist Style */}
            <div className="flex border-4 border-black bg-black overflow-x-auto">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-bold uppercase tracking-wide transition-colors border-r-2 border-white/20 last:border-r-0 ${
                    activeTab === tab.id 
                      ? 'bg-brutal-yellow text-black' 
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
            {activeTab === 'audience' && renderAudienceTab()}
            {activeTab === 'placements' && renderPlacementsTab()}
            {activeTab === 'budget' && renderBudgetTab()}

            {/* AI Analysis Button - Only on Overview */}
            {activeTab === 'overview' && insights && (
              <button 
                onClick={handleAIAnalysis}
                disabled={analysisLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 border-4 border-black p-4 flex items-center justify-between shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-black p-2">
                    <Sparkles size={20} className="text-purple-400" />
                  </div>
                  <div className="text-left text-white">
                    <p className="font-bold text-sm uppercase">
                      {lang === 'vi' ? 'Kết Luận AI' : 'AI Conclusion'}
                    </p>
                    <p className="text-xs font-medium opacity-80">
                      {lang === 'vi' ? 'Phân tích hiệu quả chiến dịch bằng AI' : 'Analyze campaign effectiveness with AI'}
                    </p>
                  </div>
                </div>
                <div className="bg-black text-purple-400 px-3 py-1 text-xs font-bold uppercase">
                  {analysisLoading 
                    ? (lang === 'vi' ? 'Đang phân tích...' : 'Analyzing...') 
                    : (lang === 'vi' ? 'Phân tích' : 'Analyze')}
                </div>
              </button>
            )}
          </>
        )}

      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => !analysisLoading && setShowAnalysis(false)} />
          <div className="relative bg-[#1e293b] border-4 border-black w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-hard">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-4 border-black bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-white" />
                <h3 className="font-bold text-lg uppercase text-white">
                  {lang === 'vi' ? 'Kết Luận AI' : 'AI Conclusion'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAnalysis(false)}
                disabled={analysisLoading}
                className="text-white hover:text-gray-300 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {analysisLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400 font-bold uppercase">
                    {lang === 'vi' ? 'AI đang phân tích dữ liệu...' : 'AI is analyzing data...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Campaign Summary */}
                  <div className="bg-black/30 border-2 border-white/10 p-3">
                    <p className="text-xs text-gray-400 uppercase mb-1">
                      {lang === 'vi' ? 'Chiến dịch' : 'Campaign'}
                    </p>
                    <p className="font-bold text-white">{displayCampaign.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedDateLabel}</p>
                  </div>
                  
                  {/* AI Analysis Result */}
                  <div className="bg-purple-900/20 border-2 border-purple-500/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-purple-400" />
                      <span className="text-xs font-bold uppercase text-purple-400">
                        {lang === 'vi' ? 'Phân Tích AI' : 'AI Analysis'}
                      </span>
                    </div>
                    <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {analysisResult}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="w-full bg-brutal-yellow text-black border-4 border-black font-bold py-3 uppercase shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    {lang === 'vi' ? 'Đóng' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampaignDetailScreen;
