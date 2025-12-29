import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { BrutalistButton, BrutalistToggle, BrutalistSlider, BrutalistHeader } from '../shared/UIComponents';
import BottomNav from '../shared/BottomNav';
import { ScreenView } from '../types';
import { useToast } from '../shared/Toast';
import { useTranslation, type Language } from '../services/i18n';
import { getAISettings, saveAISettings, maskApiKey } from '../utils/aiSettings';

// SVG Flag Components for reliable display
const VietnamFlag = () => (
  <svg width="24" height="16" viewBox="0 0 900 600" className="border border-black/20">
    <rect fill="#da251d" width="900" height="600"/>
    <polygon fill="#ffff00" points="450,120 526,356 310,217 590,217 374,356"/>
  </svg>
);

const USFlag = () => (
  <svg width="24" height="16" viewBox="0 0 7410 3900" className="border border-black/20">
    <rect fill="#bf0a30" width="7410" height="3900"/>
    <rect fill="#fff" y="300" width="7410" height="300"/>
    <rect fill="#fff" y="900" width="7410" height="300"/>
    <rect fill="#fff" y="1500" width="7410" height="300"/>
    <rect fill="#fff" y="2100" width="7410" height="300"/>
    <rect fill="#fff" y="2700" width="7410" height="300"/>
    <rect fill="#fff" y="3300" width="7410" height="300"/>
    <rect fill="#002868" width="2964" height="2100"/>
  </svg>
);

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigate }) => {
  const [alerts, setAlerts] = useState({ cost: true, ctr: false });
  const { showToast } = useToast();
  const { t, lang, setLang } = useTranslation();
  
  // Currency settings
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currencySettings');
    return saved ? JSON.parse(saved).currency : 'VND';
  });
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('currencySettings');
    return saved ? JSON.parse(saved).rate : 25000;
  });

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(() => getAISettings().enabled);
  const [aiApiKey, setAiApiKey] = useState(() => getAISettings().apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  // Listen for AI settings changes from other components
  useEffect(() => {
    const handleAiSettingsChange = (e: CustomEvent) => {
      setAiEnabled(e.detail.enabled);
      setAiApiKey(e.detail.apiKey);
    };
    window.addEventListener('aiSettingsChanged', handleAiSettingsChange as EventListener);
    return () => window.removeEventListener('aiSettingsChanged', handleAiSettingsChange as EventListener);
  }, []);

  // Save currency settings to localStorage
  const saveCurrencySettings = () => {
    const settings = {
      currency,
      rate: exchangeRate
    };
    localStorage.setItem('currencySettings', JSON.stringify(settings));
    showToast(t('settings.savedCurrency'), 'success');
  };

  // Handle AI toggle
  const handleAiToggle = () => {
    const newEnabled = !aiEnabled;
    setAiEnabled(newEnabled);
    if (!newEnabled) {
      // If disabling, clear API key
      setAiApiKey('');
      saveAISettings({ enabled: false, apiKey: '' });
      showToast(lang === 'vi' ? 'Đã tắt AI' : 'AI disabled', 'info');
    } else {
      saveAISettings({ enabled: true, apiKey: aiApiKey });
      if (!aiApiKey) {
        showToast(lang === 'vi' ? 'Bật AI - Nhập API Key để sử dụng' : 'AI enabled - Enter API Key to use', 'info');
      }
    }
  };

  // Save AI API Key
  const saveAiApiKey = () => {
    if (!aiApiKey.trim()) {
      showToast(lang === 'vi' ? 'Vui lòng nhập API Key' : 'Please enter API Key', 'error');
      return;
    }
    saveAISettings({ enabled: aiEnabled, apiKey: aiApiKey.trim() });
    showToast(lang === 'vi' ? 'Đã lưu API Key' : 'API Key saved', 'success');
  };

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    showToast(t('settings.savedLanguage'), 'success');
  };

  return (
    <div className="flex flex-col h-full w-full bg-retro">
      
      <BrutalistHeader 
        title={t('settings.title')} 
        onBack={onBack} 
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-8">
        
        {/* Section 1: Language */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">{t('settings.language')}</h2>
            <div>
                <label className="font-bold text-lg block mb-2">{t('settings.selectLanguage')}</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleLanguageChange('vi')}
                        className={`border-4 border-black py-3 font-bold shadow-hard transition-all flex items-center justify-center gap-2 ${
                            lang === 'vi' ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <VietnamFlag /> {t('settings.vietnamese')}
                    </button>
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={`border-4 border-black py-3 font-bold shadow-hard transition-all flex items-center justify-center gap-2 ${
                            lang === 'en' ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <USFlag /> {t('settings.english')}
                    </button>
                </div>
            </div>
        </div>

        <hr className="border-2 border-black" />

        {/* Section 2: Alerts */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">{t('settings.alerts')}</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <BrutalistToggle 
                        checked={alerts.cost} 
                        onChange={() => setAlerts(prev => ({...prev, cost: !prev.cost}))} 
                    />
                    <span className="font-bold text-lg leading-tight">{t('settings.costSpike')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <BrutalistToggle 
                        checked={alerts.ctr} 
                        onChange={() => setAlerts(prev => ({...prev, ctr: !prev.ctr}))}
                        labelOn="ON"
                        labelOff="OFF"
                    />
                    <span className="font-bold text-lg leading-tight">{t('settings.ctrDrop')}</span>
                </div>
            </div>

            <button className="mt-6 w-full border-4 border-black bg-white py-3 flex items-center justify-center gap-2 font-bold shadow-hard hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all">
                <Plus size={24} strokeWidth={3} />
                {t('settings.addCustomAlert')}
            </button>
        </div>

        <hr className="border-2 border-black" />

        {/* Section 3: Currency */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">{t('settings.currency')}</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="font-bold text-lg block mb-2">{t('settings.displayCurrency')}</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setCurrency('VND')}
                            className={`border-4 border-black py-3 font-bold shadow-hard transition-all ${
                                currency === 'VND' ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                            VNĐ (₫)
                        </button>
                        <button
                            onClick={() => setCurrency('USD')}
                            className={`border-4 border-black py-3 font-bold shadow-hard transition-all ${
                                currency === 'USD' ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                            USD ($)
                        </button>
                    </div>
                </div>

                {currency === 'VND' && (
                    <div>
                        <label className="font-bold text-lg block mb-2">{t('settings.exchangeRate')}</label>
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 border-4 border-black bg-white px-3 py-2">
                                <input
                                    type="number"
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                                    className="w-full font-mono font-bold text-lg focus:outline-none"
                                    min="1000"
                                    max="50000"
                                    step="100"
                                />
                            </div>
                            <span className="font-bold">VNĐ</span>
                        </div>
                        <p className="text-sm mt-1 text-gray-700">
                            <strong>{t('settings.example')}:</strong> Facebook {lang === 'vi' ? 'hiển thị' : 'shows'} $61 → {lang === 'vi' ? 'Sẽ hiển thị' : 'Will display'} {(61 * exchangeRate).toLocaleString('vi-VN')} VNĐ
                        </p>
                    </div>
                )}

                <BrutalistButton 
                    variant="green" 
                    fullWidth
                    onClick={saveCurrencySettings}
                >
                    {t('settings.saveCurrency')}
                </BrutalistButton>
            </div>
        </div>

        <hr className="border-2 border-black" />

        {/* Section 4: AI Settings */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">
              {lang === 'vi' ? 'Trợ Lý AI' : 'AI Assistant'}
            </h2>
            
            <div className="space-y-4">
                {/* AI Toggle */}
                <div className="flex items-center gap-4">
                    <BrutalistToggle 
                        checked={aiEnabled} 
                        onChange={handleAiToggle}
                        labelOn="ON"
                        labelOff="OFF"
                    />
                    <span className="font-bold text-lg leading-tight">
                      {lang === 'vi' ? 'Sử dụng AI' : 'Use AI'}
                    </span>
                </div>
                
                {/* API Key input - only show when AI is enabled */}
                {aiEnabled && (
                    <div className="space-y-3 p-4 border-4 border-black bg-white shadow-hard">
                        <div>
                            <label className="font-bold text-sm block mb-2 uppercase">
                              OpenRouter API Key
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 border-4 border-black bg-white px-3 py-2 flex items-center">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        value={aiApiKey}
                                        onChange={(e) => setAiApiKey(e.target.value)}
                                        placeholder={lang === 'vi' ? 'Nhập API Key...' : 'Enter API Key...'}
                                        className="w-full font-mono text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="ml-2 text-gray-500 hover:text-black"
                                    >
                                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {aiApiKey && (
                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                    {lang === 'vi' ? 'Đã lưu' : 'Saved'}: {maskApiKey(aiApiKey)}
                                </p>
                            )}
                        </div>

                        <BrutalistButton 
                            variant="green" 
                            fullWidth
                            onClick={saveAiApiKey}
                        >
                            {lang === 'vi' ? 'Lưu API Key' : 'Save API Key'}
                        </BrutalistButton>

                        <div className="pt-2 border-t-2 border-black/20">
                            <a 
                                href="https://openrouter.ai/keys" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-bold"
                            >
                                <ExternalLink size={14} />
                                {lang === 'vi' ? 'Đăng ký API Key miễn phí tại OpenRouter' : 'Get free API Key at OpenRouter'}
                            </a>
                            <p className="text-xs text-gray-600 mt-1">
                                {lang === 'vi' 
                                    ? 'OpenRouter cung cấp nhiều model AI miễn phí. Đăng ký và tạo API key để sử dụng.'
                                    : 'OpenRouter provides free AI models. Sign up and create an API key to use.'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};

export default SettingsScreen;
