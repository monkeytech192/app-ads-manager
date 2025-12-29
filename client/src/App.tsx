import React, { useState, useEffect } from 'react';
import { Facebook, Globe, MessageCircleQuestion, X, UserPlus, LogIn, CheckSquare, Square, ChevronDown, Sparkles } from 'lucide-react';
import { BrutalistCard, BrutalistButton, BrutalistInput, TextureOverlay } from './shared/UIComponents';
import { askAssistant, askAssistantWithContext, type CampaignContext } from './services/aiService';
import { useTranslation, type Language } from './services/i18n';
import { initFacebookSdk, loginWithFacebook, getFacebookUserProfile } from './services/facebookService';
import { getAdAccounts, getCampaigns, getCampaignInsights } from './services/apiService';
import { AdAccount, Campaign } from './services/apiService';
import { getCurrencySettings } from './utils/currency';
import { useToast } from './shared/Toast';
import DashboardScreen from './screens/Dashboard';
import ManagementScreen from './screens/QuanLyChienDich';
import ComparisonScreen from './screens/SoSanhChienDich';
import SettingsScreen from './screens/CaiDat';
// DeXuat screen removed - AI analysis now in CampaignDetail
import CampaignDetailScreen from './screens/ChiTietChienDich';
import { ScreenView, CampaignData, AccountData, FacebookUserProfile } from './types';

