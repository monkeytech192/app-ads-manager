// Test different ways to get ad accounts
const FACEBOOK_ACCESS_TOKEN = 'EAATPwNerTgsBQROZCGLEGoQdOKnyM6WgqEL8yJCqZAZAcbft2omGV0kFZCgZCnLfZBGd7CKZApURT4WgwULoziAfxTB5CqZB3Ivpm4ZBpbOmykmQi9HFELnyM38PRuaXwBeuLbyBGvozEHua7WnywhdZCfFZA8bwaarrZCyQuDbo1ZCsaHDd4oNrmDxBzQKBlGgnv8mptA2U2OcmjzT7sjWU1hZCeqLVog';

async function testAdAccounts() {
  try {
    console.log('Testing different methods to get ad accounts...\n');
    
    // Method 1: /me/adaccounts (for user tokens)
    console.log('Method 1: /me/adaccounts');
    try {
      const response1 = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_id,account_status&access_token=${FACEBOOK_ACCESS_TOKEN}`);
      const data1 = await response1.json();
      if (data1.error) {
        console.log('❌ Error:', data1.error.message);
      } else {
        console.log('✅ Success:', JSON.stringify(data1, null, 2));
      }
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
    
    // Method 2: Get user ID first, then /user_id/adaccounts
    console.log('\nMethod 2: /user_id/adaccounts');
    try {
      const meResponse = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`);
      const meData = await meResponse.json();
      console.log('User ID:', meData.id);
      
      const response2 = await fetch(`https://graph.facebook.com/v21.0/${meData.id}/adaccounts?fields=id,name,account_id,account_status&access_token=${FACEBOOK_ACCESS_TOKEN}`);
      const data2 = await response2.json();
      if (data2.error) {
        console.log('❌ Error:', data2.error.message);
      } else {
        console.log('✅ Success:', JSON.stringify(data2, null, 2));
      }
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
    
    // Method 3: Get businesses first
    console.log('\nMethod 3: /me/businesses');
    try {
      const bizResponse = await fetch(`https://graph.facebook.com/v21.0/me/businesses?fields=id,name&access_token=${FACEBOOK_ACCESS_TOKEN}`);
      const bizData = await bizResponse.json();
      console.log('Businesses:', JSON.stringify(bizData, null, 2));
      
      if (bizData.data && bizData.data.length > 0) {
        const businessId = bizData.data[0].id;
        console.log(`\nGetting ad accounts for business ${businessId}...`);
        const response3 = await fetch(`https://graph.facebook.com/v21.0/${businessId}/owned_ad_accounts?fields=id,name,account_id,account_status&access_token=${FACEBOOK_ACCESS_TOKEN}`);
        const data3 = await response3.json();
        if (data3.error) {
          console.log('❌ Error:', data3.error.message);
        } else {
          console.log('✅ Success:', JSON.stringify(data3, null, 2));
        }
      }
    } catch (e) {
      console.log('❌ Failed:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdAccounts();
