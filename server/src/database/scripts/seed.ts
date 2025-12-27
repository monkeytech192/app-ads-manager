import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Settings from '../models/Settings';
import AdAccount from '../models/AdAccount';
import Campaign from '../models/Campaign';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-manager');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Settings.deleteMany({});
    await AdAccount.deleteMany({});
    await Campaign.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@12345', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: adminPassword,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    });
    console.log('👤 Created admin user (check seed.ts for credentials)');

    // Create settings for admin
    await Settings.create({
      user_id: adminUser._id,
      theme: 'dark',
      language: 'vi',
      notifications_enabled: true,
      email_notifications: true
    });
    console.log('⚙️  Created admin settings');

    // Create sample ad account
    const adAccount = await AdAccount.create({
      user_id: adminUser._id,
      account_id: 'act_123456789',
      name: 'Demo Ad Account',
      platform: 'facebook',
      access_token: 'demo_token_replace_with_real_token',
      status: 'active',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh'
    });
    console.log('💼 Created sample ad account');

    // Create sample campaigns
    const campaigns = [
      {
        account_id: adAccount._id,
        title: 'Summer Sale 2024',
        objective: 'CONVERSIONS',
        status: 'active',
        budget: 500000,
        budget_type: 'daily',
        spent: 125000,
        impressions: 45000,
        clicks: 1250,
        results: 82,
        cost_per_result: 1524,
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-06-30')
      },
      {
        account_id: adAccount._id,
        title: 'Brand Awareness Campaign',
        objective: 'BRAND_AWARENESS',
        status: 'active',
        budget: 300000,
        budget_type: 'daily',
        spent: 87000,
        impressions: 62000,
        clicks: 890,
        results: 54,
        cost_per_result: 1611,
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-06-30')
      },
      {
        account_id: adAccount._id,
        title: 'Traffic Generation',
        objective: 'LINK_CLICKS',
        status: 'paused',
        budget: 200000,
        budget_type: 'lifetime',
        spent: 156000,
        impressions: 38000,
        clicks: 920,
        results: 45,
        cost_per_result: 3467,
        start_date: new Date('2024-05-15'),
        end_date: new Date('2024-06-15')
      }
    ];

    await Campaign.insertMany(campaigns);
    console.log(`📊 Created ${campaigns.length} sample campaigns`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
