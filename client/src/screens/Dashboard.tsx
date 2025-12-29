import React, { useState, useEffect } from 'react';
import { DollarSign, Eye, MousePointer2, TrendingUp, Activity, LogOut, AlertCircle, Users } from 'lucide-react';
import { BrutalistCard, BrutalistHeader } from '../shared/UIComponents';
import BottomNav from '../shared/BottomNav';
import { ScreenView, FacebookUserProfile } from '../types';
import { getDashboardMetrics, formatNumber, formatPercentage, type DashboardMetrics } from '../services/apiService';
import { formatCurrencyWithSettings } from '../utils/currency';
import { useTranslation } from '../services/i18n';

interface DashboardScreenProps {
  onBack: () => void; // Used for logout
  onNavigate: (view: ScreenView) => void;
  userProfile: FacebookUserProfile | null; // Receive FB data
}

const StatBox = ({ label, value, icon: Icon, fullWidth = false }: any) => (
  <div className={`bg-[#e5e5e5] border-4 border-black p-2 flex flex-col justify-between relative ${fullWidth ? 'col-span-2 sm:col-span-1' : 'col-span-1'}`}>
    <div className="flex justify-between items-start mb-1">
      <span className="font-bold text-sm leading-tight pr-4">{label}</span>
      <Icon size={16} className="text-black shrink-0" />
    </div>
    <div className="font-display font-bold text-2xl sm:text-3xl tracking-tight break-all">
      {value}
    </div>
  </div>
);

// Pie Chart Component for Demographics
interface PieChartData {
  label: string;
  value: number;
  color: string;
}

