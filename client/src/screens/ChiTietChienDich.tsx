import React, { useState, useEffect } from 'react';
import { ChevronDown, Lightbulb, AlertCircle, Users, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { BrutalistCard, BrutalistHeader } from '../shared/UIComponents';
import { CampaignData } from '../types';
import { getCampaignInsights, getDemographicInsights, formatNumber, type CampaignInsights, type DemographicData } from '../services/apiService';
import { formatCurrencyWithSettings } from '../utils/currency';

interface CampaignDetailScreenProps {
  onBack: () => void;
  onNavigateToRecommendations: () => void;
  campaign: CampaignData | null;
}

const StatItem = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <BrutalistCard variant="dark" className="!p-3 flex flex-col justify-between h-24 sm:h-28 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl-full z-0 transition-transform group-hover:scale-150"></div>
      <span className="text-gray-400 text-xs sm:text-sm font-medium z-10">{label}</span>
      <span className={`text-2xl sm:text-3xl font-bold font-display tracking-tight z-10 ${highlight ? 'text-green-400' : ''}`}>{value}</span>
  </BrutalistCard>
);

type TabType = 'overview' | 'performance' | 'audience' | 'budget';

const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({ onBack, onNavigateToRecommendations, campaign }) => {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
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
    { id: 'overview', label: 'Tổng quan', icon: <BarChart3 size={16} /> },
    { id: 'performance', label: 'Hiệu quả', icon: <TrendingUp size={16} /> },
    { id: 'audience', label: 'Đối tượng', icon: <Users size={16} /> },
    { id: 'budget', label: 'Ngân sách', icon: <Wallet size={16} /> },
  ];

  // Fetch campaign insights
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
        // Don't show error, just empty data
        setDemographics([]);
      } finally {
        setDemographicsLoading(false);
      }
    };

    fetchDemographics();
  }, [activeTab, campaign?.id, datePreset]);
  
  // Fallback if no campaign selected
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

  // Get real data from insights or fallback to campaign data
  const spend = insights?.spend ? formatCurrencyWithSettings(parseFloat(insights.spend)) : displayCampaign.spent;
  const impressions = insights?.impressions ? formatNumber(parseInt(insights.impressions)) : displayCampaign.impressions;
  const clicks = insights?.clicks ? formatNumber(parseInt(insights.clicks)) : displayCampaign.results;
  const cpc = insights?.cpc ? formatCurrencyWithSettings(parseFloat(insights.cpc), 2) : displayCampaign.costPerResult;
  const reach = insights?.reach ? formatNumber(parseInt(insights.reach)) : '0';
  const frequency = insights?.frequency ? parseFloat(insights.frequency).toFixed(2) : '0';
  const ctr = insights?.ctr ? `${parseFloat(insights.ctr).toFixed(2)}%` : '0%';
  const cpm = insights?.cpm ? formatCurrencyWithSettings(parseFloat(insights.cpm), 2) : '0';

  // Process demographics data
  const processedDemographics = React.useMemo(() => {
    if (!demographics.length) return { byGender: [], byAge: [], byAgeGender: [] };

    // Group by gender
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

    const byGender = Array.from(genderMap.entries()).map(([gender, data]) => ({
      gender,
      ...data
    }));

    const byAge = Array.from(ageMap.entries()).map(([age, data]) => ({
      age,
      ...data
    })).sort((a, b) => a.age.localeCompare(b.age));

    return { byGender, byAge, byAgeGender: demographics };
  }, [demographics]);

  // Calculate total for percentages
  const totalImpressions = processedDemographics.byGender.reduce((sum, g) => sum + g.impressions, 0);

  // Render Overview Tab
  const renderOverviewTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Số tiền đã chi tiêu" value={spend} highlight />
        <StatItem label="Lượt hiển thị" value={impressions} />
        <StatItem label="Số lần nhấp" value={clicks} />
        <StatItem label="Chi phí mỗi click" value={cpc} />
      </div>

      {insights && (
        <BrutalistCard variant="dark" className="!p-4">
          <h3 className="font-bold text-lg mb-3">Metrics bổ sung</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">Reach:</span>
              <span className="font-bold">{reach}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">Frequency:</span>
              <span className="font-bold">{frequency}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">CTR:</span>
              <span className="font-bold">{ctr}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">CPM:</span>
              <span className="font-bold">{cpm}</span>
            </div>
          </div>
        </BrutalistCard>
      )}
    </div>
  );

  // Render Performance Tab
  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <BrutalistCard variant="dark" className="!p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Chi tiết Hiệu quả</h3>
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-white/20 transition-colors"
            >
              <span>{selectedDateLabel}</span>
              <ChevronDown size={14} className={`transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDateDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDateDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#1e293b] border-2 border-white/20 rounded shadow-xl z-50 min-w-[140px]">
                  {dateOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDatePreset(option.value);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                        datePreset === option.value ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {insights ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 p-3 rounded">
                <div className="text-2xl font-bold text-blue-400">{impressions}</div>
                <div className="text-xs text-gray-400">Hiển thị</div>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <div className="text-2xl font-bold text-green-400">{clicks}</div>
                <div className="text-xs text-gray-400">Nhấp chuột</div>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <div className="text-2xl font-bold text-yellow-400">{reach}</div>
                <div className="text-xs text-gray-400">Reach</div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Tỷ lệ nhấp (CTR)</span>
                <span className="font-bold text-lg">{ctr}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Chi phí mỗi click (CPC)</span>
                <span className="font-bold text-lg">{cpc}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Chi phí 1000 hiển thị (CPM)</span>
                <span className="font-bold text-lg">{cpm}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Tần suất (Frequency)</span>
                <span className="font-bold text-lg">{frequency}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Tổng chi tiêu</span>
                <span className="font-bold text-lg text-green-400">{spend}</span>
              </div>
            </div>

            {insights.date_start && insights.date_stop && (
              <div className="text-center text-xs text-gray-500 mt-4 pt-3 border-t border-white/10">
                Dữ liệu từ {new Date(insights.date_start).toLocaleDateString('vi-VN')} đến {new Date(insights.date_stop).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Không có dữ liệu cho khoảng thời gian này</p>
          </div>
        )}
      </BrutalistCard>
    </div>
  );

  // Render Audience Tab
  const renderAudienceTab = () => (
    <div className="space-y-4">
      {demographicsLoading ? (
        <div className="border-4 border-white/20 bg-white/5 p-6 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-3 font-bold">Đang tải dữ liệu đối tượng...</p>
        </div>
      ) : demographics.length > 0 ? (
        <>
          {/* Gender Distribution */}
          <BrutalistCard variant="dark" className="!p-4">
            <h3 className="font-bold text-lg mb-4">Phân bổ theo Giới tính</h3>
            <div className="space-y-3">
              {processedDemographics.byGender.map((g) => {
                const percentage = totalImpressions > 0 ? (g.impressions / totalImpressions * 100).toFixed(1) : 0;
                return (
                  <div key={g.gender} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{g.gender}</span>
                      <span className="text-gray-400">{percentage}% • {formatNumber(g.impressions)} hiển thị</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${g.gender === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(g.clicks)} clicks • {formatCurrencyWithSettings(g.spend)} chi tiêu
                    </div>
                  </div>
                );
              })}
            </div>
          </BrutalistCard>

          {/* Age Distribution */}
          <BrutalistCard variant="dark" className="!p-4">
            <h3 className="font-bold text-lg mb-4">Phân bổ theo Độ tuổi</h3>
            <div className="space-y-3">
              {processedDemographics.byAge.map((a) => {
                const percentage = totalImpressions > 0 ? (a.impressions / totalImpressions * 100).toFixed(1) : 0;
                return (
                  <div key={a.age} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{a.age} tuổi</span>
                      <span className="text-gray-400">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
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
          </BrutalistCard>
        </>
      ) : (
        <BrutalistCard variant="dark" className="!p-6 text-center">
          <Users size={48} className="mx-auto text-gray-600 mb-3" />
          <h3 className="font-bold text-lg mb-2">Chưa có dữ liệu đối tượng</h3>
          <p className="text-gray-400 text-sm">
            Dữ liệu demographic sẽ hiển thị khi chiến dịch có đủ lượt hiển thị.
          </p>
        </BrutalistCard>
      )}
    </div>
  );

  // Render Budget Tab
  const renderBudgetTab = () => {
    const dailyBudget = (campaign as any)?.dailyBudget;
    const lifetimeBudget = (campaign as any)?.lifetimeBudget;
    const spentAmount = insights?.spend ? parseFloat(insights.spend) : 0;
    const budgetAmount = lifetimeBudget ? parseFloat(lifetimeBudget) / 100 : (dailyBudget ? parseFloat(dailyBudget) / 100 : 0);
    const spentPercentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;

    return (
      <div className="space-y-4">
        <BrutalistCard variant="dark" className="!p-4">
          <h3 className="font-bold text-lg mb-4">Thông tin Ngân sách</h3>
          
          <div className="space-y-4">
            {/* Budget Type */}
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Loại ngân sách</span>
              <span className="font-bold">{lifetimeBudget ? 'Trọn đời' : dailyBudget ? 'Hàng ngày' : 'Chưa thiết lập'}</span>
            </div>

            {/* Budget Amount */}
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Ngân sách</span>
              <span className="font-bold text-lg">
                {lifetimeBudget 
                  ? formatCurrencyWithSettings(parseFloat(lifetimeBudget) / 100)
                  : dailyBudget 
                    ? formatCurrencyWithSettings(parseFloat(dailyBudget) / 100) + '/ngày'
                    : 'N/A'}
              </span>
            </div>

            {/* Spent Amount */}
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Đã chi tiêu</span>
              <span className="font-bold text-lg text-green-400">{spend}</span>
            </div>

            {/* Remaining */}
            {lifetimeBudget && (
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Còn lại</span>
                <span className="font-bold text-lg text-blue-400">
                  {formatCurrencyWithSettings(Math.max(budgetAmount - spentAmount, 0))}
                </span>
              </div>
            )}

            {/* Progress Bar for Lifetime Budget */}
            {lifetimeBudget && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Tiến độ chi tiêu</span>
                  <span className="font-bold">{spentPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      spentPercentage >= 90 ? 'bg-red-500' : 
                      spentPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${spentPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </BrutalistCard>

        {/* Campaign Schedule */}
        <BrutalistCard variant="dark" className="!p-4">
          <h3 className="font-bold text-lg mb-4">Lịch chạy Chiến dịch</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Trạng thái</span>
              <span className={`font-bold ${isPaused ? 'text-orange-400' : 'text-green-400'}`}>
                {isPaused ? 'Đang tạm dừng' : 'Đang hoạt động'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Mục tiêu</span>
              <span className="font-medium">{displayCampaign.objective}</span>
            </div>
          </div>
        </BrutalistCard>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0f172a] text-white font-sans">
      
      <BrutalistHeader 
        title="Chi tiết Chiến dịch" 
        onBack={onBack}
        variant="dark"
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        
        {/* Loading State */}
        {loading && (
          <div className="border-4 border-white/20 bg-white/5 p-6 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="mt-3 font-bold">Đang tải insights...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="border-4 border-red-600 bg-red-900/20 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-400 shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-red-400 mb-2">LỖI TẢI INSIGHTS</h3>
                <p className="text-sm text-gray-300 mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white border-2 border-white font-bold px-4 py-2"
                >
                  THỬ LẠI
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Title & Status */}
            <div>
              <h2 className="font-display font-bold text-2xl mb-2">{displayCampaign.title}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isPaused ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                <span className={`font-bold ${isPaused ? 'text-orange-500' : 'text-green-500'}`}>
                    {isPaused ? 'Đang tạm dừng' : 'Đang hoạt động'}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{displayCampaign.objective}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/20 overflow-x-auto hide-scrollbar gap-1">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 pb-3 px-3 text-sm font-bold whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
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
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-4 border-black p-3 flex items-center justify-between shadow-hard active:translate-y-1 active:shadow-none transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-black p-1.5 rounded-full text-white">
                    <Lightbulb size={20} />
                  </div>
                  <div className="text-left text-black">
                    <p className="font-bold text-sm leading-none">CÓ 3 ĐỀ XUẤT MỚI</p>
                    <p className="text-xs font-medium">Tối ưu ngay để tăng hiệu quả +20%</p>
                  </div>
                </div>
                <div className="bg-black text-white px-2 py-1 text-xs font-bold group-hover:bg-gray-800">
                  XEM NGAY
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
