// Test script để kiểm tra Facebook API
require('dotenv').config();

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN không tìm thấy trong file .env');
  process.exit(1);
}

async function testFacebookAPI() {
  try {
    console.log('Testing Facebook Marketing API...\n');
    
    // Test 1: Get Ad Accounts
    console.log('1. Fetching Ad Accounts...');
    const accountsResponse = await fetch(`https://graph.facebook.com/v24.0/me/adaccounts?fields=id,name,account_id,account_status&access_token=${FACEBOOK_ACCESS_TOKEN}`);
    
    if (!accountsResponse.ok) {
      throw new Error(`HTTP error! status: ${accountsResponse.status}`);
    }
    
    const accountsData = await accountsResponse.json();
    console.log('✅ Ad Accounts:', JSON.stringify(accountsData, null, 2));
    
    // Test 2: Get Campaigns (if we have accounts)
    if (accountsData.data && accountsData.data.length > 0) {
      const firstAccountId = accountsData.data[0].id;
      console.log(`\n2. Fetching Campaigns for account ${firstAccountId}...`);
      
      const campaignsResponse = await fetch(`https://graph.facebook.com/v24.0/${firstAccountId}/campaigns?fields=id,name,status&access_token=${FACEBOOK_ACCESS_TOKEN}`);
      const campaignsData = await campaignsResponse.json();
      console.log('✅ Campaigns:', JSON.stringify(campaignsData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

testFacebookAPI();
