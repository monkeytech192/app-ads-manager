import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { BrutalistButton, BrutalistCard, BrutalistSelect, BrutalistHeader } from '../shared/UIComponents';
import BottomNav from '../shared/BottomNav';
import { ScreenView } from '../types';
import { getCampaigns, getAdSets, getAdSetInsights, type Campaign, type AdSet, type CampaignInsights } from '../services/apiService';

interface ComparisonScreenProps {
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
  selectedAccountIds?: string[];
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ onBack, onNavigate, selectedAccountIds }) => {
  // State for campaigns and ad sets
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignA, setCampaignA] = useState<string>('');
  const [campaignB, setCampaignB] = useState<string>('');
  const [adSetsA, setAdSetsA] = useState<AdSet[]>([]);
  const [adSetsB, setAdSetsB] = useState<AdSet[]>([]);
  const [adSetA, setAdSetA] = useState<string>('');
  const [adSetB, setAdSetB] = useState<string>('');
  
  // State for insights
  const [insightsA, setInsightsA] = useState<CampaignInsights | null>(null);
  const [insightsB, setInsightsB] = useState<CampaignInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!selectedAccountIds || selectedAccountIds.length === 0) {
        setError('Vui lòng chọn tài khoản quảng cáo trước');
        return;
      }

      try {
        setLoading(true);
        const campaignsPromises = selectedAccountIds.map(id => getCampaigns(id));
        const campaignsArrays = await Promise.all(campaignsPromises);
        const allCampaigns = campaignsArrays.flat();
        setCampaigns(allCampaigns);
        
        // Auto-select first 2 campaigns if available
        if (allCampaigns.length >= 2) {
          setCampaignA(allCampaigns[0].id);
          setCampaignB(allCampaigns[1].id);
        } else if (allCampaigns.length === 1) {
          setCampaignA(allCampaigns[0].id);
          setCampaignB(allCampaigns[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [selectedAccountIds]);

  // Fetch ad sets for campaign A
  useEffect(() => {
    if (!campaignA) return;

    const fetchAdSetsA = async () => {
      try {
        const adsets = await getAdSets(campaignA);
        setAdSetsA(adsets);
        if (adsets.length > 0) {
          setAdSetA(adsets[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching ad sets A:', err);
      }
    };

    fetchAdSetsA();
  }, [campaignA]);

  // Fetch ad sets for campaign B
  useEffect(() => {
    if (!campaignB) return;

    const fetchAdSetsB = async () => {
      try {
        const adsets = await getAdSets(campaignB);
        setAdSetsB(adsets);
        if (adsets.length > 0) {
          setAdSetB(adsets[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching ad sets B:', err);
      }
    };

    fetchAdSetsB();
  }, [campaignB]);

  // Fetch insights for both ad sets
  const fetchComparison = async () => {
    if (!adSetA || !adSetB) {
      setError('Vui lòng chọn nhóm quảng cáo cho cả hai bên');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [insA, insB] = await Promise.all([
        getAdSetInsights(adSetA, 'last_7d'),
        getAdSetInsights(adSetB, 'last_7d')
      ]);
      
      setInsightsA(insA);
      setInsightsB(insB);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch comparison when ad sets selected
  useEffect(() => {
    if (adSetA && adSetB) {
      fetchComparison();
    }
  }, [adSetA, adSetB]);

  // Format number with currency
  const formatValue = (value: string | undefined, isCurrency: boolean = false): string => {
    if (!value) return '0';
    const num = parseFloat(value);
    
    // Get currency settings from localStorage
    const currencySettings = JSON.parse(localStorage.getItem('currencySettings') || '{"currency":"VND","rate":25000}');
    
    if (isCurrency) {
      const converted = currencySettings.currency === 'VND' ? num * currencySettings.rate : num;
      return `${converted.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ${currencySettings.currency}`;
    }
    
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatPercent = (value: string | undefined): string => {
    if (!value) return '0%';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  // Get selected names
  const campaignAName = campaigns.find(c => c.id === campaignA)?.name || '';
  const campaignBName = campaigns.find(c => c.id === campaignB)?.name || '';
  const adSetAName = adSetsA.find(a => a.id === adSetA)?.name || '';
  const adSetBName = adSetsB.find(a => a.id === adSetB)?.name || '';

  return (
    <div className="flex flex-col h-full w-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
      
      <BrutalistHeader 
        title="SO SÁNH NHÓM QC" 
        onBack={onBack} 
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
        
        {error && (
          <div className="bg-red-100 border-4 border-red-600 p-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={24} />
            <span className="font-bold text-red-600">{error}</span>
          </div>
        )}

        {/* Campaign & Ad Set Selectors */}
        <div className="bg-[#dedcdb] border-4 border-black p-3 shadow-hard space-y-3">
          <h3 className="font-bold uppercase">Chọn chiến dịch và nhóm</h3>
          
          {/* Side A */}
          <div className="border-2 border-black p-2 bg-blue-50">
            <label className="font-bold text-xs block mb-1 text-blue-700">BÊN A</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold block mb-1">Chiến dịch</label>
                <BrutalistSelect 
                  value={campaignA} 
                  onChange={(e) => setCampaignA(e.target.value)}
                  disabled={loading || campaigns.length === 0}
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </BrutalistSelect>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Nhóm quảng cáo</label>
                <BrutalistSelect 
                  value={adSetA} 
                  onChange={(e) => setAdSetA(e.target.value)}
                  disabled={loading || adSetsA.length === 0}
                >
                  <option value="">-- Chọn nhóm --</option>
                  {adSetsA.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </BrutalistSelect>
              </div>
            </div>
          </div>

          {/* Side B */}
          <div className="border-2 border-black p-2 bg-orange-50">
            <label className="font-bold text-xs block mb-1 text-orange-700">BÊN B</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold block mb-1">Chiến dịch</label>
                <BrutalistSelect 
                  value={campaignB} 
                  onChange={(e) => setCampaignB(e.target.value)}
                  disabled={loading || campaigns.length === 0}
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </BrutalistSelect>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Nhóm quảng cáo</label>
                <BrutalistSelect 
                  value={adSetB} 
                  onChange={(e) => setAdSetB(e.target.value)}
                  disabled={loading || adSetsB.length === 0}
                >
                  <option value="">-- Chọn nhóm --</option>
                  {adSetsB.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </BrutalistSelect>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {insightsA && insightsB && (
          <>
            {/* Selected info */}
            <div className="bg-white border-2 border-black p-2 space-y-1 text-xs">
              <div><strong className="text-blue-700">A:</strong> {campaignAName} → {adSetAName}</div>
              <div><strong className="text-orange-700">B:</strong> {campaignBName} → {adSetBName}</div>
            </div>

            <div className="border-4 border-black bg-[#e5e5e5]">
              <div className="grid grid-cols-3 border-b-4 border-black bg-[#d6d3d1]">
                  <div className="p-2 font-bold text-xs sm:text-sm border-r-2 border-black">METRIC</div>
                  <div className="p-2 font-bold text-xs sm:text-sm border-r-2 border-black text-center text-blue-700">BÊN A</div>
                  <div className="p-2 font-bold text-xs sm:text-sm text-center text-orange-600">BÊN B</div>
              </div>
              
              {[
                  { label: 'CHI TIÊU', a: formatValue(insightsA.spend, true), b: formatValue(insightsB.spend, true) },
                  { label: 'LƯỢT HIỂN THỊ', a: formatValue(insightsA.impressions), b: formatValue(insightsB.impressions) },
                  { label: 'NHẤP CHUỘT', a: formatValue(insightsA.clicks), b: formatValue(insightsB.clicks) },
                  { label: 'TẦM TIẾP CẬN', a: formatValue(insightsA.reach), b: formatValue(insightsB.reach) },
                  { label: 'TẦN SUẤT', a: insightsA.frequency || '0', b: insightsB.frequency || '0' },
                  { label: 'CTR', a: formatPercent(insightsA.ctr), b: formatPercent(insightsB.ctr) },
                  { label: 'CPC', a: formatValue(insightsA.cpc, true), b: formatValue(insightsB.cpc, true) },
                  { label: 'CPM', a: formatValue(insightsA.cpm, true), b: formatValue(insightsB.cpm, true) },
                  { label: 'CHUYỂN ĐỔI', a: formatValue(insightsA.conversions), b: formatValue(insightsB.conversions) },
                  { label: 'CHI PHÍ/CHUYỂN ĐỔI', a: formatValue(insightsA.cost_per_conversion, true), b: formatValue(insightsB.cost_per_conversion, true) },
              ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 border-b-2 border-black last:border-b-0">
                      <div className="p-2 font-bold text-xs sm:text-sm border-r-2 border-black uppercase">{row.label}</div>
                      <div className="p-2 font-mono font-bold text-xs sm:text-sm border-r-2 border-black text-center">{row.a}</div>
                      <div className="p-2 font-mono font-bold text-xs sm:text-sm text-center">{row.b}</div>
                  </div>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
            <p className="mt-2 font-bold">Đang tải dữ liệu...</p>
          </div>
        )}

        <BrutalistButton 
          variant="yellow" 
          fullWidth 
          className="!flex !items-center !justify-center !gap-2"
          onClick={fetchComparison}
          disabled={loading || !adSetA || !adSetB}
        >
          LÀM MỚI SO SÁNH <RotateCcw size={20} />
        </BrutalistButton>

      </div>

      <BottomNav currentView="comparison" onNavigate={onNavigate} />
    </div>
  );
};

export default ComparisonScreen;
