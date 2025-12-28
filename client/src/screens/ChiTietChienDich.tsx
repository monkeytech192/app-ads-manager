import React, { useState, useEffect } from 'react';
import { ChevronDown, Lightbulb, AlertCircle, Users, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { BrutalistCard, BrutalistHeader } from '../shared/UIComponents';
import { CampaignData } from '../types';
import { getCampaignInsights, getDemographicInsights, formatNumber, type CampaignInsights, type DemographicData } from '../services/apiService';
import { formatCurrencyWithSettings, getCurrencySettings } from '../utils/currency';

interface CampaignDetailScreenProps {
  onBack: () => void;
  onNavigateToRecommendations: () => void;
  campaign: CampaignData | null;
}

// Brutalist style stat card
const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="border-4 border-black bg-[#1e293b] p-3 flex flex-col justify-between h-24 sm:h-28 shadow-hard">
    <span className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wide">{label}</span>
    <span className={`text-2xl sm:text-3xl font-bold font-display tracking-tight ${highlight ? 'text-brutal-yellow' : 'text-white'}`}>{value}</span>
  </div>
);

type TabType = 'overview' | 'performance' | 'audience' | 'budget';

const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({ onBack, onNavigateToRecommendations, campaign }) => {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [lifetimeInsights, setLifetimeInsights] = useState<CampaignInsights | null>(null);
  const [demographics, setDemographics] = useState<DemographicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [demographicsLoading, setDemographicsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<string>('last_7d');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const dateOptions = [
    { value: 'last_7d', label: '7 ngày qua' },
    { value: 'last_14d', label: '14 ngày qua' },
    { value: 'last_30d', label: '30 ngày qua' },
    { value: 'this_month', label: 'Tháng này' },
    { value: 'last_month', label: 'Tháng trước' },
  ];
  
  const selectedDateLabel = dateOptions.find(opt => opt.value === datePreset)?.label || '7 ngày qua';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'TỔNG QUAN', icon: <BarChart3 size={16} /> },
    { id: 'performance', label: 'HIỆU QUẢ', icon: <TrendingUp size={16} /> },
    { id: 'audience', label: 'ĐỐI TƯỢNG', icon: <Users size={16} /> },
    { id: 'budget', label: 'NGÂN SÁCH', icon: <Wallet size={16} /> },
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

  // Get real data from insights
  const spend = insights?.spend ? formatCurrencyWithSettings(parseFloat(insights.spend)) : displayCampaign.spent;
  const impressions = insights?.impressions ? formatNumber(parseInt(insights.impressions)) : displayCampaign.impressions;
  const clicks = insights?.clicks ? formatNumber(parseInt(insights.clicks)) : displayCampaign.results;
  const cpc = insights?.cpc ? formatCurrencyWithSettings(parseFloat(insights.cpc), 2) : displayCampaign.costPerResult;
  const reach = insights?.reach ? formatNumber(parseInt(insights.reach)) : '0';
  const frequency = insights?.frequency ? parseFloat(insights.frequency).toFixed(2) : '0';
  const ctr = insights?.ctr ? `${parseFloat(insights.ctr).toFixed(2)}%` : '0%';
  const cpm = insights?.cpm ? formatCurrencyWithSettings(parseFloat(insights.cpm), 2) : '0';

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
      const genderKey = d.gender === 'male' ? 'Nam' : d.gender === 'female' ? 'Nữ' : d.gender;
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
        <StatCard label={`Chi tiêu (${selectedDateLabel})`} value={spend} highlight />
        <StatCard label="Lượt hiển thị" value={impressions} />
        <StatCard label="Số lần nhấp" value={clicks} />
        <StatCard label="Chi phí/click" value={cpc} />
      </div>

      {insights && (
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">Metrics Bổ Sung</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">Reach</span>
              <div className="font-bold text-xl">{reach}</div>
            </div>
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">Frequency</span>
              <div className="font-bold text-xl">{frequency}</div>
            </div>
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">CTR</span>
              <div className="font-bold text-xl">{ctr}</div>
            </div>
            <div className="border-2 border-white/20 p-3 bg-black/20">
              <span className="text-gray-400 text-xs uppercase">CPM</span>
              <div className="font-bold text-xl">{cpm}</div>
            </div>
          </div>
          
          {/* Show actual date range from API */}
          {insights.date_start && insights.date_stop && (
            <div className="mt-4 pt-3 border-t-2 border-white/10 text-center text-xs text-gray-500">
              Dữ liệu thực tế: {new Date(insights.date_start).toLocaleDateString('vi-VN')} - {new Date(insights.date_stop).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg uppercase tracking-wide text-brutal-yellow">Chi Tiết Hiệu Quả</h3>
          {renderDateDropdown()}
        </div>

        {insights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="border-2 border-blue-500 bg-blue-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{impressions}</div>
                <div className="text-xs text-gray-400 uppercase">Hiển thị</div>
              </div>
              <div className="border-2 border-green-500 bg-green-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{clicks}</div>
                <div className="text-xs text-gray-400 uppercase">Clicks</div>
              </div>
              <div className="border-2 border-yellow-500 bg-yellow-500/10 p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{reach}</div>
                <div className="text-xs text-gray-400 uppercase">Reach</div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {[
                { label: 'Tỷ lệ nhấp (CTR)', value: ctr },
                { label: 'Chi phí mỗi click (CPC)', value: cpc },
                { label: 'Chi phí 1000 hiển thị (CPM)', value: cpm },
                { label: 'Tần suất (Frequency)', value: frequency },
                { label: 'Tổng chi tiêu', value: spend, highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b-2 border-white/10">
                  <span className="text-gray-400 uppercase text-sm">{item.label}</span>
                  <span className={`font-bold text-lg ${item.highlight ? 'text-brutal-yellow' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {insights.date_start && insights.date_stop && (
              <div className="text-center text-xs text-gray-500 mt-4 pt-3 border-t-2 border-white/10 uppercase">
                Dữ liệu: {new Date(insights.date_start).toLocaleDateString('vi-VN')} - {new Date(insights.date_stop).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 uppercase font-bold">
            Không có dữ liệu
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
          <p className="mt-3 font-bold uppercase">Đang tải...</p>
        </div>
      ) : demographics.length > 0 ? (
        <>
          {/* Gender Distribution */}
          <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">Phân Bổ Giới Tính</h3>
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
                        className={`h-full ${g.gender === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'}`}
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
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">Phân Bổ Độ Tuổi</h3>
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
            Dữ liệu demographic sẽ hiển thị khi chiến dịch có đủ lượt hiển thị.
          </p>
        </div>
      )}
    </div>
  );

  const renderBudgetTab = () => {
    const currencySettings = getCurrencySettings();
    const dailyBudget = campaign?.dailyBudget;
    const lifetimeBudget = campaign?.lifetimeBudget;
    
    return (
      <div className="space-y-4">
        <div className="border-4 border-black bg-[#1e293b] p-4 shadow-hard">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">Thông Tin Ngân Sách</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">Loại ngân sách</span>
              <span className="font-bold">{lifetimeBudget ? 'Trọn đời' : dailyBudget ? 'Hàng ngày' : 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">Ngân sách</span>
              <span className="font-bold text-xl">
                {currencySettings.currency === 'VND' 
                  ? `${budgetProgress.budget.toLocaleString('vi-VN')} ₫`
                  : `$${budgetProgress.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                }
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">Đã chi tiêu (Trọn đời)</span>
              <span className="font-bold text-xl text-green-400">
                {currencySettings.currency === 'VND'
                  ? `${budgetProgress.spent.toLocaleString('vi-VN')} ₫`
                  : `$${budgetProgress.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                }
              </span>
            </div>

            {lifetimeBudget && (
              <div className="flex justify-between items-center py-3 border-b-2 border-white/10">
                <span className="text-gray-400 uppercase text-sm">Còn lại</span>
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
                  <span className="text-gray-400 uppercase">Tiến độ chi tiêu</span>
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
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wide text-brutal-yellow">Thông Tin Chiến Dịch</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">Trạng thái</span>
              <span className={`font-bold ${isPaused ? 'text-orange-400' : 'text-green-400'}`}>
                {isPaused ? 'TẠM DỪNG' : 'HOẠT ĐỘNG'}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-white/10">
              <span className="text-gray-400 uppercase text-sm">Mục tiêu</span>
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
        title="CHI TIẾT CHIẾN DỊCH" 
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
            <p className="mt-3 font-bold uppercase">Đang tải insights...</p>
          </div>
        )}

        {error && !loading && (
          <div className="border-4 border-red-600 bg-red-900/20 p-6 shadow-hard">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-400 shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-red-400 mb-2 uppercase">Lỗi Tải Insights</h3>
                <p className="text-sm text-gray-300 mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white border-4 border-black font-bold px-4 py-2 uppercase shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Thử Lại
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
                    {isPaused ? 'Đang tạm dừng' : 'Đang hoạt động'}
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
            {activeTab === 'budget' && renderBudgetTab()}

            {/* Recommendations Teaser - Only on Overview */}
            {activeTab === 'overview' && (
              <button 
                onClick={onNavigateToRecommendations}
                className="w-full bg-brutal-yellow border-4 border-black p-4 flex items-center justify-between shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-black p-2">
                    <Lightbulb size={20} className="text-brutal-yellow" />
                  </div>
                  <div className="text-left text-black">
                    <p className="font-bold text-sm uppercase">Có 3 đề xuất mới</p>
                    <p className="text-xs font-medium">Tối ưu ngay để tăng hiệu quả +20%</p>
                  </div>
                </div>
                <div className="bg-black text-brutal-yellow px-3 py-1 text-xs font-bold uppercase">
                  Xem
                </div>
              </button>
            )}
          </>
        )}

      </div>

    </div>
  );
};

export default CampaignDetailScreen;