// Simple markdown parser for chat messages
const parseMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const lines = text.split('\n');
  
  lines.forEach((line, lineIdx) => {
    // Parse bold text (**text**)
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    const lineParts: React.ReactNode[] = [];
    
    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        lineParts.push(line.substring(lastIndex, match.index));
      }
      // Add bold text
      lineParts.push(<strong key={`bold-${lineIdx}-${match.index}`} className="font-bold">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < line.length) {
      lineParts.push(line.substring(lastIndex));
    }
    
    // If no matches, just add the line
    if (lineParts.length === 0) {
      lineParts.push(line);
    }
    
    parts.push(<span key={`line-${lineIdx}`}>{lineParts}{lineIdx < lines.length - 1 && <br />}</span>);
  });
  
  return parts;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const App = () => {
  const { t, lang, setLang } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentView, setCurrentView] = useState<ScreenView>('login');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);

  // User State
  const [userProfile, setUserProfile] = useState<FacebookUserProfile | null>(null);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // --- Global State for Management Screen (Persist on Navigation) ---
  const [managementTab, setManagementTab] = useState<'accounts' | 'campaigns'>('accounts');
  
  // Real API data - fetched once and cached
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);

  // Init Facebook SDK on mount
  useEffect(() => {
    initFacebookSdk();
  }, []);

  // Fetch accounts ONCE when management screen is opened (if not already loaded)
  useEffect(() => {
    if (currentView === 'management' && !accountsLoaded) {
      const fetchAccounts = async () => {
        try {
          const accountsData = await getAdAccounts();
          
          // Transform API data to AccountData format
          const transformedAccounts: AccountData[] = accountsData.map((acc: AdAccount) => ({
            id: acc.id,
            name: acc.name,
            isSelected: false,
            status: 'active' as const, // Default status
            currency: acc.currency, // Save account currency (VND, USD, etc.)
          }));
          
          setAccounts(transformedAccounts);
          setAccountsLoaded(true);
        } catch (err: any) {
          console.error('Error fetching accounts:', err);
        }
      };

      fetchAccounts();
    }
  }, [currentView, accountsLoaded]);

  // Fetch campaigns when accounts are selected - use selectedAccountIds to prevent duplicate calls
  const selectedAccountIds = accounts.filter(a => a.isSelected).map(a => a.id).join(',');
  
  useEffect(() => {
    if (!selectedAccountIds) {
      setCampaigns([]);
      return;
    }

    const selectedAccounts = accounts.filter(a => a.isSelected);
    let isCancelled = false;

    const fetchCampaigns = async () => {
      try {
        const campaignsPromises = selectedAccounts.map(acc => getCampaigns(acc.id));
        const campaignsArrays = await Promise.all(campaignsPromises);
        const allCampaigns = campaignsArrays.flat();

        if (isCancelled) return;

        // Fetch insights for each campaign to get spend data
        const campaignsWithInsights = await Promise.all(
          allCampaigns.map(async (camp: Campaign) => {
            try {
              // Use 'maximum' instead of 'lifetime' - valid date_preset
              const insights = await getCampaignInsights(camp.id, 'maximum');
              return { ...camp, insights };
            } catch (err) {
              console.error(`Error fetching insights for campaign ${camp.id}:`, err);
              return { ...camp, insights: null };
            }
          })
        );

        if (isCancelled) return;

        // Transform API data to CampaignData format
        const transformedCampaigns: CampaignData[] = campaignsWithInsights.map((camp: Campaign & { insights: any }) => {
          const budget = camp.daily_budget || camp.lifetime_budget || '0';
          const budgetInAccountCurrency = parseFloat(budget) / 100; // Facebook returns in cents, this is in account currency
          
          // Get account currency
          const account = selectedAccounts[0];
          const accountCurrency = account?.currency || 'USD';
          
          // Get user's currency display settings
          const currencySettings = getCurrencySettings();
          
          // Calculate progress: (spend / budget) * 100
          // LOGIC: Convert BOTH budget and spend to user's display currency, then calculate
          let progress = 0;
          let displayBudget = budgetInAccountCurrency;
          let displaySpend = 0;
          
          if (camp.insights?.spend && budgetInAccountCurrency > 0) {
            const spendInAccountCurrency = parseFloat(camp.insights.spend); // Spend is in account currency
            displaySpend = spendInAccountCurrency;
            
            // If user chose VND display but account is USD, convert BOTH to VND
            if (currencySettings.currency === 'VND' && accountCurrency === 'USD') {
              displayBudget = budgetInAccountCurrency * currencySettings.rate;
              displaySpend = spendInAccountCurrency * currencySettings.rate;
            }
            // If user chose USD and account is USD, keep as is
            // If account is VND and user chose VND, keep as is
            
            progress = Math.min(Math.round((displaySpend / displayBudget) * 100), 100);
          }
          
          // Format currency for display based on user settings
          const formatBudgetDisplay = () => {
            if (currencySettings.currency === 'VND') {
              // Convert USD to VND if account is USD
              const valueInVND = accountCurrency === 'USD' 
                ? budgetInAccountCurrency * currencySettings.rate 
                : budgetInAccountCurrency;
              return `${valueInVND.toLocaleString('vi-VN')} ₫`;
            } else {
              return `$${budgetInAccountCurrency.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            }
          };
          
          const formatSpendDisplay = () => {
            const spendValue = camp.insights?.spend ? parseFloat(camp.insights.spend) : 0;
            if (currencySettings.currency === 'VND') {
              const valueInVND = accountCurrency === 'USD' 
                ? spendValue * currencySettings.rate 
                : spendValue;
              return `${valueInVND.toLocaleString('vi-VN')} ₫`;
            } else {
              return `$${spendValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            }
          };
          
          return {
            id: camp.id,
            accountId: selectedAccounts[0].id,
            title: camp.name,
            status: camp.status.toLowerCase() === 'active' ? 'active' as const : 'paused' as const,
            budget: formatBudgetDisplay(),
            objective: camp.objective || 'N/A',
            progress: progress,
            spent: formatSpendDisplay(),
            impressions: camp.insights?.impressions || '0',
            results: camp.insights?.clicks || '0',
            costPerResult: formatCurrency(camp.insights?.cpc ? parseFloat(camp.insights.cpc) : 0),
            dailyBudget: camp.daily_budget,
            lifetimeBudget: camp.lifetime_budget,
          };
        });

        setCampaigns(transformedCampaigns);
      } catch (err: any) {
        console.error('Error fetching campaigns:', err);
      }
    };

    fetchCampaigns();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [selectedAccountIds]); // Only re-run when selected account IDs change

  const handleToggleAccount = (id: string) => {
    setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, isSelected: !acc.isSelected } : acc
    ));
  };

  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(camp => 
        camp.id === id ? { ...camp, status: camp.status === 'active' ? 'paused' : 'active' } : camp
    ));
  };
  // -----------------------------------------------------------------

  // AI Helper State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Last viewed campaign context - persists across screens
  const [lastCampaignContext, setLastCampaignContext] = useState<CampaignContext | null>(null);

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  const handleAiAsk = async () => {
    if (!query.trim()) return;
    const userMessage = query.trim();
    setQuery(''); // Reset input immediately
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      // Use campaign context if available, otherwise use basic assistant
      let result: string;
      if (lastCampaignContext) {
        result = await askAssistantWithContext(userMessage, lastCampaignContext, lang);
      } else {
        result = await askAssistant(userMessage);
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: lang === 'vi' ? 'Lỗi kết nối.' : 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = () => {
    // In a real app, validate credentials here
    setCurrentView('dashboard');
  };

  const { showToast } = useToast();

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
        await loginWithFacebook();
        const profile = await getFacebookUserProfile();
        setUserProfile(profile);
        setCurrentView('dashboard');
        showToast(lang === 'vi' ? 'Đăng nhập thành công!' : 'Login successful!', 'success');
    } catch (error) {
        console.error("Facebook Login Error:", error);
        showToast(lang === 'vi' ? 'Đăng nhập Facebook thất bại hoặc đã bị hủy.' : 'Facebook login failed or was cancelled.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = () => {
     // In a real app, perform registration logic here
     if(regPassword !== regConfirmPassword) {
         showToast(lang === 'vi' ? 'Mật khẩu không khớp!' : 'Passwords do not match!', 'error');
         return;
     }
     setCurrentView('dashboard');
  }

  const handleSelectCampaign = (campaign: CampaignData) => {
    setSelectedCampaign(campaign);
    setCurrentView('campaignDetail');
  };

  // Helper render function for logged-in routes
  const renderAuthenticatedContent = () => {
    switch (currentView) {
      case 'management':
        return (
          <ManagementScreen 
            onBack={() => setCurrentView('dashboard')} 
            onNavigate={setCurrentView}
            onSelectCampaign={handleSelectCampaign}
            // Pass global state
            activeTab={managementTab}
            setActiveTab={setManagementTab}
            accounts={accounts}
            onToggleAccount={handleToggleAccount}
            campaigns={campaigns}
            onToggleCampaignStatus={handleToggleCampaignStatus}
          />
        );
      case 'campaignDetail':
        return (
            <CampaignDetailScreen 
                campaign={selectedCampaign}
                onBack={() => setCurrentView('management')}
                onUpdateCampaignContext={setLastCampaignContext}
            />
        );
      case 'comparison':
        return <ComparisonScreen 
          onBack={() => setCurrentView('dashboard')} 
          onNavigate={setCurrentView} 
          selectedAccountIds={accounts.filter(a => a.isSelected).map(a => a.id)}
        />;
      case 'settings':
        return <SettingsScreen onBack={() => setCurrentView('dashboard')} onNavigate={setCurrentView} />;
      // recommendations screen removed - AI analysis now integrated in campaign detail
      case 'dashboard':
      default:
        return (
            <DashboardScreen 
                onBack={() => {
                    setCurrentView('login');
                    setUserProfile(null); // Clear user data on logout
                }} 
                onNavigate={setCurrentView} 
                userProfile={userProfile} // Pass FB user data
            />
        );
    }
  };

  const isAuthScreen = currentView === 'login' || currentView === 'register';

  // Authenticated Wrapper
  if (!isAuthScreen) {
    return (
      <div className="fixed inset-0 w-full bg-[#1c1917] font-sans text-black overflow-hidden flex flex-col items-center justify-center">
         {/* Background pattern for the desktop area */}
         <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-concrete.png')] opacity-30 z-0"></div>
         
         {/* Main App Shell - Fixed Size, Scroll happens INSIDE components */}
         <div className="relative z-10 w-full max-w-xl h-[100dvh] bg-[#d6d3d1] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-x-4 border-black flex flex-col overflow-hidden">
             {/* Inner texture for the app area */}
             <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-50 z-0 mix-blend-multiply h-full"></div>
             
             {/* Content Area - Flex Grow to fill space */}
             <div className="flex-1 w-full h-full overflow-hidden relative z-10">
                {renderAuthenticatedContent()}
             </div>

             {/* AI Button - Positioned absolute relative to app shell */}
             <div className="absolute bottom-20 right-4 z-40">
                <button 
                    onClick={() => setIsAiOpen(true)}
                    className="bg-black text-white p-3 rounded-full border-4 border-brutal-yellow shadow-hard hover:scale-110 transition-transform"
                    title={lang === 'vi' ? (lastCampaignContext ? `Trợ lý AI - ${lastCampaignContext.campaignName}` : 'Trợ lý AI') : (lastCampaignContext ? `AI Assistant - ${lastCampaignContext.campaignName}` : 'AI Assistant')}
                >
                    <MessageCircleQuestion size={24} />
                </button>
             </div>

              {/* Shared AI Modal - Chat Interface */}
              {isAiOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="w-full sm:max-w-md bg-[#1a1a2e] border-4 border-black shadow-hard flex flex-col max-h-[85vh] sm:max-h-[70vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in duration-200">
                    {/* Header */}
                    <div className={`flex items-center justify-between p-3 border-b-4 border-black ${lastCampaignContext ? 'bg-brutal-yellow' : 'bg-black'}`}>
                      <div className="flex items-center gap-2">
                        {lastCampaignContext && (
                          <div className="bg-black p-1.5">
                            <Sparkles size={14} className="text-brutal-yellow" />
                          </div>
                        )}
                        <div>
                          <h3 className={`font-display font-bold text-sm uppercase ${lastCampaignContext ? 'text-black' : 'text-white'}`}>
                            {t('assistant.title')}
                          </h3>
                          {lastCampaignContext && (
                            <p className="text-[10px] text-black/70 font-medium truncate max-w-[180px]">
                              📊 {lastCampaignContext.campaignName}
                            </p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAiOpen(false)}
                        className={`p-1 transition-colors ${lastCampaignContext ? 'text-black/60 hover:text-black hover:bg-black/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Campaign Context Badge */}
                    {lastCampaignContext && (
                      <div className="px-3 py-2 bg-black/30 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {lang === 'vi' ? 'Đang phân tích: ' : 'Analyzing: '}
                          <span className="text-white font-medium">{lastCampaignContext.dateRange}</span>
                        </span>
                        <button 
                          onClick={() => setLastCampaignContext(null)}
                          className="text-[10px] text-gray-500 hover:text-white uppercase"
                        >
                          {lang === 'vi' ? 'Xóa context' : 'Clear context'}
                        </button>
                      </div>
                    )}
                    
                    {/* Chat Messages Area */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]"
                    >
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-3 bg-brutal-yellow/20 border-2 border-brutal-yellow flex items-center justify-center">
                            <MessageCircleQuestion size={24} className="text-brutal-yellow" />
                          </div>
                          <p className="text-gray-400 text-sm">
                            {lastCampaignContext 
                              ? (lang === 'vi' ? `Hỏi bất cứ điều gì về "${lastCampaignContext.campaignName}"!` : `Ask anything about "${lastCampaignContext.campaignName}"!`)
                              : (lang === 'vi' ? 'Xin chào! Tôi có thể giúp gì cho bạn?' : 'Hello! How can I help you?')
                            }
                          </p>
                          {lastCampaignContext && (
                            <p className="text-gray-500 text-xs mt-2">
                              {lang === 'vi' ? 'AI sẽ trả lời dựa trên dữ liệu chiến dịch' : 'AI will answer based on campaign data'}
                            </p>
                          )}
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] p-3 text-sm ${
                              msg.role === 'user' 
                                ? 'bg-brutal-yellow text-black border-2 border-black' 
                                : 'bg-white/10 text-white border-2 border-white/20'
                            }`}>
                              <div className="whitespace-pre-wrap">{parseMarkdown(msg.content)}</div>
                            </div>
                          </div>
                        ))
                      )}
                      {/* Loading indicator */}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 border-2 border-white/20 p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-brutal-yellow rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                <span className="w-2 h-2 bg-brutal-yellow rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                <span className="w-2 h-2 bg-brutal-yellow rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                              </div>
                              <span className="text-xs text-gray-400">{lang === 'vi' ? 'Đang trả lời...' : 'Typing...'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Input Area */}
                    <div className="p-3 border-t-4 border-black bg-black/50">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={lang === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...'}
                          className="flex-1 bg-white/10 border-2 border-white/20 p-3 text-white text-sm focus:outline-none focus:border-brutal-yellow placeholder-gray-500"
                          onKeyDown={(e) => e.key === 'Enter' && !loading && handleAiAsk()}
                          disabled={loading}
                        />
                        <button 
                          onClick={handleAiAsk}
                          disabled={loading || !query.trim()}
                          className="bg-brutal-yellow border-2 border-black px-4 font-bold uppercase text-sm text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {lang === 'vi' ? 'Gửi' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
         </div>
      </div>
    );
  }

  // Auth View (Login / Register)
  return (
    <div className="fixed inset-0 w-full flex flex-col items-center justify-center bg-[#1c1917] font-sans text-black py-4">
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-concrete.png')] opacity-30 z-0"></div>

      <div className="h-full overflow-y-auto w-full max-w-md z-10 space-y-2 bg-[#e5e5e5] p-4 border-4 border-black shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)]">
        <TextureOverlay />
        
        {/* Header */}
        <div className="flex justify-between items-stretch border-4 border-black bg-[#a8a29e] p-2 sm:p-3 relative z-20">
          <div className="flex items-center">
            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tighter uppercase leading-none mt-1">
              {lang === 'vi' ? 'Quản Lý Ads FB' : 'FB Ads Manager'}
            </h1>
          </div>
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="bg-brutal-yellow border-4 border-black px-3 py-2 flex items-center gap-2 font-bold text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              title={lang === 'vi' ? 'Đổi ngôn ngữ' : 'Change language'}
            >
              {lang === 'vi' ? (
                <svg className="w-6 h-4" viewBox="0 0 30 20"><rect width="30" height="20" fill="#da251d"/><polygon points="15,4 11.5,14.5 19.5,8 10.5,8 18.5,14.5" fill="#ffff00"/></svg>
              ) : (
                <svg className="w-6 h-4" viewBox="0 0 30 20"><rect width="30" height="20" fill="#b22234"/><rect y="1.54" width="30" height="1.54" fill="white"/><rect y="4.62" width="30" height="1.54" fill="white"/><rect y="7.69" width="30" height="1.54" fill="white"/><rect y="10.77" width="30" height="1.54" fill="white"/><rect y="13.85" width="30" height="1.54" fill="white"/><rect y="16.92" width="30" height="1.54" fill="white"/><rect width="12" height="10.77" fill="#3c3b6e"/></svg>
              )}
              <ChevronDown size={14} className="text-black" />
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute top-full right-0 mt-1 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 min-w-[140px]">
                  <button
                    onClick={() => { setLang('vi'); setShowLangMenu(false); }}
                    className={`w-full px-3 py-2.5 text-left font-bold text-sm flex items-center gap-3 border-b-2 border-black/20 hover:bg-gray-100 transition-colors ${lang === 'vi' ? 'bg-brutal-yellow' : ''}`}
                  >
                    <svg className="w-6 h-4" viewBox="0 0 30 20"><rect width="30" height="20" fill="#da251d"/><polygon points="15,4 11.5,14.5 19.5,8 10.5,8 18.5,14.5" fill="#ffff00"/></svg>
                    <span>Tiếng Việt</span>
                  </button>
                  <button
                    onClick={() => { setLang('en'); setShowLangMenu(false); }}
                    className={`w-full px-3 py-2.5 text-left font-bold text-sm flex items-center gap-3 hover:bg-gray-100 transition-colors ${lang === 'en' ? 'bg-brutal-yellow' : ''}`}
                  >
                    <svg className="w-6 h-4" viewBox="0 0 30 20"><rect width="30" height="20" fill="#b22234"/><rect y="1.54" width="30" height="1.54" fill="white"/><rect y="4.62" width="30" height="1.54" fill="white"/><rect y="7.69" width="30" height="1.54" fill="white"/><rect y="10.77" width="30" height="1.54" fill="white"/><rect y="13.85" width="30" height="1.54" fill="white"/><rect y="16.92" width="30" height="1.54" fill="white"/><rect width="12" height="10.77" fill="#3c3b6e"/></svg>
                    <span>English</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {currentView === 'login' ? (
            /* LOGIN VIEW */
            <>
                <BrutalistCard variant="white" className="relative group">
                <h2 className="font-display font-bold text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tight mb-4">
                    {lang === 'vi' ? <>Kết nối dữ liệu <br/> quảng cáo.</> : <>Connect your <br/> ad data.</>}
                </h2>
                <p className="text-sm mb-4 border-l-4 border-black pl-3 py-2 bg-gray-100">
                    <strong>{lang === 'vi' ? 'Hỗ trợ cả 2 loại tài khoản:' : 'Support both account types:'}</strong><br/>
                    ✓ {lang === 'vi' ? 'Facebook cá nhân có Ads Manager' : 'Personal Facebook with Ads Manager'}<br/>
                    ✓ {lang === 'vi' ? 'Facebook Business Account' : 'Facebook Business Account'}
                </p>
                <BrutalistButton variant="facebook" fullWidth onClick={handleFacebookLogin} disabled={isLoading}>
                    <Facebook fill="white" size={24} />
                    {isLoading ? (lang === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (lang === 'vi' ? 'Kết nối với Facebook' : 'Connect with Facebook')}
                </BrutalistButton>
                </BrutalistCard>

                <BrutalistCard variant="gray" className="space-y-4 relative z-20">
                    <div className="space-y-4 pt-2">
                        <BrutalistInput 
                            placeholder={lang === 'vi' ? 'Email hoặc số điện thoại' : 'Email or phone number'} 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <BrutalistInput 
                            type="password"
                            placeholder={lang === 'vi' ? 'Mật khẩu' : 'Password'} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        {/* Remember Me Checkbox */}
                        <div 
                            className="flex items-center gap-2 cursor-pointer w-fit" 
                            onClick={() => setRememberMe(!rememberMe)}
                        >
                            <div className="relative">
                                {rememberMe ? <CheckSquare size={24} strokeWidth={2.5} /> : <Square size={24} strokeWidth={2.5} />}
                            </div>
                            <span className="font-bold text-sm uppercase select-none">{lang === 'vi' ? 'Ghi nhớ đăng nhập' : 'Remember me'}</span>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3 justify-center">
                        <BrutalistButton variant="black" fullWidth onClick={handleEmailLogin}>
                           {lang === 'vi' ? 'Đăng nhập Email' : 'Login with Email'}
                        </BrutalistButton>
                        <div className="text-center">
                             <span className="font-bold text-sm">{lang === 'vi' ? 'Chưa có tài khoản? ' : "Don't have an account? "}</span>
                             <button 
                                onClick={() => setCurrentView('register')}
                                className="font-bold text-sm underline hover:text-blue-600 uppercase"
                             >
                                {lang === 'vi' ? 'Đăng ký thủ công' : 'Register'}
                             </button>
                        </div>
                    </div>
                </BrutalistCard>
            </>
        ) : (
            /* REGISTER VIEW */
            <>
                <BrutalistCard variant="yellow" className="relative group z-20">
                    <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase leading-[0.9] tracking-tight mb-2">
                        {lang === 'vi' ? 'Đăng ký tài khoản' : 'Create Account'}
                    </h2>
                    <p className="font-medium text-base mb-4">
                        {lang === 'vi' ? 'Tạo tài khoản mới để quản lý chiến dịch hiệu quả hơn.' : 'Create a new account to manage campaigns more effectively.'}
                    </p>
                    <BrutalistButton variant="facebook" fullWidth onClick={handleFacebookLogin} disabled={isLoading} className="!text-sm sm:!text-base">
                        <Facebook fill="white" size={20} />
                         {isLoading ? (lang === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (lang === 'vi' ? 'Đăng ký bằng Facebook' : 'Register with Facebook')}
                    </BrutalistButton>
                </BrutalistCard>

                <BrutalistCard variant="gray" className="space-y-4 relative z-20">
                    <div className="space-y-3 pt-2">
                         <BrutalistInput 
                            placeholder={lang === 'vi' ? 'Họ và tên' : 'Full name'} 
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                        <BrutalistInput 
                            placeholder={lang === 'vi' ? 'Email của bạn' : 'Your email'} 
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                        <BrutalistInput 
                            type="password"
                            placeholder={lang === 'vi' ? 'Mật khẩu' : 'Password'} 
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                         <BrutalistInput 
                            type="password"
                            placeholder={lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm password'} 
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2 flex flex-col gap-3 justify-center">
                        <BrutalistButton variant="black" fullWidth onClick={handleRegister}>
                           <UserPlus size={20} /> {lang === 'vi' ? 'Đăng ký ngay' : 'Register Now'}
                        </BrutalistButton>
                         <div className="text-center">
                             <span className="font-bold text-sm">{lang === 'vi' ? 'Đã có tài khoản? ' : 'Already have an account? '}</span>
                             <button 
                                onClick={() => setCurrentView('login')}
                                className="font-bold text-sm underline hover:text-blue-600 uppercase"
                             >
                                {lang === 'vi' ? 'Đăng nhập' : 'Login'}
                             </button>
                        </div>
                    </div>
                </BrutalistCard>
            </>
        )}

        {/* Footer Disclaimer */}
        <BrutalistCard variant="white" className="py-3 px-4 text-sm font-medium border-4 border-black z-20">
            {lang === 'vi' 
              ? <>Bằng cách tiếp tục, bạn đồng ý với <a href="#" className="underline decoration-2">Điều khoản</a> & <a href="#" className="underline decoration-2">Chính sách</a>.</>
              : <>By continuing, you agree to our <a href="#" className="underline decoration-2">Terms</a> & <a href="#" className="underline decoration-2">Privacy Policy</a>.</>}
        </BrutalistCard>

      </div>

      {/* Floating Action Button for AI Help (Auth) */}
      <div className="fixed bottom-6 w-full max-w-md z-50 px-6 pointer-events-none flex justify-end">
          <button 
            onClick={() => setIsAiOpen(true)}
            className="pointer-events-auto bg-black text-white p-4 rounded-full border-4 border-brutal-yellow shadow-hard hover:scale-110 transition-transform"
          >
            <MessageCircleQuestion size={28} />
          </button>
      </div>

      {/* AI Modal (Auth View) - Chat Interface */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-[#1a1a2e] border-4 border-black shadow-hard flex flex-col max-h-[85vh] sm:max-h-[70vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b-4 border-black bg-black">
              <h3 className="font-display font-bold text-lg uppercase text-white">{t('assistant.title')}</h3>
              <button 
                onClick={() => setIsAiOpen(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Chat Messages Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-brutal-yellow/20 border-2 border-brutal-yellow flex items-center justify-center">
                    <MessageCircleQuestion size={24} className="text-brutal-yellow" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {lang === 'vi' ? 'Xin chào! Tôi có thể giúp gì cho bạn?' : 'Hello! How can I help you?'}
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-brutal-yellow text-black border-2 border-black' 
                        : 'bg-white/10 text-white border-2 border-white/20'
                    }`}>
                      <div className="whitespace-pre-wrap">{parseMarkdown(msg.content)}</div>
                    </div>
                  </div>
                ))
              )}
              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border-2 border-white/20 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-brutal-yellow rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-brutal-yellow rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-2 h-2 bg-brutal-yellow rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </div>
                      <span className="text-xs text-gray-400">{lang === 'vi' ? 'Đang trả lời...' : 'Typing...'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-3 border-t-4 border-black bg-black/50">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lang === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...'}
                  className="flex-1 bg-white/10 border-2 border-white/20 p-3 text-white text-sm focus:outline-none focus:border-brutal-yellow placeholder-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleAiAsk()}
                  disabled={loading}
                />
                <button 
                  onClick={handleAiAsk}
                  disabled={loading || !query.trim()}
                  className="bg-brutal-yellow border-2 border-black px-4 font-bold uppercase text-sm text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {lang === 'vi' ? 'Gửi' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
