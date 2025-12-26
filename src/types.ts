import React from 'react';

export interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'gray' | 'yellow' | 'red' | 'blue' | 'black' | 'dark';
}

export interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'facebook' | 'black' | 'blue' | 'red' | 'yellow' | 'orange' | 'dark-outline' | 'gray';
  fullWidth?: boolean;
}

export interface BrutalistInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export enum GeminiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AccountData {
    id: string;
    name: string;
    status: 'active' | 'paused';
    isSelected: boolean;
}

export interface CampaignData {
  id: string;
  accountId: string; // Added to link campaign to account
  title: string;
  status: 'active' | 'paused';
  budget: string;
  objective: string;
  progress: number;
  spent: string;
  impressions: string;
  results: string;
  costPerResult: string;
}

export type ScreenView = 'login' | 'register' | 'dashboard' | 'management' | 'comparison' | 'settings' | 'recommendations' | 'campaignDetail';

// --- FACEBOOK TYPES ---
export interface FacebookUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
      width: number;
      height: number;
    }
  }
}

// Global Window interface extension for FB SDK
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}
