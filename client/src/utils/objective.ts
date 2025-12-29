/**
 * Facebook Campaign Objective Mapping
 * Maps Facebook API objective values to user-friendly names
 */

// Facebook Objective Types (from API)
export type FacebookObjective = 
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_APP_PROMOTION'
  // Legacy objectives (older API versions)
  | 'BRAND_AWARENESS'
  | 'REACH'
  | 'LINK_CLICKS'
  | 'ENGAGEMENT'
  | 'POST_ENGAGEMENT'
  | 'PAGE_LIKES'
  | 'EVENT_RESPONSES'
  | 'VIDEO_VIEWS'
  | 'LEAD_GENERATION'
  | 'MESSAGES'
  | 'CONVERSIONS'
  | 'CATALOG_SALES'
  | 'STORE_VISITS'
  | 'APP_INSTALLS'
  | string;

// Mapping for Vietnamese
const objectiveMapVi: Record<string, string> = {
  // New OUTCOME_ objectives
  'OUTCOME_AWARENESS': 'Mức độ nhận biết',
  'OUTCOME_TRAFFIC': 'Lưu lượng truy cập',
  'OUTCOME_ENGAGEMENT': 'Lượt tương tác',
  'OUTCOME_LEADS': 'Khách hàng tiềm năng',
  'OUTCOME_APP_PROMOTION': 'Quảng cáo ứng dụng',
  'OUTCOME_SALES': 'Doanh số',
  
  // Legacy objectives
  'BRAND_AWARENESS': 'Nhận diện thương hiệu',
  'REACH': 'Phạm vi tiếp cận',
  'LINK_CLICKS': 'Lượt click liên kết',
  'ENGAGEMENT': 'Tương tác',
  'POST_ENGAGEMENT': 'Tương tác bài viết',
  'PAGE_LIKES': 'Lượt thích trang',
  'EVENT_RESPONSES': 'Phản hồi sự kiện',
  'VIDEO_VIEWS': 'Lượt xem video',
  'LEAD_GENERATION': 'Tạo khách hàng tiềm năng',
  'MESSAGES': 'Tin nhắn',
  'CONVERSIONS': 'Chuyển đổi',
  'CATALOG_SALES': 'Bán hàng từ danh mục',
  'STORE_VISITS': 'Lượt ghé cửa hàng',
  'APP_INSTALLS': 'Cài đặt ứng dụng',
};

// Mapping for English
const objectiveMapEn: Record<string, string> = {
  // New OUTCOME_ objectives
  'OUTCOME_AWARENESS': 'Awareness',
  'OUTCOME_TRAFFIC': 'Traffic',
  'OUTCOME_ENGAGEMENT': 'Engagement',
  'OUTCOME_LEADS': 'Leads',
  'OUTCOME_APP_PROMOTION': 'App Promotion',
  'OUTCOME_SALES': 'Sales',
  
  // Legacy objectives  
  'BRAND_AWARENESS': 'Brand Awareness',
  'REACH': 'Reach',
  'LINK_CLICKS': 'Link Clicks',
  'ENGAGEMENT': 'Engagement',
  'POST_ENGAGEMENT': 'Post Engagement',
  'PAGE_LIKES': 'Page Likes',
  'EVENT_RESPONSES': 'Event Responses',
  'VIDEO_VIEWS': 'Video Views',
  'LEAD_GENERATION': 'Lead Generation',
  'MESSAGES': 'Messages',
  'CONVERSIONS': 'Conversions',
  'CATALOG_SALES': 'Catalog Sales',
  'STORE_VISITS': 'Store Visits',
  'APP_INSTALLS': 'App Installs',
};

/**
 * Get user-friendly objective name from API value
 * @param apiObjective - The objective value from Facebook API
 * @param lang - Language code ('vi' or 'en')
 * @returns User-friendly objective name
 */
export function getObjectiveName(apiObjective: string, lang: 'vi' | 'en' = 'vi'): string {
  if (!apiObjective || apiObjective === 'N/A') return 'N/A';
  
  const map = lang === 'vi' ? objectiveMapVi : objectiveMapEn;
  
  // Try exact match
  if (map[apiObjective]) {
    return map[apiObjective];
  }
  
  // Try uppercase version
  const upperCase = apiObjective.toUpperCase();
  if (map[upperCase]) {
    return map[upperCase];
  }
  
  // If no mapping found, format the API value to be more readable
  // e.g., "OUTCOME_ENGAGEMENT" -> "Outcome Engagement"
  return apiObjective
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get objective icon/emoji based on objective type
 * @param apiObjective - The objective value from Facebook API
 * @returns Icon/emoji representing the objective
 */
export function getObjectiveIcon(apiObjective: string): string {
  const iconMap: Record<string, string> = {
    'OUTCOME_AWARENESS': '👁️',
    'OUTCOME_TRAFFIC': '🔗',
    'OUTCOME_ENGAGEMENT': '💬',
    'OUTCOME_LEADS': '📋',
    'OUTCOME_APP_PROMOTION': '📱',
    'OUTCOME_SALES': '🛒',
    'BRAND_AWARENESS': '🎯',
    'REACH': '📢',
    'LINK_CLICKS': '🔗',
    'ENGAGEMENT': '💬',
    'POST_ENGAGEMENT': '👍',
    'PAGE_LIKES': '❤️',
    'EVENT_RESPONSES': '📅',
    'VIDEO_VIEWS': '🎬',
    'LEAD_GENERATION': '📋',
    'MESSAGES': '💬',
    'CONVERSIONS': '🎯',
    'CATALOG_SALES': '🛍️',
    'STORE_VISITS': '🏪',
    'APP_INSTALLS': '📲',
  };
  
  return iconMap[apiObjective] || iconMap[apiObjective.toUpperCase()] || '📊';
}
