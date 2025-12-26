# Hướng Dẫn Setup Facebook Login for Business

## 1. Tạo Facebook Business App

1. Vào [Meta App Dashboard](https://developers.facebook.com/apps)
2. Click **Create App**
3. Chọn **Business** type app
4. Điền thông tin:
   - App Name: `Ads Manager Brutalist`
   - App Contact Email: email của bạn
   - Business Portfolio: Chọn Business hoặc tạo mới

## 2. Add Facebook Login for Business Product

1. Trong App Dashboard, click **Add Products**
2. Tìm **Facebook Login for Business**, click **Set Up**
3. Vào **Configurations** trong menu bên trái

## 3. Create User Access Token Configuration

1. Click **+ Create configuration**
2. Điền thông tin:
   - **Configuration Name**: `User Access Token - Ads Manager`
   - **Access Token Type**: **User access token**
   - **Token Expiration**: `60 days` (hoặc theo nhu cầu)
   
3. **Select Assets** (chọn những gì app cần truy cập):
   - ☑️ Ad Accounts
   - ☑️ Pages (nếu cần quản lý Pages)
   - ☑️ Instagram Accounts (nếu cần Instagram ads)

4. **Select Permissions**:
   - ☑️ `ads_read` - Đọc thông tin ads
   - ☑️ `ads_management` - Quản lý ads
   - ☑️ `business_management` - Quản lý business assets
   - ☑️ `pages_read_engagement` - Đọc Pages (nếu cần)
   - ☑️ `instagram_basic` - Instagram basic access (nếu cần)

5. Click **Create**
6. **Copy Configuration ID** (dạng: `1234567890123456`)

## 4. Create System User Access Token Configuration (Optional)

> Dùng cho automated, long-term access không cần user login lại

1. Click **+ Create configuration**
2. Điền thông tin:
   - **Configuration Name**: `System User - Automated Ads`
   - **Access Token Type**: **System-user access token**
   - **Token Expiration**: `Never expire`

3. **Select Assets**: Same as above
4. **Select Permissions**: Same as above
5. Click **Create**
6. **Copy Configuration ID**

## 5. Configure App Settings

### 5.1. Basic Settings
1. Vào **Settings > Basic**
2. Add **App Domains**: `app-ads.tiemtocchu3.vn`, `localhost`
3. Add **Privacy Policy URL**: URL chính sách bảo mật của bạn
4. Add **Terms of Service URL**: URL điều khoản sử dụng
5. **Save Changes**

### 5.2. Facebook Login Settings
1. Vào **Facebook Login for Business > Settings**
2. **Valid OAuth Redirect URIs**:
   ```
   https://app-ads.tiemtocchu3.vn/auth/callback
   http://localhost:5173/auth/callback
   ```
3. **Save Changes**

## 6. Update Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://app-ads-manager-production.up.railway.app/api/v1
VITE_FB_APP_ID=1354327065841163
VITE_FB_CONFIG_ID=YOUR_USER_ACCESS_TOKEN_CONFIG_ID
VITE_FB_BUSINESS_CONFIG_ID=YOUR_SYSTEM_USER_CONFIG_ID
```

### Backend (.env hoặc Railway Variables)
```env
FACEBOOK_APP_ID=1354327065841163
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_REDIRECT_URI=https://app-ads.tiemtocchu3.vn/auth/callback
```

## 7. Test Login Flow

### 7.1. User Access Token (Personal Account Login)
```javascript
// Frontend
import { loginWithFacebook } from './services/facebookService';

const handleLogin = async () => {
  try {
    const authResponse = await loginWithFacebook();
    console.log('Access Token:', authResponse.accessToken);
    
    // Send to backend to save
    await api.post('/api/v1/facebook/profile', {
      access_token: authResponse.accessToken
    });
  } catch (error) {
    console.error(error);
  }
};
```

### 7.2. System User Access Token (Business Portfolio Login)
```javascript
// Frontend
import { loginWithFacebookBusiness } from './services/facebookService';

const handleBusinessLogin = async () => {
  try {
    const code = await loginWithFacebookBusiness();
    
    // Exchange code for access token on backend
    const response = await api.post('/api/v1/facebook/exchange-token', {
      code: code
    });
    
    console.log('Access Token:', response.data.data.access_token);
    console.log('Business ID:', response.data.data.client_business_id);
  } catch (error) {
    console.error(error);
  }
};
```

## 8. Get Advanced Access (Production)

> Yêu cầu khi app đi live với business clients thật

1. Vào **App Review > Permissions and Features**
2. Request **Advanced Access** cho:
   - `ads_read`
   - `ads_management`
   - `business_management`
   
3. Chuẩn bị:
   - Video demo app
   - Mô tả chi tiết cách app sử dụng permissions
   - Test instructions cho Facebook reviewers
   
4. Submit for review
5. Chờ Facebook approve (1-2 tuần)

## 9. API Endpoints

### Exchange Code for Token
```
POST /api/v1/facebook/exchange-token
Body: { code: "authorization_code" }
```

### Get User Profile
```
POST /api/v1/facebook/profile
Body: { access_token: "user_access_token" }
```

### Get Ad Accounts
```
POST /api/v1/facebook/adaccounts
Body: { access_token: "user_access_token" }
```

### Get Campaigns
```
POST /api/v1/facebook/campaigns
Body: { 
  access_token: "user_access_token",
  ad_account_id: "act_123456789"
}
```

### Get Campaign Insights
```
POST /api/v1/facebook/insights
Body: { 
  access_token: "user_access_token",
  campaign_id: "campaign_id",
  date_preset: "last_7d" // or "last_30d", "this_month", etc.
}
```

## 10. Security Best Practices

1. **Never commit App Secret** vào git
2. **Validate tokens** trên backend trước khi dùng
3. **Store tokens securely** - encrypt trong database
4. **Implement token refresh** - handle expired tokens
5. **Use HTTPS** cho production
6. **Implement rate limiting** để tránh abuse
7. **Log all API calls** để audit

## 11. Testing

### Test Users
1. Vào **Roles > Test Users** trong App Dashboard
2. Create test users để test login flow
3. Test với multiple scenarios:
   - ✅ Successful login
   - ✅ Cancelled login
   - ✅ Missing permissions
   - ✅ Expired token
   - ✅ Invalid token

### Troubleshooting

**Error: "Config ID is invalid"**
- Check Configuration ID đúng chưa
- Verify app type là Business

**Error: "Business System User Access Token is not currently supported on Mobile"**
- System User token chỉ work trên web, không dùng trên mobile app

**Error: "Invalid response_type"**
- Với System User token, phải set `response_type: 'code'` và `override_default_response_type: true`

**Token expired**
- Implement token refresh flow
- Prompt user to re-authenticate

## Resources

- [Facebook Login for Business Docs](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business)
- [Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)
