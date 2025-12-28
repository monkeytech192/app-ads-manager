/**
 * Currency Utility Functions
 * Handles currency formatting based on user settings from localStorage
 */

export interface CurrencySettings {
  currency: 'VND' | 'USD';
  rate: number; // Exchange rate: 1 USD = ? VND
}

/**
 * Get currency settings from localStorage
 */
export function getCurrencySettings(): CurrencySettings {
  const saved = localStorage.getItem('currencySettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse currency settings:', e);
    }
  }
  // Default: VND with rate 25000
  return {
    currency: 'VND',
    rate: 25000
  };
}

/**
 * Format currency value based on user settings
 * @param value - Amount in USD (Facebook API returns USD)
 * @param decimals - Number of decimal places (default: 0 for VND, 2 for USD)
 */
export function formatCurrencyWithSettings(value: number | string, decimals?: number): string {
  const settings = getCurrencySettings();
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';

  if (settings.currency === 'VND') {
    const vndValue = numValue * settings.rate;
    const formatted = vndValue.toLocaleString('vi-VN', {
      maximumFractionDigits: decimals ?? 0,
      minimumFractionDigits: 0
    });
    return `${formatted} ₫`;
  } else {
    const formatted = numValue.toLocaleString('en-US', {
      maximumFractionDigits: decimals ?? 2,
      minimumFractionDigits: decimals ?? 2
    });
    return `$${formatted}`;
  }
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  return `${num.toFixed(2)}%`;
}

/**
 * Format currency for display in cards (shorter format)
 */
export function formatCurrencyShort(value: number | string): string {
  const settings = getCurrencySettings();
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';

  if (settings.currency === 'VND') {
    const vndValue = numValue * settings.rate;
    if (vndValue >= 1000000) {
      return `${(vndValue / 1000000).toFixed(1)}M ₫`;
    }
    if (vndValue >= 1000) {
      return `${(vndValue / 1000).toFixed(1)}K ₫`;
    }
    return `${vndValue.toFixed(0)} ₫`;
  } else {
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    }
    if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`;
    }
    return `$${numValue.toFixed(2)}`;
  }
}
