import React from 'react';
import { User, ArrowUpCircle, Users, Image as ImageIcon } from 'lucide-react';
import { BrutalistCard, BrutalistButton, BrutalistHeader } from '../shared/UIComponents';
import { ScreenView } from '../types';

interface RecommendationsScreenProps {
  onNavigate: (view: ScreenView) => void;
  onBack: () => void;
}

const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ onNavigate, onBack }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"> 
      
      <BrutalistHeader 
        title="ĐỀ XUẤT & HÀNH ĐỘNG" 
        onBack={onBack}
        variant="yellow" // Using yellow variant here to match original design, but structure is standardized
        rightElement={
             <div className="bg-black text-white rounded-full p-1">
                <User size={24} />
             </div>
        }
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 space-y-4">
        
        {/* Breadcrumb Context */}
        <div className="bg-white border-2 border-black p-2 font-bold text-sm uppercase mb-2">
            CHIẾN DỊCH: MÙA HÈ SALE
        </div>

        {/* Card 1: Red - Increase Budget */}
        <BrutalistCard variant="red" className="relative !p-4 shadow-hard">
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-none max-w-[80%]">
                    Tăng ngân sách cho "Chiến dịch Mùa Hè"
                </h2>
                <ArrowUpCircle size={40} strokeWidth={1.5} className="text-black" />
            </div>
            <p className="font-medium text-black text-sm sm:text-base mb-4 leading-tight">
                Hiệu suất tốt, CPC thấp. Đề xuất tăng 20% để tối đa hóa chuyển đổi.
            </p>
            <BrutalistButton variant="blue" fullWidth className="!shadow-[4px_4px_0px_0px_white]">
                TĂNG NGÂN SÁCH NGAY
            </BrutalistButton>
        </BrutalistCard>

        {/* Card 2: Blue - Expand Audience */}
        <BrutalistCard variant="blue" className="relative !p-4 shadow-hard">
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-none max-w-[80%]">
                    Mở rộng đối tượng "Nhóm Gen Z"
                </h2>
                 <div className="relative">
                    <Users size={40} strokeWidth={1.5} className="text-black" />
                 </div>
            </div>
            <p className="font-medium text-black text-sm sm:text-base mb-4 leading-tight">
                Tỷ lệ tương tác cao. Thêm sở thích mới để tiếp cận nhiều hơn.
            </p>
            <BrutalistButton variant="yellow" fullWidth className="!shadow-[4px_4px_0px_0px_black]">
                THAY ĐỔI ĐỐI TƯỢNG
            </BrutalistButton>
        </BrutalistCard>

         {/* Card 3: Yellow - Optimize Image */}
         <BrutalistCard variant="yellow" className="relative !p-4 shadow-hard">
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-none max-w-[80%]">
                    Tối ưu hình ảnh "Banner Khuyến mãi"
                </h2>
                <ImageIcon size={40} strokeWidth={1.5} className="text-black" />
            </div>
            <p className="font-medium text-black text-sm sm:text-base mb-4 leading-tight">
                Tỷ lệ nhấp thấp. Thử nghiệm biến thể hình ảnh mới để cải thiện CTR.
            </p>
            <BrutalistButton variant="red" fullWidth className="!shadow-[4px_4px_0px_0px_black] !bg-[#DC2626]">
                TẠO BIẾN THỂ MỚI
            </BrutalistButton>
        </BrutalistCard>

      </div>
    </div>
  );
};

export default RecommendationsScreen;
