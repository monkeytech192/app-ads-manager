import React, { useState, useEffect } from 'react';
import { Facebook, Globe, MessageCircleQuestion, X, UserPlus, LogIn, CheckSquare, Square } from 'lucide-react';
import { BrutalistCard, BrutalistButton, BrutalistInput, TextureOverlay } from './shared/UIComponents';
import { askAssistant } from './services/geminiService';
import { initFacebookSdk, loginWithFacebook, getFacebookUserProfile } from './services/facebookService';
import DashboardScreen from './screens/Dashboard';
import ManagementScreen from './screens/QuanLyChienDich';
import ComparisonScreen from './screens/SoSanhChienDich';
import SettingsScreen from './screens/CaiDat';
import RecommendationsScreen from './screens/DeXuat';
import CampaignDetailScreen from './screens/ChiTietChienDich';
import { ScreenView, CampaignData, AccountData, FacebookUserProfile } from './types';

const App = () => {
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
  
  const [accounts, setAccounts] = useState<AccountData[]>([
      { id: 'acc1', name: 'Tài khoản 1: Ad Account A', status: 'active', isSelected: false },
      { id: 'acc2', name: 'Tài khoản 2: Ad Account B', status: 'paused', isSelected: false },
  ]);

  const [campaigns, setCampaigns] = useState<CampaignData[]>([
    {
      id: '1',
      accountId: 'acc1',
      title: 'Chiến dịch: Mùa Hè Sale',
      status: 'active',
      budget: '50,000,000 VND',
      objective: 'DOANH SỐ',
      progress: 60,
      spent: '30,000,000 VND',
      impressions: '850.5K',
      results: '1,200',
      costPerResult: '25,000đ'
    },
    {
      id: '2',
      accountId: 'acc2',
      title: 'Chiến dịch: Tết 2025',
      status: 'paused',
      budget: '20,000,000 VND',
      objective: 'TƯƠNG TÁC',
      progress: 30,
      spent: '6,000,000 VND',
      impressions: '200.1K',
      results: '5,000',
      costPerResult: '1,200đ'
    }
  ]);

  // Init Facebook SDK on mount
  useEffect(() => {
    initFacebookSdk().then(() => {
        console.log("FB SDK Initialized");
    });
  }, []);

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
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAiAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const result = await askAssistant(query);
      setResponse(result);
    } catch (e) {
      setResponse("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = () => {
    // In a real app, validate credentials here
    setCurrentView('dashboard');
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
        await loginWithFacebook();
        const profile = await getFacebookUserProfile();
        setUserProfile(profile);
        setCurrentView('dashboard');
    } catch (error) {
        console.error("Facebook Login Error:", error);
        alert("Đăng nhập Facebook thất bại hoặc đã bị hủy.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = () => {
     // In a real app, perform registration logic here
     if(regPassword !== regConfirmPassword) {
         alert("Mật khẩu không khớp!");
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
                onNavigateToRecommendations={() => setCurrentView('recommendations')}
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
      case 'recommendations':
        return <RecommendationsScreen onNavigate={setCurrentView} onBack={() => setCurrentView('campaignDetail')} />;
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
                >
                    <MessageCircleQuestion size={24} />
                </button>
             </div>

              {/* Shared AI Modal - Centered in viewport */}
              {isAiOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="w-full max-w-sm bg-white border-4 border-black shadow-hard p-4 relative animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => setIsAiOpen(false)}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <h3 className="font-display font-bold text-2xl mb-4 uppercase">Trợ lý AI</h3>
                    <div className="bg-gray-100 border-2 border-black p-3 h-48 overflow-y-auto mb-4 font-mono text-sm">
                      {response ? (
                        <p>{response}</p>
                      ) : (
                        <p className="text-gray-500 italic">Tôi có thể giúp gì cho bạn?</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Hỏi trợ lý..."
                        className="flex-1 border-2 border-black p-2 font-mono text-sm focus:outline-none focus:bg-yellow-50"
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                      />
                      <button 
                        onClick={handleAiAsk}
                        disabled={loading}
                        className="bg-brutal-yellow border-2 border-black px-4 font-bold uppercase text-sm hover:bg-yellow-400 disabled:opacity-50"
                      >
                        {loading ? '...' : 'Gửi'}
                      </button>
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
              Quản Lý Ads FB
            </h1>
          </div>
          <div className="bg-brutal-yellow border-2 border-black px-2 flex items-center gap-1 font-bold text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-y-0.5 hover:shadow-none transition-all">
            <span>Tiếng Việt</span>
            <Globe size={16} />
          </div>
        </div>

        {currentView === 'login' ? (
            /* LOGIN VIEW */
            <>
                <BrutalistCard variant="white" className="relative group z-20">
                <h2 className="font-display font-bold text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tight mb-4">
                    Kết nối dữ liệu <br/> quảng cáo.
                </h2>
                <p className="text-sm mb-4 border-l-4 border-black pl-3 py-2 bg-gray-100">
                    <strong>Hỗ trợ cả 2 loại tài khoản:</strong><br/>
                    ✓ Facebook cá nhân có Ads Manager<br/>
                    ✓ Facebook Business Account
                </p>
                <BrutalistButton variant="facebook" fullWidth onClick={handleFacebookLogin} disabled={isLoading}>
                    <Facebook fill="white" size={24} />
                    {isLoading ? 'Đang kết nối...' : 'Kết nối với Facebook'}
                </BrutalistButton>
                </BrutalistCard>

                <BrutalistCard variant="gray" className="space-y-4 relative z-20">
                    <div className="space-y-4 pt-2">
                        <BrutalistInput 
                            placeholder="Email hoặc số điện thoại" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <BrutalistInput 
                            type="password"
                            placeholder="Mật khẩu" 
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
                            <span className="font-bold text-sm uppercase select-none">Ghi nhớ đăng nhập</span>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3 justify-center">
                        <BrutalistButton variant="black" fullWidth onClick={handleEmailLogin}>
                           Đăng nhập Email
                        </BrutalistButton>
                        <div className="text-center">
                             <span className="font-bold text-sm">Chưa có tài khoản? </span>
                             <button 
                                onClick={() => setCurrentView('register')}
                                className="font-bold text-sm underline hover:text-blue-600 uppercase"
                             >
                                Đăng ký thủ công
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
                        Đăng ký tài khoản
                    </h2>
                    <p className="font-medium text-base mb-4">
                        Tạo tài khoản mới để quản lý chiến dịch hiệu quả hơn.
                    </p>
                    <BrutalistButton variant="facebook" fullWidth onClick={handleFacebookLogin} disabled={isLoading} className="!text-sm sm:!text-base">
                        <Facebook fill="white" size={20} />
                         {isLoading ? 'Đang kết nối...' : 'Đăng ký bằng Facebook'}
                    </BrutalistButton>
                </BrutalistCard>

                <BrutalistCard variant="gray" className="space-y-4 relative z-20">
                    <div className="space-y-3 pt-2">
                         <BrutalistInput 
                            placeholder="Họ và tên" 
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                        <BrutalistInput 
                            placeholder="Email của bạn" 
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                        <BrutalistInput 
                            type="password"
                            placeholder="Mật khẩu" 
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                         <BrutalistInput 
                            type="password"
                            placeholder="Xác nhận mật khẩu" 
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2 flex flex-col gap-3 justify-center">
                        <BrutalistButton variant="black" fullWidth onClick={handleRegister}>
                           <UserPlus size={20} /> Đăng ký ngay
                        </BrutalistButton>
                         <div className="text-center">
                             <span className="font-bold text-sm">Đã có tài khoản? </span>
                             <button 
                                onClick={() => setCurrentView('login')}
                                className="font-bold text-sm underline hover:text-blue-600 uppercase"
                             >
                                Đăng nhập
                             </button>
                        </div>
                    </div>
                </BrutalistCard>
            </>
        )}

        {/* Footer Disclaimer */}
        <BrutalistCard variant="white" className="py-3 px-4 text-sm font-medium border-4 border-black z-20">
            Bằng cách tiếp tục, bạn đồng ý với <a href="#" className="underline decoration-2">Điều khoản</a> & <a href="#" className="underline decoration-2">Chính sách</a>.
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

      {/* AI Modal (Auth View) */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border-4 border-black shadow-hard p-4 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAiOpen(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="font-display font-bold text-2xl mb-4 uppercase">Trợ lý AI</h3>
            
            <div className="bg-gray-100 border-2 border-black p-3 h-48 overflow-y-auto mb-4 font-mono text-sm">
              {response ? (
                <p>{response}</p>
              ) : (
                <p className="text-gray-500 italic">Tôi có thể giúp gì cho bạn về việc đăng nhập hoặc kết nối?</p>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hỏi trợ lý..."
                className="flex-1 border-2 border-black p-2 font-mono text-sm focus:outline-none focus:bg-yellow-50"
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              />
              <button 
                onClick={handleAiAsk}
                disabled={loading}
                className="bg-brutal-yellow border-2 border-black px-4 font-bold uppercase text-sm hover:bg-yellow-400 disabled:opacity-50"
              >
                {loading ? '...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
