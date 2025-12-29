/**
 * AI Settings Utility
 * Quản lý cấu hình AI (API key, bật/tắt) trong localStorage
 */

export interface AISettings {
  enabled: boolean;
  apiKey: string;
}

const AI_SETTINGS_KEY = 'aiSettings';

/**
 * Lấy cài đặt AI từ localStorage
 */
export const getAISettings = (): AISettings => {
  try {
    const saved = localStorage.getItem(AI_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error reading AI settings:', error);
  }
  return { enabled: false, apiKey: '' };
};

/**
 * Lưu cài đặt AI vào localStorage
 */
export const saveAISettings = (settings: AISettings): void => {
  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
    // Dispatch event để các component khác biết settings đã thay đổi
    window.dispatchEvent(new CustomEvent('aiSettingsChanged', { detail: settings }));
  } catch (error) {
    console.error('Error saving AI settings:', error);
  }
};

/**
 * Kiểm tra AI đã được cấu hình đầy đủ chưa
 */
export const isAIConfigured = (): boolean => {
  const settings = getAISettings();
  return settings.enabled && settings.apiKey.length > 0;
};

/**
 * Lấy API key (ưu tiên từ settings, fallback về env)
 */
export const getOpenRouterApiKey = (): string => {
  const settings = getAISettings();
  if (settings.enabled && settings.apiKey) {
    return settings.apiKey;
  }
  // Fallback to environment variable (legacy support)
  return import.meta.env.VITE_OPENROUTER_API_KEY || '';
};

/**
 * Mask API key để hiển thị an toàn
 */
export const maskApiKey = (key: string): string => {
  if (!key || key.length < 12) return key;
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
};
