import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askAssistant = async (question: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Vui lòng cấu hình API Key để sử dụng trợ lý AI.";

  try {
    const model = 'gemini-3-flash-preview'; 
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
