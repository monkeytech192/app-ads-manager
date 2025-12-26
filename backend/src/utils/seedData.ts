import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import AdAccount from '../models/AdAccount';
import Campaign from '../models/Campaign';
import CampaignMetric from '../models/CampaignMetric';
import Settings from '../models/Settings';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-manager');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await AdAccount.deleteMany({});
    await Campaign.deleteMany({});
    await CampaignMetric.deleteMany({});
    await Settings.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: hashedPassword,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    });
    console.log('👤 Created admin user');

    // Create default settings
    await Settings.create({
      user_id: user._id,
      alert_cost_threshold: 1000000,
      alert_ctr_threshold: 1.0,
      default_daily_budget: 500000
    });

    // Create Ad Accounts
    const account1 = await AdAccount.create({
      user_id: user._id,
      name: 'Ad Account A',
      status: 'active'
    });

    const account2 = await AdAccount.create({
      user_id: user._id,
      name: 'Ad Account B',
      status: 'paused'
    });
    console.log('🏢 Created ad accounts');

    // Create Campaigns
    const campaigns = [
      {
        account_id: account1._id,
        title: 'Summer Sale 2024',
        status: 'active',
        objective: 'CONVERSIONS',
        budget: 5000000,
        budget_type: 'daily',
        spent: 3500000,
        impressions: 250000,
        clicks: 2000,
        results: 150,
        cost_per_result: 23333,
        start_date: new Date('2024-06-01')
      },
      {
        account_id: account1._id,
        title: 'Product Launch Q3',
        status: 'active',
        objective: 'TRAFFIC',
        budget: 3000000,
        budget_type: 'daily',
        spent: 2100000,
        impressions: 180000,
        clicks: 2700,
        results: 200,
        cost_per_result: 10500,
        start_date: new Date('2024-07-01')
      },
      {
        account_id: account2._id,
        title: 'Brand Awareness',
        status: 'paused',
        objective: 'REACH',
        budget: 2000000,
        budget_type: 'lifetime',
        spent: 1800000,
        impressions: 500000,
        clicks: 1500,
        results: 80,
        cost_per_result: 22500,
        start_date: new Date('2024-05-15')
      },
      {
        account_id: account1._id,
        title: 'Holiday Special',
        status: 'active',
        objective: 'CONVERSIONS',
        budget: 7000000,
        budget_type: 'daily',
        spent: 4900000,
        impressions: 350000,
        clicks: 3500,
        results: 280,
        cost_per_result: 17500,
        start_date: new Date('2024-12-01')
      }
    ];

    const createdCampaigns = await Campaign.insertMany(campaigns);
    console.log('📊 Created campaigns');

    // Create Campaign Metrics (7 days for each campaign)
    const metrics = [];
    for (const campaign of createdCampaigns) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        
        const baseSpent = campaign.spent / 7;
        const baseImpressions = campaign.impressions / 7;
        const baseClicks = campaign.clicks / 7;
        
        metrics.push({
          campaign_id: campaign._id,
          date,
          spent: Math.round(baseSpent * (0.8 + Math.random() * 0.4)),
          impressions: Math.round(baseImpressions * (0.8 + Math.random() * 0.4)),
          clicks: Math.round(baseClicks * (0.8 + Math.random() * 0.4)),
          ctr: 0.8 + Math.random() * 1.5,
          conversion: Math.round((campaign.results / 7) * (0.8 + Math.random() * 0.4))
        });
      }
    }

    await CampaignMetric.insertMany(metrics);
    console.log('📈 Created campaign metrics');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: 123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
