import React from 'react';
import { RotateCcw } from 'lucide-react';
import { BrutalistButton, BrutalistCard, BrutalistSelect, BrutalistHeader } from './BrutalistComponents';
import BottomNav from './BottomNav';
import { ScreenView } from '../types';

interface ComparisonScreenProps {
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
      
      <BrutalistHeader 
        title="SO SÁNH HIỆU SUẤT" 
        onBack={onBack} 
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
        
        {/* Campaign Selectors */}
        <div className="bg-[#dedcdb] border-4 border-black p-3 shadow-hard">
            <h3 className="font-bold mb-2 uppercase">Chọn chiến dịch</h3>
            <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="font-bold text-xs block mb-1">CHIẾN DỊCH A</label>
                   <BrutalistSelect defaultValue="summer">
                      <option value="summer">FB_ADS_SUMMER_SALE</option>
                      <option value="winter">FB_ADS_WINTER_PROMO</option>
                   </BrutalistSelect>
                </div>
                <div>
                   <label className="font-bold text-xs block mb-1">CHIẾN DỊCH B</label>
                   <BrutalistSelect defaultValue="winter">
                      <option value="summer">FB_ADS_SUMMER_SALE</option>
                      <option value="winter">FB_ADS_WINTER_PROMO</option>
                   </BrutalistSelect>
                </div>
            </div>
        </div>

        {/* Chart Area */}
        <BrutalistCard variant="gray" className="!p-0">
             <div className="border-b-4 border-black p-2 bg-[#d6d3d1]">
                <h3 className="font-display font-bold text-xl">HIỆU SUẤT CHI PHÍ (VNĐ)</h3>
             </div>
             <div className="h-48 relative bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] p-4">
                 {/* Custom SVG Line Chart */}
                 <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="black" strokeWidth="0.2" opacity="0.3" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="black" strokeWidth="0.2" opacity="0.3" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="black" strokeWidth="0.5" />
                    
                    {/* Vertical Lines */}
                    <line x1="0" y1="0" x2="0" y2="50" stroke="black" strokeWidth="0.5" />
                    <line x1="33" y1="0" x2="33" y2="50" stroke="black" strokeWidth="0.2" opacity="0.3" />
                    <line x1="66" y1="0" x2="66" y2="50" stroke="black" strokeWidth="0.2" opacity="0.3" />
                    <line x1="100" y1="0" x2="100" y2="50" stroke="black" strokeWidth="0.5" />

                    {/* Blue Line (Campaign A) */}
                    <polyline 
                        points="5,45 33,15 66,35 95,5" 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                     {/* Orange Line (Campaign B) */}
                     <polyline 
                        points="5,35 33,40 66,15 95,30" 
                        fill="none" 
                        stroke="#EA580C" 
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                 </svg>
                 <div className="flex justify-between mt-1 text-xs font-bold font-mono">
                     <span>TUẦN 1</span>
                     <span>TUẦN 2</span>
                     <span>TUẦN 3</span>
                     <span>TUẦN 4</span>
                 </div>
             </div>
        </BrutalistCard>

        {/* Data Table */}
        <div className="border-4 border-black bg-[#e5e5e5]">
            <div className="grid grid-cols-3 border-b-4 border-black bg-[#d6d3d1]">
                <div className="p-2 font-bold text-xs sm:text-sm border-r-2 border-black">METRIC</div>
                <div className="p-2 font-bold text-xs sm:text-sm border-r-2 border-black text-center text-blue-700">CHIẾN DỊCH A</div>
                <div className="p-2 font-bold text-xs sm:text-sm text-center text-orange-600">CHIẾN DỊCH B</div>
            </div>
            
            {[
                { label: 'CHI TIÊU', a: '12.5M', b: '15.2M' },
                { label: 'LƯỢT HIỂN THỊ', a: '450K', b: '520K' },
                { label: 'NHẤP CHUỘT', a: '8.5K', b: '9.8K' },
                { label: 'CTR (%)', a: '1.89%', b: '1.88%' },
                { label: 'CPC (VNĐ)', a: '1,470', b: '1,550' },
                { label: 'CHUYỂN ĐỔI', a: '320', b: '380' },
            ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 border-b-2 border-black last:border-b-0">
                    <div className="p-2 font-bold text-xs sm:text-sm border-r-2 border-black uppercase">{row.label}</div>
                    <div className="p-2 font-mono font-bold text-xs sm:text-sm border-r-2 border-black text-center">{row.a}</div>
                    <div className="p-2 font-mono font-bold text-xs sm:text-sm text-center">{row.b}</div>
                </div>
            ))}
        </div>

        <BrutalistButton variant="yellow" fullWidth className="!flex !items-center !justify-center !gap-2">
            LÀM MỚI SO SÁNH <RotateCcw size={20} />
        </BrutalistButton>

      </div>

      <BottomNav currentView="comparison" onNavigate={onNavigate} />
    </div>
  );
};

export default ComparisonScreen;