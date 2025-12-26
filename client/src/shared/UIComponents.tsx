import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { BrutalistButtonProps, BrutalistCardProps, BrutalistInputProps } from '../types';

export const BrutalistCard: React.FC<BrutalistCardProps> = ({ children, className = '', variant = 'white' }) => {
  const bgColors = {
    white: 'bg-white',
    gray: 'bg-[#d1d5db]',
    yellow: 'bg-brutal-yellow',
    red: 'bg-[#EF4444]',
    blue: 'bg-[#3B82F6]',
    black: 'bg-black text-white',
    dark: 'bg-[#1e293b] text-white',
  };

  return (
    <div className={`border-4 border-black p-4 sm:p-6 ${bgColors[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  fullWidth = false, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-brutal-yellow text-black hover:bg-yellow-400',
    yellow: 'bg-brutal-yellow text-black hover:bg-yellow-400',
    facebook: 'bg-[#1877F2] text-white hover:bg-blue-600',
    black: 'bg-black text-white hover:bg-gray-900',
    blue: 'bg-[#2563EB] text-white hover:bg-blue-700',
    red: 'bg-[#DC2626] text-white hover:bg-red-700',
    orange: 'bg-brutal-yellow text-black hover:bg-yellow-400',
    gray: 'bg-gray-400 text-black hover:bg-gray-500',
    'dark-outline': 'bg-transparent text-white border-white hover:bg-white/10',
  };

  const borderClass = variant === 'dark-outline' ? 'border-4 border-white' : 'border-4 border-black';

  return (
    <button 
      className={`
        ${variants[variant]} 
        ${borderClass}
        font-display font-bold uppercase tracking-wider text-lg sm:text-xl
        py-2 px-4 
        shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm transition-all
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const BrutalistInput: React.FC<BrutalistInputProps> = ({ className = '', type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative w-full">
      <input 
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        className={`
          w-full bg-[#c0c0c0] 
          border-4 border-black 
          p-3 sm:p-4 
          font-mono text-lg placeholder-black/60 text-black
          focus:outline-none focus:bg-white transition-colors
          ${isPassword ? 'pr-12' : ''}
          ${className}
        `}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:opacity-70 focus:outline-none"
        >
          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      )}
    </div>
  );
};

export const BrutalistToggle: React.FC<{ checked: boolean; onChange: () => void; labelOn?: string; labelOff?: string }> = ({ checked, onChange, labelOn="ON", labelOff="OFF" }) => (
  <div 
    onClick={onChange}
    className={`
      cursor-pointer flex items-center justify-between w-24 h-10 border-4 border-black p-1 relative transition-colors
      ${checked ? 'bg-[#22c55e]' : 'bg-brutal-yellow'} 
    `}
  >
    <span className={`font-bold text-xs z-10 ml-1 ${checked ? 'text-black' : 'opacity-0'}`}>{labelOn}</span>
    <span className={`font-bold text-xs z-10 mr-1 ${!checked ? 'text-black' : 'opacity-0'}`}>{labelOff}</span>
    
    <div className={`
      absolute top-0.5 bottom-0.5 w-8 bg-white border-2 border-black transition-all duration-200
      ${checked ? 'left-[calc(100%-2.25rem)]' : 'left-0.5'}
    `}></div>
  </div>
);

export const BrutalistSlider: React.FC<{ value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number }> = (props) => (
  <div className="relative w-full h-8 flex items-center">
    <input 
      type="range" 
      {...props}
      className="w-full appearance-none h-4 border-4 border-black bg-white rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-[#a8a29e] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer"
    />
  </div>
);

export const BrutalistSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', ...props }) => (
  <div className="relative">
    <select 
      className={`
        w-full appearance-none bg-white border-4 border-black p-2 font-bold font-mono text-sm
        focus:outline-none focus:bg-yellow-50
        ${className}
      `}
      {...props}
    />
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-[8px] border-t-black border-x-[6px] border-x-transparent"></div>
  </div>
);

interface BrutalistHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  variant?: 'light' | 'dark' | 'yellow';
}

export const BrutalistHeader: React.FC<BrutalistHeaderProps> = ({ title, onBack, showBack = true, rightElement, variant = 'light' }) => {
  const styles = {
    light: {
      container: 'bg-[#f5f5f4] border-black text-black',
      btn: 'bg-white border-black text-black hover:bg-gray-200 shadow-hard-sm',
      iconColor: 'black'
    },
    dark: {
      container: 'bg-[#0f172a] border-white/20 text-white',
      btn: 'bg-transparent border-white text-white hover:bg-white/10',
      iconColor: 'white'
    },
    yellow: {
      container: 'bg-brutal-yellow border-black text-black',
      btn: 'bg-white border-black text-black hover:bg-orange-300 shadow-hard-sm',
      iconColor: 'black'
    }
  };

  const currentStyle = styles[variant];

  return (
    <div className={`${currentStyle.container} border-b-4 p-3 flex justify-between items-center sticky top-0 z-50 transition-colors`}>
      {showBack && onBack ? (
        <button onClick={onBack} className={`border-2 p-1 transition-all active:scale-95 ${currentStyle.btn}`}>
            <ArrowLeft size={24} strokeWidth={3} />
        </button>
      ) : (
        <div className="w-9" /> /* Spacer if no back button */
      )}
      
      <h1 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tighter mx-2 text-center flex-1 leading-none truncate">
        {title}
      </h1>
      
      <div className="w-9 flex justify-center items-center">
        {rightElement || <div className="w-8" />} 
      </div>
    </div>
  );
};

export const TextureOverlay = () => (
  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] z-10" />
);
