/**
 * AI Service - Sử dụng OpenRouter với model miễn phí
 * 
 * OpenRouter cung cấp nhiều model miễn phí:
 * - google/gemini-2.0-flash-exp:free
 * - meta-llama/llama-3.2-3b-instruct:free
 * - qwen/qwen-2-7b-instruct:free
 * 
 * Đăng ký: https://openrouter.ai/keys
 * Cấu hình: OPENROUTER_API_KEY trong .env
 */

import { getCurrencySettings } from '../utils/currency';

// ===================== CONFIG =====================
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const FREE_MODEL = 'mistralai/devstral-2512:free';

// Helper: Format currency based on user settings (for AI prompts)
const formatCurrencyForPrompt = (valueInUSDCents: number, decimals: number = 2): string => {
  const settings = getCurrencySettings();
  const usdValue = valueInUSDCents / 100; // Convert cents to dollars
  
  if (settings.currency === 'VND') {
    const vndValue = usdValue * settings.rate;
    return `${vndValue.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND`;
  } else {
    return `$${usdValue.toFixed(decimals)} USD`;
  }
};

// ===================== TYPES =====================
export interface CampaignAnalysisData {
  campaignName: string;
  status: string;
  objective: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  budgetProgress: number;
  dateRange: string;
}

export interface CampaignContext {
  // Thông tin cơ bản
  campaignName: string;
  status: string;
  objective: string;
  dateRange: string;
  
  // Ngân sách
  budget: number;
  spent: number;
  budgetProgress: number;
  remaining: number;
  
  // Hiệu suất
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  
  // Engagement
  pageLikes?: string;
  pageEngagement?: string;
  postReactions?: string;
  postShares?: string;
  linkClicks?: string;
  
  // Video metrics
  videoViews?: string;
  video25?: string;
  video50?: string;
  video75?: string;
  video100?: string;
  
  // Demographics (tóm tắt)
  demographics?: {
    byGender: Array<{ gender: string; impressions: number; clicks: number; spend: number }>;
    byAge: Array<{ age: string; impressions: number; clicks: number; spend: number }>;
  };
  
  // Placements (tóm tắt)
  placements?: Array<{ name: string; impressions: number; clicks: number; spend: number }>;
  
  // Locations (tóm tắt)
  locations?: Array<{ country: string; region?: string; impressions: number; clicks: number }>;
}

// ===================== PROMPTS =====================
const buildAnalysisPrompt = (data: CampaignAnalysisData, language: 'vi' | 'en'): string => {
  if (language === 'vi') {
    return `Bạn là chuyên gia phân tích quảng cáo Facebook. Dựa trên dữ liệu chiến dịch sau, hãy đưa ra kết luận ngắn gọn (3-5 câu) về hiệu quả chiến dịch:

THÔNG TIN CHIẾN DỊCH:
- Tên: ${data.campaignName}
- Trạng thái: ${data.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}
- Mục tiêu: ${data.objective}
- Ngân sách: ${formatCurrencyForPrompt(data.budget)}
- Đã chi tiêu: ${formatCurrencyForPrompt(data.spent)} (${data.budgetProgress}%)

CHỈ SỐ HIỆU SUẤT (${data.dateRange}):
- Lượt hiển thị: ${data.impressions.toLocaleString()}
- Lượt click: ${data.clicks.toLocaleString()}
- Tiếp cận: ${data.reach.toLocaleString()}
- CTR (tỷ lệ click): ${data.ctr.toFixed(2)}%
- CPC (chi phí/click): ${formatCurrencyForPrompt(data.cpc * 100, 4)}
- CPM (chi phí/1000 hiển thị): ${formatCurrencyForPrompt(data.cpm * 100)}
- Tần suất: ${data.frequency.toFixed(2)}

Hãy đánh giá:
1. Chiến dịch có hiệu quả không? (Tốt/Trung bình/Cần cải thiện)
2. CTR và CPC có tối ưu không?
3. Đề xuất ngắn gọn nếu cần cải thiện

Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.`;
  }
  
  return `You are a Facebook Ads analysis expert. Based on the following campaign data, provide a brief conclusion (3-5 sentences) about campaign effectiveness:

CAMPAIGN INFO:
- Name: ${data.campaignName}
- Status: ${data.status === 'active' ? 'Active' : 'Paused'}
- Objective: ${data.objective}
- Budget: ${formatCurrencyForPrompt(data.budget)}
- Spent: ${formatCurrencyForPrompt(data.spent)} (${data.budgetProgress}%)

PERFORMANCE METRICS (${data.dateRange}):
- Impressions: ${data.impressions.toLocaleString()}
- Clicks: ${data.clicks.toLocaleString()}
- Reach: ${data.reach.toLocaleString()}
- CTR: ${data.ctr.toFixed(2)}%
- CPC: ${formatCurrencyForPrompt(data.cpc * 100, 4)}
- CPM: ${formatCurrencyForPrompt(data.cpm * 100)}
- Frequency: ${data.frequency.toFixed(2)}

Please evaluate:
1. Is the campaign effective? (Good/Average/Needs improvement)
2. Are CTR and CPC optimized?
3. Brief recommendations if needed

Answer in English, concise and clear.`;
};

