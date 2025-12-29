import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

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

export const analyzeCampaign = async (data: CampaignAnalysisData, language: 'vi' | 'en'): Promise<string> => {
  const ai = getClient();
  if (!ai) return language === 'vi' 
    ? "Vui lòng cấu hình API Key để sử dụng tính năng phân tích AI." 
    : "Please configure API Key to use AI analysis.";

  const prompt = language === 'vi' 
    ? `Bạn là chuyên gia phân tích quảng cáo Facebook. Dựa trên dữ liệu chiến dịch sau, hãy đưa ra kết luận ngắn gọn (3-5 câu) về hiệu quả chiến dịch:

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

Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.`
    : `You are a Facebook Ads analysis expert. Based on the following campaign data, provide a brief conclusion (3-5 sentences) about campaign effectiveness:

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

  try {
    const model = 'gemini-2.0-flash'; 
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });
    
    return response.text || (language === 'vi' 
      ? "Không thể phân tích dữ liệu lúc này." 
      : "Unable to analyze data at this time.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'vi' 
      ? "Đã có lỗi xảy ra khi kết nối với AI." 
      : "An error occurred while connecting to AI.";
  }
};

export const askAssistant = async (question: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Vui lòng cấu hình API Key để sử dụng trợ lý AI.";

  try {
    const model = 'gemini-2.0-flash'; 
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Bạn là trợ lý ảo hữu ích cho ứng dụng 'Quản Lý Ads FB'. 
              Trả lời ngắn gọn, súc tích bằng tiếng Việt. 
              Phong cách trả lời: Thân thiện nhưng chuyên nghiệp.
              Câu hỏi: ${question}`
            }
          ]
        }
      ]
    });
    
    return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã có lỗi xảy ra khi kết nối với trợ lý ảo.";
  }
};
