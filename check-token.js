// Check Facebook Access Token validity
require('dotenv').config();

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ FACEBOOK_ACCESS_TOKEN không tìm thấy trong file .env');
  process.exit(1);
}

async function checkToken() {
  try {
    console.log('Checking Facebook Access Token...\n');
    
    // Debug token to see info
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${FACEBOOK_ACCESS_TOKEN}&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    const response = await fetch(debugUrl);
    const data = await response.json();
    
    console.log('Token Info:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('\n❌ TOKEN ERROR:', data.error.message);
      console.log('\n📝 Cần làm:');
      console.log('1. Vào https://developers.facebook.com/tools/explorer/');
      console.log('2. Chọn app của bạn');
      console.log('3. Click "Generate Access Token"');
      console.log('4. Chọn permissions: ads_read, ads_management, business_management');
      console.log('5. Click biểu tượng ⓘ → "Open in Access Token Tool"');
      console.log('6. Click "Extend Access Token"');
      console.log('7. Copy long-lived token và update vào .env');
    } else if (data.data) {
      const tokenData = data.data;
      console.log('\n✅ Token hợp lệ!');
      console.log(`   App: ${tokenData.app_id}`);
      console.log(`   Valid: ${tokenData.is_valid}`);
      console.log(`   Expires: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toLocaleString() : 'Never'}`);
      console.log(`   Scopes: ${tokenData.scopes?.join(', ')}`);
      
      // Test getting user info
      console.log('\nTesting /me endpoint...');
      const meResponse = await fetch(`https://graph.facebook.com/v24.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`);
      const meData = await meResponse.json();
      console.log('User:', JSON.stringify(meData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkToken();
