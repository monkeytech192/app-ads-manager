import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Settings from '../models/Settings';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne({ user_id: req.userId });

    if (!settings) {
      settings = await Settings.create({ user_id: req.userId });
    }

    res.json({
      success: true,
      data: {
        alertCostThreshold: settings.alert_cost_threshold,
        alertCtrThreshold: settings.alert_ctr_threshold,
        defaultDailyBudget: settings.default_daily_budget
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { alertCostThreshold, alertCtrThreshold, defaultDailyBudget } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { user_id: req.userId },
      {
        alert_cost_threshold: alertCostThreshold,
        alert_ctr_threshold: alertCtrThreshold,
        default_daily_budget: defaultDailyBudget,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: {
        alertCostThreshold: settings.alert_cost_threshold,
        alertCtrThreshold: settings.alert_ctr_threshold,
        defaultDailyBudget: settings.default_daily_budget
      },
      message: 'Settings updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    // Simple rule-based recommendations
    const recommendations = [
      {
        id: 1,
        type: 'optimization',
        title: 'Tối ưu CTR cho chiến dịch "Summer Sale"',
        description: 'CTR hiện tại là 0.8%, thấp hơn mức trung bình. Đề xuất thay đổi creative và targeting.',
        priority: 'high',
        impact: 'Có thể tăng CTR lên 1.5-2%'
      },
      {
        id: 2,
        type: 'budget',
        title: 'Tăng ngân sách cho chiến dịch hiệu quả',
        description: 'Chiến dịch "Product Launch" có ROI 180%, đề xuất tăng ngân sách 50%.',
        priority: 'medium',
        impact: 'Dự kiến tăng 45% conversion'
      },
      {
        id: 3,
        type: 'alert',
        title: 'Chiến dịch vượt ngân sách',
        description: '2 chiến dịch đang chi tiêu vượt mức dự kiến 20%.',
        priority: 'high',
        impact: 'Cần điều chỉnh để tránh overspend'
      }
    ];

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = context 
      ? `Context: ${JSON.stringify(context)}\n\nUser Question: ${message}\n\nProvide a helpful answer about Facebook Ads management in Vietnamese.`
      : `User Question: ${message}\n\nProvide a helpful answer about Facebook Ads management in Vietnamese.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      data: {
        response: text
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
