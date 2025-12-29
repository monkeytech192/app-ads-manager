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

// ===================== CONFIG =====================
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const FREE_MODEL = 'mistralai/devstral-2512:free';

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

// ===================== PROMPTS =====================
const buildAnalysisPrompt = (data: CampaignAnalysisData, language: 'vi' | 'en'): string => {
  if (language === 'vi') {
    return `Bạn là chuyên gia phân tích quảng cáo Facebook. Dựa trên dữ liệu chiến dịch sau, hãy đưa ra kết luận ngắn gọn (3-5 câu) về hiệu quả chiến dịch:

THÔNG TIN CHIẾN DỊCH:
- Tên: ${data.campaignName}
- Trạng thái: ${data.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}
- Mục tiêu: ${data.objective}
- Ngân sách: ${data.budget.toLocaleString('vi-VN')} VND
- Đã chi tiêu: ${data.spent.toLocaleString('vi-VN')} VND (${data.budgetProgress}%)

CHỈ SỐ HIỆU SUẤT (${data.dateRange}):
- Lượt hiển thị: ${data.impressions.toLocaleString()}
- Lượt click: ${data.clicks.toLocaleString()}
- Tiếp cận: ${data.reach.toLocaleString()}
- CTR (tỷ lệ click): ${data.ctr.toFixed(2)}%
- CPC (chi phí/click): ${data.cpc.toLocaleString('vi-VN')} VND
- CPM (chi phí/1000 hiển thị): ${data.cpm.toLocaleString('vi-VN')} VND
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
- Budget: $${(data.budget / 25000).toFixed(2)} (${data.budget.toLocaleString()} VND)
- Spent: $${(data.spent / 25000).toFixed(2)} (${data.budgetProgress}%)

PERFORMANCE METRICS (${data.dateRange}):
- Impressions: ${data.impressions.toLocaleString()}
- Clicks: ${data.clicks.toLocaleString()}
- Reach: ${data.reach.toLocaleString()}
- CTR: ${data.ctr.toFixed(2)}%
- CPC: $${(data.cpc / 25000).toFixed(2)}
- CPM: $${(data.cpm / 25000).toFixed(2)}
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
 * Hỏi trợ lý AI
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
