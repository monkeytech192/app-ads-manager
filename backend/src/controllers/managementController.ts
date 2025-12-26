import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AdAccount from '../models/AdAccount';
import Campaign from '../models/Campaign';
import CampaignMetric from '../models/CampaignMetric';
import mongoose from 'mongoose';

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await AdAccount.find({ user_id: req.userId });

    res.json({
      success: true,
      data: accounts.map(acc => ({
        id: acc._id,
        name: acc.name,
        status: acc.status,
        createdAt: acc.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const toggleAccount = async (req: AuthRequest, res: Response) => {
  try {
    const account = await AdAccount.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    account.status = account.status === 'active' ? 'paused' : 'active';
    await account.save();

    res.json({
      success: true,
      data: account,
      message: `Account ${account.status === 'active' ? 'activated' : 'paused'} successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, search, status } = req.query;

    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);

    const query: any = { account_id: { $in: accountIds } };

    if (accountId) {
      query.account_id = new mongoose.Types.ObjectId(accountId as string);
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const campaigns = await Campaign.find(query)
      .populate('account_id', 'name')
      .sort({ createdAt: -1 });

    const campaignsData = campaigns.map(c => {
      const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      return {
        id: c._id,
        account: (c.account_id as any).name,
        title: c.title,
        status: c.status,
        objective: c.objective,
        budget: c.budget,
        budgetType: c.budget_type,
        spent: c.spent,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        results: c.results,
        costPerResult: c.cost_per_result,
        startDate: c.start_date,
        endDate: c.end_date
      };
    });

    res.json({
      success: true,
      data: campaignsData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCampaignStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      account_id: { $in: accountIds }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.status = status;
    await campaign.save();

    res.json({
      success: true,
      data: campaign,
      message: `Campaign ${status === 'active' ? 'activated' : 'paused'} successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCampaignDetail = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      account_id: { $in: accountIds }
    }).populate('account_id', 'name');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;

    res.json({
      success: true,
      data: {
        id: campaign._id,
        account: (campaign.account_id as any).name,
        title: campaign.title,
        status: campaign.status,
        objective: campaign.objective,
        budget: campaign.budget,
        budgetType: campaign.budget_type,
        spent: campaign.spent,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        results: campaign.results,
        costPerResult: campaign.cost_per_result,
        startDate: campaign.start_date,
        endDate: campaign.end_date
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCampaignStats = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
    const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;

    res.json({
      success: true,
      data: {
        spent: campaign.spent,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(0)),
        results: campaign.results,
        costPerResult: campaign.cost_per_result
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCampaignChart = async (req: AuthRequest, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const metrics = await CampaignMetric.find({
      campaign_id: req.params.id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    const chartData = metrics.map((metric, index) => ({
      x: index * 40, // Space points 40px apart
      y: 100 - (metric.spent / 1000000) * 10, // Scale for SVG (inverse Y)
      date: metric.date,
      spent: metric.spent,
      impressions: metric.impressions
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

export const getCampaignDemographics = async (req: AuthRequest, res: Response) => {
  try {
    // Mock data - in production, this would come from Facebook API
    res.json({
      success: true,
      data: {
        male: 45,
        female: 55
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const compareCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignIdA, campaignIdB } = req.query;

    if (!campaignIdA || !campaignIdB) {
      return res.status(400).json({
        success: false,
        message: 'Both campaign IDs are required'
      });
    }

    const accounts = await AdAccount.find({ user_id: req.userId });
    const accountIds = accounts.map(acc => acc._id);

    const [campaignA, campaignB] = await Promise.all([
      Campaign.findOne({ _id: campaignIdA, account_id: { $in: accountIds } }),
      Campaign.findOne({ _id: campaignIdB, account_id: { $in: accountIds } })
    ]);

    if (!campaignA || !campaignB) {
      return res.status(404).json({
        success: false,
        message: 'One or both campaigns not found'
      });
    }

    const calculateMetrics = (campaign: any) => {
      const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
      const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;
      return {
        id: campaign._id,
        title: campaign.title,
        spent: campaign.spent,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(0)),
        results: campaign.results,
        costPerResult: campaign.cost_per_result
      };
    };

    // Get chart data for both campaigns
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [metricsA, metricsB] = await Promise.all([
      CampaignMetric.find({ campaign_id: campaignIdA, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      CampaignMetric.find({ campaign_id: campaignIdB, date: { $gte: sevenDaysAgo } }).sort({ date: 1 })
    ]);

    res.json({
      success: true,
      data: {
        campaignA: calculateMetrics(campaignA),
        campaignB: calculateMetrics(campaignB),
        chartDataA: metricsA.map((m, i) => ({ x: i * 40, y: 100 - (m.spent / 1000000) * 10, spent: m.spent })),
        chartDataB: metricsB.map((m, i) => ({ x: i * 40, y: 100 - (m.spent / 1000000) * 10, spent: m.spent }))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
