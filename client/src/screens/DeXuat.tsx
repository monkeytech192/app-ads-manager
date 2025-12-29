import React from 'react';
import { User, ArrowUpCircle, Users, Image as ImageIcon } from 'lucide-react';
import { BrutalistCard, BrutalistButton, BrutalistHeader } from '../shared/UIComponents';
import { ScreenView } from '../types';
import { useTranslation } from '../services/i18n';

interface RecommendationsScreenProps {
  onNavigate: (view: ScreenView) => void;
  onBack: () => void;
}

const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ onNavigate, onBack }) => {
  const { t, lang } = useTranslation();
  
  return (
    <div className="flex flex-col h-full w-full bg-retro"> 
      
      <BrutalistHeader 
        title={t('recommendations.title')} 
        onBack={onBack}
        variant="yellow"
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
            {t('recommendations.campaignContext')} {t('recommendations.summerSale')}
        </div>

        {/* Card 1: Red - Increase Budget */}
        <BrutalistCard variant="red" className="relative !p-4 shadow-hard">
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-none max-w-[80%]">
                    {t('recommendations.increaseBudget')}
                </h2>
                <ArrowUpCircle size={40} strokeWidth={1.5} className="text-black" />
            </div>
            <p className="font-medium text-black text-sm sm:text-base mb-4 leading-tight">
                {t('recommendations.increaseBudgetDesc')}
            </p>
            <BrutalistButton variant="blue" fullWidth className="!shadow-[4px_4px_0px_0px_white]">
                {t('recommendations.increaseBudgetBtn')}
            </BrutalistButton>
        </BrutalistCard>

        {/* Card 2: Blue - Expand Audience */}
        <BrutalistCard variant="blue" className="relative !p-4 shadow-hard">
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-none max-w-[80%]">
                    {t('recommendations.expandAudience')}
                </h2>
                 <div className="relative">
                    <Users size={40} strokeWidth={1.5} className="text-black" />
                 </div>
            </div>
            <p className="font-medium text-black text-sm sm:text-base mb-4 leading-tight">
                {t('recommendations.expandAudienceDesc')}
            </p>
            <BrutalistButton variant="yellow" fullWidth className="!shadow-[4px_4px_0px_0px_black]">
                {t('recommendations.expandAudienceBtn')}
            </BrutalistButton>
        </BrutalistCard>

         {/* Card 3: Yellow - Optimize Image */}
         <BrutalistCard variant="yellow" className="relative !p-4 shadow-hard">
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-none max-w-[80%]">
                    {t('recommendations.optimizeImage')}
                </h2>
                <ImageIcon size={40} strokeWidth={1.5} className="text-black" />
            </div>
            <p className="font-medium text-black text-sm sm:text-base mb-4 leading-tight">
                {t('recommendations.optimizeImageDesc')}
            </p>
            <BrutalistButton variant="red" fullWidth className="!shadow-[4px_4px_0px_0px_black] !bg-[#DC2626]">
                {t('recommendations.optimizeImageBtn')}
            </BrutalistButton>
        </BrutalistCard>

      </div>
    </div>
  );
};

export default RecommendationsScreen;
