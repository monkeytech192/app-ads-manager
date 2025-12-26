import React, { useState } from 'react';
import { DollarSign, Eye, MousePointer2, TrendingUp, Activity, LogOut } from 'lucide-react';
import { BrutalistCard, BrutalistHeader } from '../shared/UIComponents';
import BottomNav from '../shared/BottomNav';
import { ScreenView, FacebookUserProfile } from '../types';

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

const BarChart = () => {
  const data = [
    { m: 'Jan', c: 60, p: 20 },
    { m: 'Feb', c: 70, p: 25 },
    { m: 'Mar', c: 65, p: 35 },
    { m: 'Apr', c: 80, p: 30 },
    { m: 'May', c: 85, p: 40 },
    { m: 'Jun', c: 90, p: 50 },
    { m: 'Jul', c: 95, p: 60 },
    { m: 'Aug', c: 98, p: 55 },
    { m: 'Sep', c: 70, p: 80 },
    { m: 'Oct', c: 75, p: 60 },
    { m: 'Nov', c: 85, p: 90 },
    { m: 'Dec', c: 60, p: 95 },
  ];

  return (
    <div className="h-48 sm:h-56 w-full flex items-end justify-between gap-1 pt-6 pb-2 px-1 relative">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-30">
         <div className="border-t border-black w-full h-0"></div>
         <div className="border-t border-black w-full h-0"></div>
         <div className="border-t border-black w-full h-0"></div>
         <div className="border-t border-black w-full h-0"></div>
      </div>
      
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-0.5 w-full h-full justify-end z-10 group relative">
           {item.m === 'Mar' && (
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 py-0.5 whitespace-nowrap font-bold">
               Cost: 3 UND
             </div>
           )}
           {item.m === 'Nov' && (
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 py-0.5 whitespace-nowrap font-bold">
               Profit: 2 UND
             </div>
           )}

          <div className="flex items-end gap-[1px] w-full justify-center h-full">
            <div style={{ height: `${item.c}%` }} className="w-1.5 sm:w-2 bg-black"></div>
            <div style={{ height: `${item.p}%` }} className="w-1.5 sm:w-2 bg-red-600 border border-black border-b-0"></div>
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase rotate-0">{item.m}</span>
        </div>
      ))}
    </div>
  );
};

const AdSetCard = ({ title, budget, clicks, ctr }: any) => (
  <div className="relative mb-4 last:mb-0">
    <div className="absolute top-1 left-1 w-full h-full bg-black rounded-sm z-0"></div>
    <div className="relative bg-[#f5f5f4] border-4 border-black p-3 z-10 flex flex-col gap-2">
      <h3 className="font-display font-bold text-xl uppercase truncate">{title}</h3>
      <div className="flex justify-between items-end">
         <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
            <div>
               <p className="text-gray-500 text-xs">Tổng Ngân sách</p>
               <p className="font-bold">{budget}</p>
            </div>
            <div>
               <p className="text-gray-500 text-xs">Số lần nhấp</p>
               <p className="font-bold">{clicks}</p>
            </div>
            <div>
               <p className="text-gray-500 text-xs">CTR</p>
               <p className="font-bold">{ctr}</p>
            </div>
         </div>
         <button className="bg-blue-600 text-white border-2 border-black font-bold uppercase text-sm py-1 px-4 hover:bg-blue-700 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
            XEM
         </button>
      </div>
    </div>
  </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onBack, onNavigate, userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Use FB data if available, else fallback image
  const avatarUrl = userProfile?.picture?.data?.url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80";
  const userName = userProfile?.name || "Admin User";

  // Avatar Component
  const UserAvatar = () => (
    <div className="relative">
        <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 border-2 border-black rounded-full overflow-hidden focus:outline-none hover:opacity-90 transition-opacity bg-gray-300"
        >
            <img 
                src={avatarUrl} 
                alt={userName} 
                className="w-full h-full object-cover"
            />
        </button>

        {isMenuOpen && (
            <>
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute right-0 top-12 z-50 w-56 bg-white border-4 border-black shadow-hard p-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b-2 border-black mb-1">
                        <p className="text-xs font-bold text-gray-500">ĐĂNG NHẬP LÀ</p>
                        <p className="font-display font-bold text-lg truncate">{userName}</p>
                    </div>
                    <button 
                        onClick={onBack} // Logout action
                        className="w-full text-left px-4 py-2 font-bold hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                    >
                        <LogOut size={18} />
                        ĐĂNG XUẤT
                    </button>
                </div>
            </>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full"> 
      
      <BrutalistHeader 
        title="Tổng quan Chiến dịch" 
        onBack={() => {}} 
        showBack={false} 
        rightElement={<UserAvatar />}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-4 space-y-6">
        
        <BrutalistCard variant="yellow" className="relative !p-3 sm:!p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[repeating-linear-gradient(45deg,black,black_10px,yellow_10px,yellow_20px)] border-l-4 border-b-4 border-black z-0 opacity-20"></div>
          
          <h2 className="font-display font-bold text-xl mb-3 border-b-4 border-black inline-block bg-white px-2">
            HIỆU SUẤT CHÍNH
          </h2>

          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2 sm:col-span-1">
                <StatBox 
                    label="Tổng Ngân sách:" 
                    value="50,000,000 VND" 
                    icon={DollarSign} 
                />
             </div>
             <div className="col-span-2 sm:col-span-1">
                <StatBox 
                    label="Số lượt hiển thị:" 
                    value="1,200,000" 
                    icon={Eye} 
                />
             </div>
             
             <div className="col-span-2 grid grid-cols-3 gap-3">
                <StatBox label="Số lần nhấp:" value="85,000" icon={MousePointer2} />
                <StatBox label="CTR:" value="7.08%" icon={TrendingUp} />
                <StatBox label="ROI:" value="150%" icon={Activity} />
             </div>
          </div>
        </BrutalistCard>

        <BrutalistCard variant="white" className="!p-3 sm:!p-5">
           <h2 className="font-display font-bold text-xl mb-1 border-b-4 border-black inline-block bg-[#e5e5e5] px-2">
            BIỂU ĐỒ CHI PHÍ vs. LỢI NHUẬN
          </h2>
          <BarChart />
        </BrutalistCard>

        <div>
            <h2 className="font-display font-bold text-xl mb-3 uppercase pl-1">
                Thống kê nhóm quảng cáo
            </h2>
            <div className="space-y-4 pb-4">
                <AdSetCard 
                    title="Nhóm 1: Target Tuổi 18-24" 
                    budget="50,000,000 VND" 
                    clicks="85,000" 
                    ctr="7.08%" 
                />
                 <AdSetCard 
                    title="Nhóm 2: Target Tuổi 25-34" 
                    budget="35,000,000 VND" 
                    clicks="42,000" 
                    ctr="12.5%" 
                />
                 <AdSetCard 
                    title="Nhóm 3: Remarketing" 
                    budget="10,000,000 VND" 
                    clicks="15,000" 
                    ctr="18.2%" 
                />
            </div>
        </div>

      </div>

      <BottomNav currentView="dashboard" onNavigate={onNavigate} />

    </div>
  );
};

export default DashboardScreen;