// ===================== OPENROUTER API CALL =====================
const callOpenRouter = async (prompt: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'FB Ads Manager'
    },
    body: JSON.stringify({
      model: FREE_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

// ===================== MAIN FUNCTIONS =====================

/**
 * Phân tích chiến dịch với AI (OpenRouter - Gemini Free)
 */
export const analyzeCampaign = async (
  data: CampaignAnalysisData, 
  language: 'vi' | 'en'
): Promise<string> => {
  const prompt = buildAnalysisPrompt(data, language);
  
  if (!OPENROUTER_API_KEY) {
    return language === 'vi'
      ? "⚠️ Chưa cấu hình OpenRouter API Key.\n\n👉 Đăng ký miễn phí tại: https://openrouter.ai/keys\n👉 Thêm OPENROUTER_API_KEY vào biến môi trường"
      : "⚠️ OpenRouter API Key not configured.\n\n👉 Get free key at: https://openrouter.ai/keys\n👉 Add OPENROUTER_API_KEY to environment variables";
  }
  
  try {
    const result = await callOpenRouter(prompt);
    return result || (language === 'vi' ? 'Không có phản hồi từ AI.' : 'No response from AI.');
  } catch (error: any) {
    console.error('OpenRouter API Error:', error);
    
    if (error.message?.includes('rate') || error.message?.includes('limit')) {
      return language === 'vi'
        ? "⚠️ Đã vượt giới hạn API. Vui lòng đợi vài giây rồi thử lại."
        : "⚠️ API rate limit exceeded. Please wait a few seconds and try again.";
    }
    
    return language === 'vi'
      ? `❌ Lỗi kết nối AI: ${error.message}`
      : `❌ AI connection error: ${error.message}`;
  }
};

/**
 * Hỏi trợ lý AI (không có context)
 */
export const askAssistant = async (question: string): Promise<string> => {
  const prompt = `Bạn là trợ lý ảo hữu ích cho ứng dụng 'Quản Lý Ads FB'. 
Trả lời ngắn gọn, súc tích bằng tiếng Việt. 
Phong cách trả lời: Thân thiện nhưng chuyên nghiệp.
Câu hỏi: ${question}`;

  if (!OPENROUTER_API_KEY) {
    return "⚠️ Chưa cấu hình OpenRouter API Key.\n\n👉 Đăng ký miễn phí: https://openrouter.ai/keys";
  }
  
  try {
    return await callOpenRouter(prompt);
  } catch (error: any) {
    console.error('OpenRouter Assistant Error:', error);
    return `❌ Lỗi kết nối: ${error.message}`;
  }
};

/**
 * Hỏi trợ lý AI với context chiến dịch
 */
export const askAssistantWithContext = async (
  question: string, 
  context: CampaignContext,
  language: 'vi' | 'en' = 'vi'
): Promise<string> => {
  // Build demographics summary
  let demographicsSummary = '';
  if (context.demographics) {
    const genderData = context.demographics.byGender.map(g => 
      `${g.gender}: ${g.impressions.toLocaleString()} lượt hiển thị, ${g.clicks} clicks`
    ).join('; ');
    const ageData = context.demographics.byAge.slice(0, 5).map(a => 
      `${a.age}: ${a.impressions.toLocaleString()} lượt hiển thị`
    ).join('; ');
    demographicsSummary = `
- Theo giới tính: ${genderData || 'Chưa có dữ liệu'}
- Theo độ tuổi: ${ageData || 'Chưa có dữ liệu'}`;
  }

  // Build placements summary
  let placementsSummary = '';
  if (context.placements && context.placements.length > 0) {
    placementsSummary = context.placements.slice(0, 5).map(p => 
      `${p.name}: ${p.impressions.toLocaleString()} hiển thị, ${p.clicks} clicks`
    ).join('; ');
  }

  // Build locations summary
  let locationsSummary = '';
  if (context.locations && context.locations.length > 0) {
    locationsSummary = context.locations.slice(0, 5).map(l => 
      `${l.region || l.country}: ${l.impressions.toLocaleString()} hiển thị`
    ).join('; ');
  }

  const prompt = language === 'vi' 
    ? `Bạn là trợ lý AI chuyên về quảng cáo Facebook. Người dùng đang xem chiến dịch và hỏi bạn câu hỏi.

📊 DỮ LIỆU CHIẾN DỊCH HIỆN TẠI (${context.dateRange}):

THÔNG TIN CƠ BẢN:
- Tên chiến dịch: ${context.campaignName}
- Trạng thái: ${context.status === 'active' ? '🟢 Đang chạy' : '⏸️ Tạm dừng'}
- Mục tiêu: ${context.objective}

NGÂN SÁCH:
- Tổng ngân sách: ${formatCurrencyForPrompt(context.budget)}
- Đã chi tiêu: ${formatCurrencyForPrompt(context.spent)} (${context.budgetProgress}%)
- Còn lại: ${formatCurrencyForPrompt(context.remaining)}

HIỆU SUẤT:
- Lượt hiển thị: ${context.impressions.toLocaleString()}
- Tiếp cận: ${context.reach.toLocaleString()} người
- Lượt click: ${context.clicks.toLocaleString()}
- CTR (tỷ lệ click): ${context.ctr.toFixed(2)}%
- CPC (chi phí/click): ${formatCurrencyForPrompt(context.cpc * 100, 4)}
- CPM (chi phí/1000 hiển thị): ${formatCurrencyForPrompt(context.cpm * 100)}
- Tần suất hiển thị: ${context.frequency.toFixed(2)} lần/người

TƯƠNG TÁC:
- Like trang: ${context.pageLikes || '0'}
- Tương tác trang: ${context.pageEngagement || '0'}
- Reactions bài viết: ${context.postReactions || '0'}
- Chia sẻ: ${context.postShares || '0'}
- Click liên kết: ${context.linkClicks || '0'}

VIDEO (nếu có):
- Lượt xem video: ${context.videoViews || '0'}
- Xem 25%: ${context.video25 || '0'} | 50%: ${context.video50 || '0'} | 75%: ${context.video75 || '0'} | 100%: ${context.video100 || '0'}

ĐỐI TƯỢNG:${demographicsSummary || '\n- Chưa có dữ liệu demographics'}

VỊ TRÍ HIỂN THỊ: ${placementsSummary || 'Chưa có dữ liệu'}

ĐỊA ĐIỂM: ${locationsSummary || 'Chưa có dữ liệu'}

---
CÂU HỎI CỦA NGƯỜI DÙNG: ${question}

Hãy trả lời dựa trên dữ liệu thực tế ở trên. Nếu câu hỏi liên quan đến chiến dịch, hãy dùng số liệu cụ thể. Trả lời ngắn gọn, dễ hiểu bằng tiếng Việt. Thân thiện nhưng chuyên nghiệp.`

    : `You are an AI assistant specialized in Facebook advertising. The user is viewing a campaign and asking you questions.

📊 CURRENT CAMPAIGN DATA (${context.dateRange}):

BASIC INFO:
- Campaign Name: ${context.campaignName}
- Status: ${context.status === 'active' ? '🟢 Active' : '⏸️ Paused'}
- Objective: ${context.objective}

BUDGET:
- Total Budget: ${formatCurrencyForPrompt(context.budget)}
- Spent: ${formatCurrencyForPrompt(context.spent)} (${context.budgetProgress}%)
- Remaining: ${formatCurrencyForPrompt(context.remaining)}

PERFORMANCE:
- Impressions: ${context.impressions.toLocaleString()}
- Reach: ${context.reach.toLocaleString()} people
- Clicks: ${context.clicks.toLocaleString()}
- CTR: ${context.ctr.toFixed(2)}%
- CPC: ${formatCurrencyForPrompt(context.cpc * 100, 4)}
- CPM: ${formatCurrencyForPrompt(context.cpm * 100)}
- Frequency: ${context.frequency.toFixed(2)} times/person

ENGAGEMENT:
- Page Likes: ${context.pageLikes || '0'}
- Page Engagement: ${context.pageEngagement || '0'}
- Post Reactions: ${context.postReactions || '0'}
- Shares: ${context.postShares || '0'}
- Link Clicks: ${context.linkClicks || '0'}

VIDEO (if applicable):
- Video Views: ${context.videoViews || '0'}
- 25%: ${context.video25 || '0'} | 50%: ${context.video50 || '0'} | 75%: ${context.video75 || '0'} | 100%: ${context.video100 || '0'}

---
USER QUESTION: ${question}

Answer based on the actual data above. If the question relates to the campaign, use specific numbers. Be concise and professional.`;

  if (!OPENROUTER_API_KEY) {
    return language === 'vi' 
      ? "⚠️ Chưa cấu hình OpenRouter API Key.\n\n👉 Đăng ký miễn phí: https://openrouter.ai/keys"
      : "⚠️ OpenRouter API Key not configured.";
  }
  
  try {
    return await callOpenRouter(prompt);
  } catch (error: any) {
    console.error('OpenRouter Assistant Error:', error);
    return language === 'vi' 
      ? `❌ Lỗi kết nối: ${error.message}`
      : `❌ Connection error: ${error.message}`;
  }
};