const PieChart = ({ data, title, lang }: { data: PieChartData[]; title: string; lang: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">{lang === 'vi' ? 'Chưa có dữ liệu' : 'No data available'}</p>
      </div>
    );
  }

  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-bold text-sm mb-3 uppercase">{title}</h3>
      <div className="flex items-center gap-4">
        <svg width="120" height="120" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, idx) => {
            const percent = item.value / total;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'L 0 0',
            ].join(' ');
            
            return (
              <path key={idx} d={pathData} fill={item.color} stroke="black" strokeWidth="0.02" />
            );
          })}
        </svg>
        <div className="flex flex-col gap-1">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 border border-black" style={{ backgroundColor: item.color }}></div>
              <span className="font-bold">{item.label}: {((item.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Horizontal Bar Chart for Age Distribution
const AgeBarChart = ({ data, lang }: { data: Array<{ age: string; impressions: number }>; lang: string }) => {
  const maxValue = Math.max(...data.map(d => d.impressions), 1);
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">{lang === 'vi' ? 'Chưa có dữ liệu' : 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-sm mb-3 uppercase text-center">
        {lang === 'vi' ? 'PHÂN BỐ ĐỘ TUỔI' : 'AGE DISTRIBUTION'}
      </h3>
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-xs font-bold w-12 text-right">{item.age}</span>
          <div className="flex-1 h-5 bg-gray-200 border-2 border-black relative overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(item.impressions / maxValue) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold w-14 text-right">{formatNumber(item.impressions)}</span>
        </div>
      ))}
    </div>
  );
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onBack, onNavigate, userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, lang } = useTranslation();

  // Fetch dashboard metrics on mount - ONLY ONCE
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err: any) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err.message || t('error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []); // Empty deps = fetch only once
  
  // Use FB data if available, else fallback image
  const avatarUrl = userProfile?.picture?.data?.url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80";
  const userName = userProfile?.name || "Admin User";

  // Avatar Component - Memoized to prevent unnecessary re-renders
  const userAvatarElement = React.useMemo(() => (
    <div className="relative">
        <button 
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="w-10 h-10 border-2 border-black rounded-full overflow-hidden focus:outline-none hover:opacity-90 transition-opacity bg-gray-300"
        >
            <img 
                src={avatarUrl} 
                alt={userName} 
                className="w-full h-full object-cover"
            />
        </button>
    </div>
  ), [avatarUrl, userName]);

  return (
    <div className="flex flex-col h-full w-full"> 
      
      {/* User menu dropdown - Rendered outside header to prevent re-renders */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="fixed right-4 top-14 z-50 w-56 bg-white border-4 border-black shadow-hard p-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 border-b-2 border-black mb-1">
              <p className="text-xs font-bold text-gray-500">{lang === 'vi' ? 'ĐĂNG NHẬP LÀ' : 'LOGGED IN AS'}</p>
              <p className="font-display font-bold text-lg truncate">{userName}</p>
            </div>
            <button 
              onClick={onBack} // Logout action
              className="w-full text-left px-4 py-2 font-bold hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              {lang === 'vi' ? 'ĐĂNG XUẤT' : 'LOGOUT'}
            </button>
          </div>
        </>
      )}
      
      <BrutalistHeader 
        title={lang === 'vi' ? 'Tổng quan Chiến dịch' : 'Campaign Overview'} 
        onBack={() => {}} 
        showBack={false} 
        rightElement={userAvatarElement}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-4 space-y-6">
        
        {/* Loading State */}
        {loading && (
          <BrutalistCard variant="white" className="!p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="mt-4 font-bold text-lg">{t('common.loading')}</p>
          </BrutalistCard>
        )}

        {/* Error State */}
        {error && !loading && (
          <BrutalistCard variant="white" className="!p-6 border-red-600">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-red-600 mb-2">{t('error.loadFailed')}</h3>
                <p className="text-sm mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white border-2 border-black font-bold px-4 py-2 shadow-hard-sm hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  {lang === 'vi' ? 'THỬ LẠI' : 'RETRY'}
                </button>
              </div>
            </div>
          </BrutalistCard>
        )}

        {/* Data Display */}
        {!loading && !error && metrics && (
          <>
            <BrutalistCard variant="yellow" className="relative !p-3 sm:!p-5">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[repeating-linear-gradient(45deg,black,black_10px,yellow_10px,yellow_20px)] border-l-4 border-b-4 border-black z-0 opacity-20"></div>
              
              <h2 className="font-display font-bold text-xl mb-3 border-b-4 border-black inline-block bg-white px-2">
                {lang === 'vi' ? 'HIỆU SUẤT CHÍNH' : 'KEY PERFORMANCE'}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                    <StatBox 
                        label={lang === 'vi' ? 'Tổng Chi phí:' : 'Total Spend:'} 
                        value={formatCurrencyWithSettings(metrics.totalSpend)} 
                        icon={DollarSign} 
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <StatBox 
                        label={lang === 'vi' ? 'Số lượt hiển thị:' : 'Impressions:'} 
                        value={formatNumber(metrics.totalImpressions)} 
                        icon={Eye} 
                    />
                </div>
                
                <div className="col-span-2 grid grid-cols-3 gap-3">
                    <StatBox 
                      label={lang === 'vi' ? 'Số lần nhấp:' : 'Clicks:'} 
                      value={formatNumber(metrics.totalClicks)} 
                      icon={MousePointer2} 
                    />
                    <StatBox 
                      label="CTR:" 
                      value={formatPercentage(metrics.averageCTR)} 
                      icon={TrendingUp} 
                    />
                    <StatBox 
                      label={lang === 'vi' ? 'Hoạt động:' : 'Active:'} 
                      value={`${metrics.activeCampaigns}/${metrics.activeCampaigns + metrics.pausedCampaigns}`} 
                      icon={Activity} 
                    />
                </div>
              </div>
            </BrutalistCard>

            {/* Demographics Charts - Only from ACTIVE campaigns */}
            {metrics.demographics && (metrics.demographics.byGender.length > 0 || metrics.demographics.byAge.length > 0) && (
              <BrutalistCard variant="white" className="!p-3 sm:!p-5">
                <h2 className="font-display font-bold text-xl mb-4 border-b-4 border-black inline-block bg-[#e5e5e5] px-2">
                  <Users size={18} className="inline mr-2" />
                  {lang === 'vi' ? 'ĐỐI TƯỢNG CHIẾN DỊCH ĐANG CHẠY' : 'ACTIVE CAMPAIGN AUDIENCE'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Gender Pie Chart */}
                  {metrics.demographics.byGender.length > 0 && (
                    <PieChart 
                      data={metrics.demographics.byGender.map(g => ({
                        label: g.gender === 'male' ? (lang === 'vi' ? 'Nam' : 'Male') : 
                               g.gender === 'female' ? (lang === 'vi' ? 'Nữ' : 'Female') : g.gender,
                        value: g.impressions,
                        color: g.gender === 'male' ? '#3B82F6' : g.gender === 'female' ? '#EC4899' : '#9CA3AF'
                      }))}
                      title={lang === 'vi' ? 'GIỚI TÍNH' : 'GENDER'}
                      lang={lang}
                    />
                  )}
                  
                  {/* Age Bar Chart */}
                  {metrics.demographics.byAge.length > 0 && (
                    <AgeBarChart 
                      data={metrics.demographics.byAge.map(a => ({
                        age: a.age,
                        impressions: a.impressions
                      }))}
                      lang={lang}
                    />
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  * {lang === 'vi' ? 'Chỉ tính từ chiến dịch đang hoạt động' : 'Only from active campaigns'}
                </p>
              </BrutalistCard>
            )}

            <div>
                <h2 className="font-display font-bold text-xl mb-3 uppercase pl-1">
                    {lang === 'vi' ? 'Tổng quan chiến dịch' : 'Campaign Overview'}
                </h2>
                <BrutalistCard variant="white" className="!p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{lang === 'vi' ? 'CHIẾN DỊCH HOẠT ĐỘNG' : 'ACTIVE CAMPAIGNS'}</p>
                      <p className="font-display font-bold text-4xl text-green-600">{metrics.activeCampaigns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{lang === 'vi' ? 'CHIẾN DỊCH TẠM DỪNG' : 'PAUSED CAMPAIGNS'}</p>
                      <p className="font-display font-bold text-4xl text-yellow-600">{metrics.pausedCampaigns}</p>
                    </div>
                  </div>
                </BrutalistCard>
            </div>
          </>
        )}
        
      </div>

      <BottomNav currentView="dashboard" onNavigate={onNavigate} />

    </div>
  );
};

export default DashboardScreen;
