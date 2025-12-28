/**
 * Internationalization (i18n) Service
 * Supports Vietnamese and English languages
 */

export type Language = 'vi' | 'en';

// Translation keys organized by category
const translations = {
  // Navigation
  'nav.dashboard': { vi: 'Tổng quan', en: 'Dashboard' },
  'nav.management': { vi: 'Quản lý', en: 'Management' },
  'nav.comparison': { vi: 'So sánh', en: 'Compare' },
  'nav.recommendations': { vi: 'Đề xuất', en: 'Recommendations' },
  'nav.settings': { vi: 'Cài đặt', en: 'Settings' },

  // Common actions
  'common.back': { vi: 'Quay lại', en: 'Back' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.add': { vi: 'Thêm', en: 'Add' },
  'common.edit': { vi: 'Sửa', en: 'Edit' },
  'common.delete': { vi: 'Xóa', en: 'Delete' },
  'common.search': { vi: 'Tìm kiếm', en: 'Search' },
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.error': { vi: 'Lỗi', en: 'Error' },
  'common.success': { vi: 'Thành công', en: 'Success' },
  'common.select': { vi: 'Chọn', en: 'Select' },
  'common.selectAll': { vi: 'Chọn tất cả', en: 'Select All' },
  'common.deselectAll': { vi: 'Bỏ chọn tất cả', en: 'Deselect All' },
  'common.selected': { vi: 'đã chọn', en: 'selected' },
  'common.noData': { vi: 'Không có dữ liệu', en: 'No data' },

  // Login screen
  'login.title': { vi: 'ĐĂNG NHẬP', en: 'LOGIN' },
  'login.email': { vi: 'Email', en: 'Email' },
  'login.password': { vi: 'Mật khẩu', en: 'Password' },
  'login.rememberMe': { vi: 'Ghi nhớ đăng nhập', en: 'Remember me' },
  'login.submit': { vi: 'ĐĂNG NHẬP', en: 'LOGIN' },
  'login.withFacebook': { vi: 'ĐĂNG NHẬP BẰNG FACEBOOK', en: 'LOGIN WITH FACEBOOK' },
  'login.noAccount': { vi: 'Chưa có tài khoản?', en: "Don't have an account?" },
  'login.register': { vi: 'Đăng ký ngay', en: 'Register now' },
  'login.forgotPassword': { vi: 'Quên mật khẩu?', en: 'Forgot password?' },

  // Register screen
  'register.title': { vi: 'ĐĂNG KÝ', en: 'REGISTER' },
  'register.name': { vi: 'Họ và tên', en: 'Full name' },
  'register.email': { vi: 'Email', en: 'Email' },
  'register.password': { vi: 'Mật khẩu', en: 'Password' },
  'register.confirmPassword': { vi: 'Xác nhận mật khẩu', en: 'Confirm password' },
  'register.submit': { vi: 'ĐĂNG KÝ', en: 'REGISTER' },
  'register.hasAccount': { vi: 'Đã có tài khoản?', en: 'Already have an account?' },
  'register.login': { vi: 'Đăng nhập', en: 'Login' },

  // Dashboard
  'dashboard.title': { vi: 'TỔNG QUAN', en: 'DASHBOARD' },
  'dashboard.spend': { vi: 'Chi tiêu', en: 'Spend' },
  'dashboard.impressions': { vi: 'Lượt hiển thị', en: 'Impressions' },
  'dashboard.clicks': { vi: 'Lượt click', en: 'Clicks' },
  'dashboard.reach': { vi: 'Tiếp cận', en: 'Reach' },
  'dashboard.ctr': { vi: 'Tỷ lệ CTR', en: 'CTR' },
  'dashboard.cpc': { vi: 'Chi phí/click', en: 'Cost per click' },
  'dashboard.conversions': { vi: 'Chuyển đổi', en: 'Conversions' },
  'dashboard.overview': { vi: 'Tổng quan', en: 'Overview' },
  'dashboard.activeCampaigns': { vi: 'Chiến dịch đang chạy', en: 'Active Campaigns' },
  'dashboard.totalSpend': { vi: 'Tổng chi tiêu', en: 'Total Spend' },
  'dashboard.viewDetails': { vi: 'XEM CHI TIẾT', en: 'VIEW DETAILS' },

  // Management
  'management.title': { vi: 'QUẢN LÝ CHIẾN DỊCH', en: 'CAMPAIGN MANAGEMENT' },
  'management.accounts': { vi: 'TÀI KHOẢN', en: 'ACCOUNTS' },
  'management.campaigns': { vi: 'CHIẾN DỊCH', en: 'CAMPAIGNS' },
  'management.selectAccounts': { vi: 'Chọn tài khoản quảng cáo', en: 'Select Ad Accounts' },
  'management.selectCampaigns': { vi: 'Chọn chiến dịch để xem', en: 'Select Campaigns to View' },
  'management.status': { vi: 'Trạng thái', en: 'Status' },
  'management.budget': { vi: 'Ngân sách', en: 'Budget' },
  'management.spent': { vi: 'Đã chi', en: 'Spent' },
  'management.progress': { vi: 'Tiến độ', en: 'Progress' },
  'management.active': { vi: 'Đang chạy', en: 'Active' },
  'management.paused': { vi: 'Tạm dừng', en: 'Paused' },
  'management.completed': { vi: 'Hoàn thành', en: 'Completed' },
  'management.noCampaigns': { vi: 'Chưa có chiến dịch nào', en: 'No campaigns yet' },
  'management.selectAccountFirst': { vi: 'Vui lòng chọn ít nhất 1 tài khoản', en: 'Please select at least 1 account' },

  // Campaign Detail
  'detail.title': { vi: 'CHI TIẾT CHIẾN DỊCH', en: 'CAMPAIGN DETAIL' },
  'detail.overview': { vi: 'TỔNG QUAN', en: 'OVERVIEW' },
  'detail.performance': { vi: 'HIỆU QUẢ', en: 'PERFORMANCE' },
  'detail.audience': { vi: 'ĐỐI TƯỢNG', en: 'AUDIENCE' },
  'detail.budgetTab': { vi: 'NGÂN SÁCH', en: 'BUDGET' },
  'detail.timeRange': { vi: 'Khoảng thời gian', en: 'Time Range' },
  'detail.last7days': { vi: '7 ngày qua', en: 'Last 7 days' },
  'detail.last14days': { vi: '14 ngày qua', en: 'Last 14 days' },
  'detail.last30days': { vi: '30 ngày qua', en: 'Last 30 days' },
  'detail.thisMonth': { vi: 'Tháng này', en: 'This month' },
  'detail.lastMonth': { vi: 'Tháng trước', en: 'Last month' },
  'detail.budgetTotal': { vi: 'Ngân sách', en: 'Budget' },
  'detail.spentTotal': { vi: 'Đã chi', en: 'Spent' },
  'detail.remaining': { vi: 'Còn lại', en: 'Remaining' },
  'detail.daily': { vi: 'Hàng ngày', en: 'Daily' },
  'detail.lifetime': { vi: 'Trọn đời', en: 'Lifetime' },
  'detail.frequency': { vi: 'Tần suất', en: 'Frequency' },
  'detail.cpm': { vi: 'CPM', en: 'CPM' },
  'detail.costPerConversion': { vi: 'Chi phí/chuyển đổi', en: 'Cost per conversion' },
  'detail.ageGender': { vi: 'Độ tuổi & Giới tính', en: 'Age & Gender' },
  'detail.male': { vi: 'Nam', en: 'Male' },
  'detail.female': { vi: 'Nữ', en: 'Female' },
  'detail.seeRecommendations': { vi: 'XEM ĐỀ XUẤT TỐI ƯU', en: 'VIEW OPTIMIZATION TIPS' },
  'detail.noInsights': { vi: 'Chưa có dữ liệu insights', en: 'No insights data available' },

  // Comparison
  'comparison.title': { vi: 'SO SÁNH NHÓM QC', en: 'COMPARE AD SETS' },
  'comparison.selectCampaigns': { vi: 'Chọn chiến dịch để so sánh', en: 'Select campaigns to compare' },
  'comparison.compare': { vi: 'SO SÁNH', en: 'COMPARE' },
  'comparison.metric': { vi: 'Chỉ số', en: 'Metric' },
  'comparison.selectCampaignAndGroup': { vi: 'Chọn chiến dịch và nhóm', en: 'Select campaign and group' },
  'comparison.sideA': { vi: 'BÊN A', en: 'SIDE A' },
  'comparison.sideB': { vi: 'BÊN B', en: 'SIDE B' },
  'comparison.campaign': { vi: 'Chiến dịch', en: 'Campaign' },
  'comparison.adSet': { vi: 'Nhóm quảng cáo', en: 'Ad Set' },
  'comparison.selectCampaign': { vi: '-- Chọn chiến dịch --', en: '-- Select campaign --' },
  'comparison.selectAdSet': { vi: '-- Chọn nhóm --', en: '-- Select ad set --' },
  'comparison.loading': { vi: 'Đang tải dữ liệu...', en: 'Loading data...' },
  'comparison.refresh': { vi: 'LÀM MỚI SO SÁNH', en: 'REFRESH COMPARISON' },
  'comparison.spend': { vi: 'CHI TIÊU', en: 'SPEND' },
  'comparison.impressions': { vi: 'LƯỢT HIỂN THỊ', en: 'IMPRESSIONS' },
  'comparison.clicks': { vi: 'NHẤP CHUỘT', en: 'CLICKS' },
  'comparison.reach': { vi: 'TẦM TIẾP CẬN', en: 'REACH' },
  'comparison.frequency': { vi: 'TẦN SUẤT', en: 'FREQUENCY' },
  'comparison.conversions': { vi: 'CHUYỂN ĐỔI', en: 'CONVERSIONS' },
  'comparison.costPerConversion': { vi: 'CHI PHÍ/CHUYỂN ĐỔI', en: 'COST/CONVERSION' },
  'comparison.selectAccountFirst': { vi: 'Vui lòng chọn tài khoản quảng cáo trước', en: 'Please select an ad account first' },
  'comparison.selectAdSetBothSides': { vi: 'Vui lòng chọn nhóm quảng cáo cho cả hai bên', en: 'Please select ad sets for both sides' },

  // Recommendations
  'recommendations.title': { vi: 'ĐỀ XUẤT & HÀNH ĐỘNG', en: 'RECOMMENDATIONS & ACTIONS' },
  'recommendations.aiPowered': { vi: 'Được hỗ trợ bởi AI', en: 'AI Powered' },
  'recommendations.askAi': { vi: 'Hỏi AI về chiến dịch của bạn', en: 'Ask AI about your campaigns' },
  'recommendations.placeholder': { vi: 'Nhập câu hỏi...', en: 'Enter your question...' },
  'recommendations.send': { vi: 'Gửi', en: 'Send' },
  'recommendations.campaignContext': { vi: 'CHIẾN DỊCH:', en: 'CAMPAIGN:' },
  'recommendations.summerSale': { vi: 'MÙA HÈ SALE', en: 'SUMMER SALE' },
  'recommendations.increaseBudget': { vi: 'Tăng ngân sách cho "Chiến dịch Mùa Hè"', en: 'Increase budget for "Summer Campaign"' },
  'recommendations.increaseBudgetDesc': { vi: 'Hiệu suất tốt, CPC thấp. Đề xuất tăng 20% để tối đa hóa chuyển đổi.', en: 'Good performance, low CPC. Recommend increasing 20% to maximize conversions.' },
  'recommendations.increaseBudgetBtn': { vi: 'TĂNG NGÂN SÁCH NGAY', en: 'INCREASE BUDGET NOW' },
  'recommendations.expandAudience': { vi: 'Mở rộng đối tượng "Nhóm Gen Z"', en: 'Expand "Gen Z Group" audience' },
  'recommendations.expandAudienceDesc': { vi: 'Tỷ lệ tương tác cao. Thêm sở thích mới để tiếp cận nhiều hơn.', en: 'High engagement rate. Add new interests to reach more.' },
  'recommendations.expandAudienceBtn': { vi: 'THAY ĐỔI ĐỐI TƯỢNG', en: 'CHANGE AUDIENCE' },
  'recommendations.optimizeImage': { vi: 'Tối ưu hình ảnh "Banner Khuyến mãi"', en: 'Optimize "Promotion Banner" image' },
  'recommendations.optimizeImageDesc': { vi: 'Tỷ lệ nhấp thấp. Thử nghiệm biến thể hình ảnh mới để cải thiện CTR.', en: 'Low click rate. Test new image variants to improve CTR.' },
  'recommendations.optimizeImageBtn': { vi: 'TẠO BIẾN THỂ MỚI', en: 'CREATE NEW VARIANT' },

  // Settings
  'settings.title': { vi: 'Cài đặt & Ngân sách', en: 'Settings & Budget' },
  'settings.alerts': { vi: 'THIẾT LẬP CẢNH BÁO', en: 'ALERT SETTINGS' },
  'settings.costSpike': { vi: 'Chi phí tăng đột biến (>20%)', en: 'Cost spike (>20%)' },
  'settings.ctrDrop': { vi: 'CTR giảm (<1%)', en: 'CTR drop (<1%)' },
  'settings.addCustomAlert': { vi: 'THÊM CẢNH BÁO TÙY CHỈNH', en: 'ADD CUSTOM ALERT' },
  'settings.currency': { vi: 'CÀI ĐẶT TIỀN TỆ', en: 'CURRENCY SETTINGS' },
  'settings.displayCurrency': { vi: 'Đơn vị tiền tệ hiển thị', en: 'Display Currency' },
  'settings.exchangeRate': { vi: 'Tỷ giá quy đổi (1 USD = ? VNĐ)', en: 'Exchange Rate (1 USD = ? VND)' },
  'settings.example': { vi: 'Ví dụ', en: 'Example' },
  'settings.saveCurrency': { vi: 'LƯU CÀI ĐẶT TIỀN TỆ', en: 'SAVE CURRENCY SETTINGS' },
  'settings.savedCurrency': { vi: 'Đã lưu cài đặt tiền tệ!', en: 'Currency settings saved!' },
  'settings.language': { vi: 'CÀI ĐẶT NGÔN NGỮ', en: 'LANGUAGE SETTINGS' },
  'settings.selectLanguage': { vi: 'Chọn ngôn ngữ', en: 'Select Language' },
  'settings.vietnamese': { vi: 'Tiếng Việt', en: 'Vietnamese' },
  'settings.english': { vi: 'English', en: 'English' },
  'settings.savedLanguage': { vi: 'Đã thay đổi ngôn ngữ!', en: 'Language changed!' },

  // Status
  'status.active': { vi: 'Đang chạy', en: 'Active' },
  'status.paused': { vi: 'Tạm dừng', en: 'Paused' },
  'status.deleted': { vi: 'Đã xóa', en: 'Deleted' },
  'status.archived': { vi: 'Đã lưu trữ', en: 'Archived' },

  // Errors
  'error.loadFailed': { vi: 'Không thể tải dữ liệu', en: 'Failed to load data' },
  'error.saveFailed': { vi: 'Không thể lưu', en: 'Failed to save' },
  'error.networkError': { vi: 'Lỗi mạng', en: 'Network error' },
  'error.unauthorized': { vi: 'Chưa đăng nhập', en: 'Unauthorized' },

  // Assistant
  'assistant.title': { vi: 'Trợ lý AI', en: 'AI Assistant' },
  'assistant.thinking': { vi: 'Đang suy nghĩ...', en: 'Thinking...' },
  'assistant.error': { vi: 'Không thể kết nối trợ lý AI', en: 'Could not connect to AI assistant' },
} as const;

type TranslationKey = keyof typeof translations;

// Get current language from localStorage
export function getLanguage(): Language {
  const saved = localStorage.getItem('language');
  return (saved as Language) || 'vi';
}

// Set language to localStorage
export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
  // Dispatch event for components to react
  window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
}

// Get translation for a key
export function t(key: TranslationKey): string {
  const lang = getLanguage();
  const translation = translations[key];
  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }
  return translation[lang] || translation['vi'];
}

// Hook for React components to use translations
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };
    
    window.addEventListener('languageChange', handleChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleChange as EventListener);
    };
  }, []);

  return {
    t: (key: TranslationKey) => {
      const translation = translations[key];
      if (!translation) return key;
      return translation[lang] || translation['vi'];
    },
    lang,
    setLang: (newLang: Language) => {
      setLanguage(newLang);
    },
  };
}
