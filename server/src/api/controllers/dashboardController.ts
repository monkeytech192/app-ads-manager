import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Campaign from '../../database/models/Campaign';
import CampaignMetric from '../../database/models/CampaignMetric';
import AdAccount from '../../database/models/AdAccount';

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);

    const campaigns = await Campaign.find({ account_id: { $in: accountIds } });

    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const totalResults = campaigns.reduce((sum, c) => sum + c.results, 0);
    
    // Giả định profit = results * 100000 - spent (mỗi result có giá trị 100k)
    const assumedRevenuePerResult = 100000;
    const totalRevenue = totalResults * assumedRevenuePerResult;
    const roi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        totalImpressions,
        totalClicks,
        ctr: parseFloat(ctr.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        totalResults,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getChartData = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);
    const campaigns = await Campaign.find({ account_id: { $in: accountIds } });
    const campaignIds = campaigns.map(c => c._id);

    // Lấy metrics 6 tháng gần nhất
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const metrics = await CampaignMetric.find({
      campaign_id: { $in: campaignIds },
      date: { $gte: sixMonthsAgo }
    });

    // Group by month
    const monthlyData: { [key: string]: { cost: number; profit: number } } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    metrics.forEach(metric => {
      const monthKey = months[metric.date.getMonth()];
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { cost: 0, profit: 0 };
      }
      monthlyData[monthKey].cost += metric.spent;
      monthlyData[monthKey].profit += metric.conversion * 100000 - metric.spent; // Giả định
    });

    const chartData = Object.entries(monthlyData).map(([m, data]) => ({
      m,
      c: Math.round(data.cost / 1000000), // Convert to millions
      p: Math.round(data.profit / 1000000)
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAdSets = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);

    const campaigns = await Campaign.find({ 
      account_id: { $in: accountIds },
      status: 'active'
    })
    .sort({ results: -1 })
    .limit(5);

    const adSets = campaigns.map(c => {
      const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      return {
        id: c._id,
        title: c.title,
        status: c.status,
        spent: c.spent,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        results: c.results,
        costPerResult: c.cost_per_result
      };
    });

    res.json({
      success: true,
      data: adSets
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
