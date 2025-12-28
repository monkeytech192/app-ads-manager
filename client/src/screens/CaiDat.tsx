import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BrutalistButton, BrutalistToggle, BrutalistSlider, BrutalistHeader } from '../shared/UIComponents';
import BottomNav from '../shared/BottomNav';
import { ScreenView } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigate }) => {
  const [alerts, setAlerts] = useState({ cost: true, ctr: false });
  const [dailyBudget, setDailyBudget] = useState(500000);
  const [lifetimeBudget, setLifetimeBudget] = useState(15000000);
  
  // Currency settings
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currencySettings');
    return saved ? JSON.parse(saved).currency : 'VND';
  });
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('currencySettings');
    return saved ? JSON.parse(saved).rate : 25000;
  });

  // Save currency settings to localStorage
  const saveCurrencySettings = () => {
    const settings = {
      currency,
      rate: exchangeRate
    };
    localStorage.setItem('currencySettings', JSON.stringify(settings));
    alert('Đã lưu cài đặt tiền tệ!');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f5f5f4] bg-[url('https://www.transparenttextures.com/patterns/dust.png')]">
      
      <BrutalistHeader 
        title="Cài đặt & Ngân sách" 
        onBack={onBack} 
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-8">
        
        {/* Section 1: Alerts */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">THIẾT LẬP CẢNH BÁO</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <BrutalistToggle 
                        checked={alerts.cost} 
                        onChange={() => setAlerts(prev => ({...prev, cost: !prev.cost}))} 
                    />
                    <span className="font-bold text-lg leading-tight">Chi phí tăng đột biến ({'>'}20%)</span>
                </div>
                <div className="flex items-center gap-4">
                    <BrutalistToggle 
                        checked={alerts.ctr} 
                        onChange={() => setAlerts(prev => ({...prev, ctr: !prev.ctr}))}
                        labelOn="ON"
                        labelOff="OFF"
                    />
                    <span className="font-bold text-lg leading-tight">CTR giảm ({'<'}1%)</span>
                </div>
            </div>

            <button className="mt-6 w-full border-4 border-black bg-white py-3 flex items-center justify-center gap-2 font-bold shadow-hard hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all">
                <Plus size={24} strokeWidth={3} />
                THÊM CẢNH BÁO TÙY CHỈNH
            </button>
        </div>

        <hr className="border-2 border-black" />

        {/* Section 2: Currency */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">CÀI ĐẶT TIỀN TỆ</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="font-bold text-lg block mb-2">Đơn vị tiền tệ hiển thị</label>
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
                        <label className="font-bold text-lg block mb-2">Tỷ giá quy đổi (1 USD = ? VNĐ)</label>
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
                            <strong>Ví dụ:</strong> Facebook hiển thị $61 → Sẽ hiển thị {(61 * exchangeRate).toLocaleString('vi-VN')} VNĐ
                        </p>
                    </div>
                )}

                <BrutalistButton 
                    variant="green" 
                    fullWidth
                    onClick={saveCurrencySettings}
                >
                    LƯU CÀI ĐẶT TIỀN TỆ
                </BrutalistButton>
            </div>
        </div>

        <hr className="border-2 border-black" />

        {/* Section 3: Budget */}
        <div>
            <h2 className="font-display font-bold text-2xl uppercase mb-4">QUẢN LÝ NGÂN SÁCH</h2>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-lg">Ngân sách hàng ngày</label>
                        <div className="border-2 border-black bg-white px-2 py-1 font-mono font-bold">
                            {dailyBudget.toLocaleString()} VND
                        </div>
                    </div>
                    <BrutalistSlider 
                        value={dailyBudget} 
                        min={100000} 
                        max={5000000} 
                        step={50000}
                        onChange={(e) => setDailyBudget(Number(e.target.value))} 
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-lg">Ngân sách trọn đời</label>
                         <div className="border-2 border-black bg-white px-2 py-1 font-mono font-bold">
                            {lifetimeBudget.toLocaleString()} VND
                        </div>
                    </div>
                    <BrutalistSlider 
                        value={lifetimeBudget} 
                        min={1000000} 
                        max={100000000} 
                        step={1000000}
                        onChange={(e) => setLifetimeBudget(Number(e.target.value))} 
                    />
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 pb-4">
             <BrutalistButton variant="gray" className="!bg-[#a8a29e]">
                HỦY BỎ
             </BrutalistButton>
             <BrutalistButton variant="orange" className="!bg-[#f97316]">
                LƯU THAY ĐỔI
             </BrutalistButton>
        </div>

      </div>

      <BottomNav currentView="settings" onNavigate={onNavigate} />
    </div>
  );
};

export default SettingsScreen;
