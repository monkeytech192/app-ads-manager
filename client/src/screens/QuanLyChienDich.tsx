import React, { useState, useEffect } from 'react';
import { Search, Filter, Menu, Target, Facebook, Check, AlertCircle } from 'lucide-react';
import { BrutalistButton, BrutalistCard, BrutalistToggle, BrutalistHeader } from '../shared/UIComponents';
import BottomNav from '../shared/BottomNav';
import { ScreenView, CampaignData, AccountData } from '../types';
import { getAdAccounts, getCampaigns, formatCurrency, type AdAccount, type Campaign } from '../services/apiService';

interface ManagementScreenProps {
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
  onSelectCampaign: (campaign: CampaignData) => void;
  // Props for state management
  activeTab: 'accounts' | 'campaigns';
  setActiveTab: (tab: 'accounts' | 'campaigns') => void;
  accounts: AccountData[];
  onToggleAccount: (id: string) => void;
  campaigns: CampaignData[];
  onToggleCampaignStatus: (id: string) => void;
}

const ManagementScreen: React.FC<ManagementScreenProps> = ({ 
  onBack, 
  onNavigate, 
  onSelectCampaign,
  activeTab,
  setActiveTab,
  accounts: _accounts,
  onToggleAccount,
  campaigns: _campaigns,
  onToggleCampaignStatus
}) => {
  // Input State (What user types)
  const [searchInput, setSearchInput] = useState('');
  
  // Applied Filter State (What logic uses)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Real data from API
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ad accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdAccounts();
        
        // Transform API data to AccountData format
        const transformedAccounts: AccountData[] = data.map((acc: AdAccount) => ({
          id: acc.id,
          name: acc.name,
          status: acc.account_status === 1 ? 'active' as const : 'paused' as const,
          isSelected: false,
        }));
        
        setAccounts(transformedAccounts);
      } catch (err: any) {
        console.error('Error fetching accounts:', err);
        setError(err.message || 'Không thể tải tài khoản quảng cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch campaigns when accounts are selected
  useEffect(() => {
    const selectedAccounts = accounts.filter(a => a.isSelected);
    if (selectedAccounts.length === 0) {
      setCampaigns([]);
      return;
    }

    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const campaignsPromises = selectedAccounts.map(acc => getCampaigns(acc.id));
        const campaignsArrays = await Promise.all(campaignsPromises);
        const allCampaigns = campaignsArrays.flat();

        // Transform API data to CampaignData format
        const transformedCampaigns: CampaignData[] = allCampaigns.map((camp: Campaign) => {
          const budget = camp.daily_budget || camp.lifetime_budget || '0';
          const budgetNumber = parseFloat(budget) / 100; // Facebook returns in cents
          
          return {
            id: camp.id,
            accountId: selectedAccounts[0].id, // Associate with first account
            title: camp.name,
            status: camp.status.toLowerCase() === 'active' ? 'active' as const : 'paused' as const,
            budget: formatCurrency(budgetNumber),
            objective: camp.objective || 'N/A',
            progress: 0, // Would need insights to calculate
            spent: formatCurrency(0), // Would need insights
            impressions: '0',
            results: '0',
            costPerResult: formatCurrency(0),
          };
        });

        setCampaigns(transformedCampaigns);
      } catch (err: any) {
        console.error('Error fetching campaigns:', err);
        setError(err.message || 'Không thể tải chiến dịch');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [accounts]);

  const handleApplyFilter = () => {
    setAppliedSearch(searchInput);
    setIsFilterApplied(true);
  };

  const handleToggleAccountLocal = (id: string) => {
    setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, isSelected: !acc.isSelected } : acc
    ));
  };

  const handleToggleCampaignStatusLocal = (id: string) => {
    setCampaigns(prev => prev.map(camp => 
        camp.id === id ? { ...camp, status: camp.status === 'active' ? 'paused' : 'active' } : camp
    ));
    // TODO: Call API to actually update campaign status on Facebook
  };

  const selectedAccountIds = accounts.filter(a => a.isSelected).map(a => a.id);
  
  // Filtering Logic (Uses appliedSearch instead of searchInput)
  const filteredCampaigns = campaigns.filter(c => {
    const matchAccount = selectedAccountIds.includes(c.accountId);
    const matchSearch = c.title.toLowerCase().includes(appliedSearch.toLowerCase());
    return matchAccount && matchSearch;
  });

  // Filter Accounts (just by search)
  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#e5e5e5]">
      
      <BrutalistHeader 
        title="Quản Lý Tài Khoản & CD" 
        onBack={onBack}
        rightElement={
          <button className="p-1">
            <Menu size={28} strokeWidth={3} />
          </button>
        }
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative border-4 border-black bg-white flex items-center px-2 shadow-hard-sm">
             <Search size={20} className="mr-2" />
             <input 
                type="text" 
                placeholder="Nhập tên..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                className="w-full py-2 font-bold font-mono text-sm focus:outline-none placeholder-black/50"
             />
          </div>
          
          <button 
            onClick={handleApplyFilter}
            className={`
                border-4 border-black px-4 py-2 flex items-center gap-1 font-bold shadow-hard-sm 
                active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all
                bg-brutal-yellow text-black hover:bg-yellow-400
            `}
          >
             <Filter size={18} />
             LỌC
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-4 border-black bg-black">
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`py-3 font-display font-bold text-lg uppercase transition-colors ${activeTab === 'accounts' ? 'bg-brutal-yellow text-black' : 'bg-black text-white'}`}
          >
            Tài Khoản
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`relative py-3 font-display font-bold text-lg uppercase transition-colors border-l-4 border-black ${activeTab === 'campaigns' ? 'bg-brutal-yellow text-black' : 'bg-black text-white'}`}
          >
            Chiến Dịch
            {selectedAccountIds.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white">
                    {selectedAccountIds.length}
                </span>
            )}
          </button>
        </div>

        {/* List Content */}
        <div className="space-y-4 pb-4">
          
          {loading && (
            <div className="border-4 border-black bg-white p-6 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="mt-3 font-bold">Đang tải...</p>
            </div>
          )}

          {error && !loading && (
            <div className="border-4 border-red-600 bg-white p-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">LỖI TẢI DỮ LIỆU</h3>
                  <p className="text-sm mb-3">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white border-2 border-black font-bold px-4 py-2 shadow-hard-sm"
                  >
                    THỬ LẠI
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!loading && !error && activeTab === 'accounts' && (
            <>
              {filteredAccounts.length === 0 ? (
                <div className="text-center py-10 opacity-50 font-bold text-xl border-4 border-black border-dashed">
                  KHÔNG TÌM THẤY TÀI KHOẢN
                </div>
              ) : (
                filteredAccounts.map((acc) => (
                  <div key={acc.id} className="border-4 border-black bg-black p-3 flex items-center justify-between shadow-hard">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1877F2] p-2 border-2 border-[#1877F2] rounded-sm">
                            <Facebook color="white" size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-white text-lg leading-none">{acc.name}</h3>
                            <span className={`${acc.status === 'active' ? 'bg-[#22c55e]' : 'bg-brutal-yellow'} text-black text-xs font-bold px-1 py-0.5 w-fit`}>
                                TRẠNG THÁI: {acc.status === 'active' ? 'HOẠT ĐỘNG' : 'TẠM DỪNG'}
                            </span>
                        </div>
                    </div>
                    
                    <BrutalistButton 
                        onClick={() => handleToggleAccountLocal(acc.id)}
                        variant={acc.isSelected ? 'black' : 'yellow'} 
                        className={`
                            !text-sm !py-1 !px-4 !border-2 
                            !shadow-[2px_2px_0px_0px_white] 
                            active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-none
                            transition-all
                            ${acc.isSelected ? '!bg-black !text-white !border-white' : ''}
                        `}
                    >
                        {acc.isSelected ? (
                            <Check size={20} strokeWidth={4} />
                        ) : 'CHỌN'}
                    </BrutalistButton>
                  </div>
                ))
              )}
            </>
          )}

          {!loading && !error && activeTab === 'campaigns' && (
            <>
               {selectedAccountIds.length === 0 ? (
                   <div className="text-center py-10 opacity-50 font-bold text-xl border-4 border-black border-dashed">
                       VUI LÒNG CHỌN TÀI KHOẢN <br/> ĐỂ XEM CHIẾN DỊCH
                   </div>
               ) : (
                   <>
                       {filteredCampaigns.length === 0 ? (
                            <div className="text-center py-10 opacity-50 font-bold border-4 border-black border-dashed">
                                KHÔNG TÌM THẤY CHIẾN DỊCH
                            </div>
                       ) : (
                           filteredCampaigns.map((camp) => (
                               <BrutalistCard key={camp.id} variant="white" className="!p-0 overflow-hidden relative mb-4">
                                  <div className="p-3 border-b-4 border-black flex justify-between items-start bg-white">
                                      <div className="flex gap-3 flex-1 pr-2">
                                         <div className="border-4 border-black p-2 bg-white h-fit shrink-0">
                                            <Target size={28} />
                                         </div>
                                         <div className="flex flex-col">
                                            <h3 className="font-display font-bold text-xl uppercase leading-tight mb-1">{camp.title}</h3>
                                            <span className={`${camp.status === 'active' ? 'bg-[#3B82F6] text-white' : 'bg-brutal-yellow text-black'} px-1 text-sm font-bold block w-fit mb-1`}>
                                                MỤC TIÊU: {camp.objective}
                                            </span>
                                            <p className="font-bold text-sm text-gray-600">NGÂN SÁCH: {camp.budget}</p>
                                         </div>
                                      </div>
                                      
                                      <div className="shrink-0 pt-1">
                                          <BrutalistToggle 
                                            checked={camp.status === 'active'} 
                                            onChange={() => handleToggleCampaignStatusLocal(camp.id)}
                                            labelOn="ON"
                                            labelOff="OFF"
                                          />
                                      </div>
                                  </div>
            
                                  <div className="p-3 bg-[#e5e5e5]">
                                      <div className="w-full h-6 border-4 border-black bg-white relative mb-2">
                                          <div 
                                            style={{ width: `${camp.progress}%` }}
                                            className="absolute top-0 left-0 h-full bg-blue-600 border-r-4 border-black transition-all duration-500"
                                          ></div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                          <span className="font-bold text-sm">{camp.progress}% TIẾN ĐỘ</span>
                                          <BrutalistButton onClick={() => onSelectCampaign(camp)} variant="yellow" className="!text-sm !py-1 !border-2">
                                             XEM CHI TIẾT
                                          </BrutalistButton>
                                      </div>
                                  </div>
                               </BrutalistCard>
                           ))
                       )}
                   </>
               )}
            </>
          )}

        </div>
      </div>

      <BottomNav currentView="management" onNavigate={onNavigate} />
    </div>
  );
};

export default ManagementScreen;
