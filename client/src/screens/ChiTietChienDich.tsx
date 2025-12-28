import React, { useState, useEffect } from 'react';
import { Pause, Pencil, ChevronDown, Lightbulb, AlertCircle } from 'lucide-react';
import { BrutalistButton, BrutalistCard, BrutalistHeader } from '../shared/UIComponents';
import { ScreenView, CampaignData } from '../types';
import { getCampaignInsights, formatNumber, type CampaignInsights } from '../services/apiService';
import { formatCurrencyWithSettings, formatCurrencyShort } from '../utils/currency';

interface CampaignDetailScreenProps {
  onBack: () => void;
  onNavigateToRecommendations: () => void;
  campaign: CampaignData | null;
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <BrutalistCard variant="dark" className="!p-3 flex flex-col justify-between h-24 sm:h-28 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl-full z-0 transition-transform group-hover:scale-150"></div>
      <span className="text-gray-400 text-xs sm:text-sm font-medium z-10">{label}</span>
      <span className="text-2xl sm:text-3xl font-bold font-display tracking-tight z-10">{value}</span>
  </BrutalistCard>
);

const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({ onBack, onNavigateToRecommendations, campaign }) => {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<string>('last_7d');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  const dateOptions = [
    { value: 'last_7d', label: '7 ngày qua' },
    { value: 'last_14d', label: '14 ngày qua' },
    { value: 'last_30d', label: '30 ngày qua' },
    { value: 'this_month', label: 'Tháng này' },
    { value: 'last_month', label: 'Tháng trước' },
  ];
  
  const selectedDateLabel = dateOptions.find(opt => opt.value === datePreset)?.label || '7 ngày qua';

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
  
  // Fallback if no campaign selected (shouldn't happen in normal flow)
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
      costPerResult: '0đ'
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

  return (
    <div className="flex flex-col h-full w-full bg-[#0f172a] text-white font-sans">
      
      <BrutalistHeader 
        title="Chi tiết Chiến dịch" 
        onBack={onBack}
        variant="dark"
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        
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
              <h2 className="font-display font-bold text-3xl mb-2">{displayCampaign.title}</h2>
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
        <div className="flex border-b border-white/20 overflow-x-auto hide-scrollbar gap-6">
            {['Tổng quan', 'Hiệu quả', 'Đối tượng', 'Ngân sách'].map((tab, i) => (
                <button 
                    key={tab} 
                    className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
            <StatItem label="Số tiền đã chi tiêu" value={spend} />
            <StatItem label="Lượt hiển thị" value={impressions} />
            <StatItem label="Số lần nhấp" value={clicks} />
            <StatItem label="Chi phí mỗi click" value={cpc} />
        </div>

        {insights && (
          <BrutalistCard variant="dark" className="!p-4">
            <h3 className="font-bold text-lg mb-3">Thêm Metrics</h3>
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
          </>
        )}

        {/* Performance Summary Card */}
        <BrutalistCard variant="dark" className="!p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Hiệu quả theo thời gian</h3>
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
            
            {/* Performance Summary instead of chart (daily breakdown not available from API) */}
            {insights ? (
              <div className="space-y-4">
                <div className="text-center py-6 border border-white/10 rounded bg-white/5">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{clicks}</div>
                  <div className="text-sm text-gray-400">Tổng lượt click</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Thời gian:</span>
                    <span className="font-medium text-gray-300">
                      {insights.date_start && insights.date_stop 
                        ? `${new Date(insights.date_start).toLocaleDateString('vi-VN')} - ${new Date(insights.date_stop).toLocaleDateString('vi-VN')}`
                        : selectedDateLabel}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Chi tiêu:</span>
                    <span className="font-bold text-green-400">{spend}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Hiển thị:</span>
                    <span className="font-bold">{impressions}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">CTR:</span>
                    <span className="font-bold">{ctr}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Không có dữ liệu cho khoảng thời gian này</p>
              </div>
            )}
        </BrutalistCard>

        {/* Recommendations Teaser */}
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

      </div>

      {/* Bottom Actions - Fixed at bottom of flex column */}
      <div className="w-full bg-[#0f172a] border-t-2 border-white/10 p-4 flex gap-3 z-50 shrink-0">
          <BrutalistButton variant="dark-outline" className="flex-1 !text-base sm:!text-lg">
             <Pause size={20} /> Tạm dừng
          </BrutalistButton>
          <BrutalistButton variant="blue" className="flex-1 !border-white !text-base sm:!text-lg">
             <Pencil size={20} /> Chỉnh sửa
          </BrutalistButton>
      </div>

    </div>
  );
};

export default CampaignDetailScreen;
