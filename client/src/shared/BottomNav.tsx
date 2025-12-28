import React from 'react';
import { Home, Megaphone, TrendingUp, Settings } from 'lucide-react';
import { ScreenView } from '../types';
import { useTranslation } from '../services/i18n';

interface BottomNavProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'dashboard', labelKey: 'nav.dashboard' as const, icon: Home },
    { id: 'management', labelKey: 'nav.management' as const, icon: Megaphone },
    { id: 'comparison', labelKey: 'nav.comparison' as const, icon: TrendingUp },
    { id: 'settings', labelKey: 'nav.settings' as const, icon: Settings },
  ];

  return (
    <div className="w-full bg-[#f5f5f4] border-t-4 border-black grid grid-cols-4 py-2 z-50 shadow-[0_-4px_0_rgba(0,0,0,0.1)] shrink-0">
      {navItems.map((item) => {
        // Active state logic
        const isActive = currentView === item.id || (item.id === 'management' && currentView === 'recommendations');
        const Icon = item.icon;
        
        return (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id as ScreenView)}
            className={`flex flex-col items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          >
            {isActive ? (
               <div className="bg-black text-white p-1 rounded-sm border-2 border-transparent">
                  <Icon size={24} />
               </div>
            ) : (
               <Icon size={24} />
            )}
            <span className="font-bold text-xs uppercase">{t(item.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;