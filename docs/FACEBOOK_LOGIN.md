# Hướng Dẫn Cấu Hình Facebook Login

## ⚠️ LƯU Ý QUAN TRỌNG

Ứng dụng sử dụng **2 LOẠI TOKEN RIÊNG BIỆT**:

### 1. Login Token (Tự động)
- **Mục đích:** CHỈ để đăng nhập/authentication user
- **Cách lấy:** Tự động qua Facebook Login SDK khi user click "Đăng nhập"
- **Permissions:** `public_profile`, `email`
- **Thời hạn:** 1-2 giờ (short-lived)
- **Sử dụng:** Verify user identity, lấy profile (name, email, avatar)

### 2. Access Token (Cấu hình .env - BẮT BUỘC)
- **Mục đích:** CHỈ để truy xuất dữ liệu quảng cáo (campaigns, metrics, insights)
- **Cách lấy:** Admin tạo từ Graph API Explorer và config trong .env
- **Permissions:** `ads_read`, `ads_management`, `business_management`
- **Thời hạn:** 60 ngày (long-lived)
- **Sử dụng:** Backend sử dụng để gọi Facebook Marketing API
- **Biến môi trường:** `FACEBOOK_ACCESS_TOKEN`

### Tại Sao Tách Biệt?

✅ **Bảo mật:** Access token có quyền cao không nên expose qua browser  
✅ **Ổn định:** Token dài hạn không bị expired giữa chừng  
✅ **Đơn giản:** Frontend không cần quản lý token cho ads data  
✅ **Linh hoạt:** Admin control token riêng cho từng deployment

---

## 🔐 PHẦN 1: Setup Facebook Login (Cho Authentication)

Ứng dụng hỗ trợ **2 loại đăng nhập Facebook**:

## 1. Standard Facebook Login (Dành cho mọi user)

### Phù hợp với:
- ✅ Tài khoản Facebook cá nhân có quyền quản lý quảng cáo
- ✅ Personal Ad Accounts
- ✅ Không cần Business Manager

### Cách thiết lập:

#### Bước 1: Tạo Facebook App
1. Truy cập [Facebook Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Chọn loại: **Consumer** hoặc **Business**
4. Điền thông tin app

#### Bước 2: Thêm Facebook Login
1. Trong App Dashboard → **Add Product**
2. Chọn **Facebook Login** → **Set Up**
3. Chọn platform: **Web**
4. Điền **Site URL**: `http://localhost:5173` (dev) hoặc domain của bạn

#### Bước 3: Cấu hình OAuth Redirect URIs

**⚠️ QUAN TRỌNG: Facebook KHÔNG cho phép localhost trong production!**

1. Vào **Facebook Login** → **Settings**
2. Thêm **Valid OAuth Redirect URIs**:
   ```
   https://your-app.vercel.app
   https://yourdomain.com
   ```
   
   **❌ KHÔNG dùng:**
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   
   **✅ PHẢI dùng:**
   - Domain thật từ Vercel/Railway/Netlify
   - HTTPS (bắt buộc)
   
3. Click **Save Changes**

**Cách lấy domain:**
- Deploy app lên Vercel/Railway trước
- Copy domain được cấp (vd: `https://your-app.vercel.app`)
- Hoặc custom domain (vd: `https://yourdomain.com`)

#### Bước 4: App Review (Quan trọng!)

**LƯU Ý:** App Review chỉ cần cho **đăng nhập public users**, không ảnh hưởng đến Access Token từ .env

1. Vào **App Review** → **Permissions and Features**
2. **KHÔNG CẦN** request `ads_read`, `ads_management` cho login
   - Login chỉ cần `public_profile`, `email` (default, không cần review)
3. Permissions cho ads data được quản lý qua Access Token (từ Graph API Explorer)
4. App Review chỉ cần khi muốn public app cho users khác login

**Cho Development/Testing:**
- Không cần App Review
- Dùng Test Users hoặc Admin/Developer accounts
- Access Token vẫn hoạt động bình thường

#### Bước 5: Cấu hình .env
```env
VITE_FB_APP_ID=your_app_id_here
VITE_FB_CONFIG_ID=
VITE_FB_BUSINESS_CONFIG_ID=
```

**Chỉ cần App ID cho login, không cần Config IDs!**

**LƯU Ý:** Login này CHỈ dùng để xác thực user. Để truy xuất ads data, xem PHẦN 2 bên dưới.

---

## 2. Facebook Login for Business (Nâng cao)

### Phù hợp với:
- ✅ Business Manager accounts
- ✅ Agency managing multiple clients
- ✅ Long-term, automated access
- ✅ System User Access Tokens

### Cách thiết lập:

#### Bước 1-3: Giống như Standard Login

#### Bước 4: Thêm Facebook Login for Business
1. Trong App Dashboard → **Add Product**
2. Chọn **Facebook Login for Business** → **Set Up**

#### Bước 5: Tạo Configuration
1. Vào **Facebook Login for Business** → **Configurations**
2. Click **+ Create configuration**

**User Access Token Configuration:**
- Configuration Name: `User Access Token`
- Access Token Type: **User access token**
- Token Expiration: `60 days`
- Select Assets: Ad Accounts, Pages (tùy chọn)
- Select Permissions: `ads_read`, `ads_management`, `business_management`
- Copy **Configuration ID**

**System User Configuration (Optional):**
- Configuration Name: `System User Token`
- Access Token Type: **System-user access token**
- Token Expiration: **Never expire**
- Permissions: Same as above
- Copy **Configuration ID**

#### Bước 6: Cấu hình .env
```env
VITE_FB_APP_ID=your_app_id
VITE_FB_CONFIG_ID=your_user_token_config_id
VITE_FB_BUSINESS_CONFIG_ID=your_system_token_config_id
```

---

## So Sánh 2 Phương Thức

| Tiêu chí | Standard Login | Login for Business |
|----------|---------------|-------------------|
| Độ phức tạp | ⭐ Đơn giản | ⭐⭐⭐ Phức tạp |
| Yêu cầu | Chỉ cần App ID | Cần Configuration ID |
| Business Manager | Không bắt buộc | Bắt buộc |
| Token lifetime | 60-90 ngày | 60 ngày - Never expire |
| App Review | Cần approve | Cần approve |
| Phù hợp | Personal users | Business/Agency |

---

## Cách Ứng Dụng Xử Lý

Ứng dụng **tự động phát hiện** và chọn phương thức phù hợp cho **login only**:

```typescript
// Login CHỈ yêu cầu public_profile, email
// KHÔNG yêu cầu ads permissions vì dùng FACEBOOK_ACCESS_TOKEN từ .env

if (FACEBOOK_CONFIG_ID) {
    // Facebook Login for Business
    loginOptions.config_id = FACEBOOK_CONFIG_ID;
} else {
    // Standard Facebook Login
    loginOptions.scope = 'public_profile,email';
}
```

**Ads Data API Flow:**
```
Frontend → Backend API → Backend sử dụng FACEBOOK_ACCESS_TOKEN từ .env → Facebook Marketing API
```

---

## Khuyến Nghị

### Dành cho Demo/Testing:
✅ **Dùng Standard Facebook Login** (cho authentication)
- Không cần config_id
- Chỉ cần App ID
- Đơn giản, nhanh chóng

✅ **Dùng Access Token từ .env** (cho ads data)
- Lấy từ Graph API Explorer
- Extend thành long-lived (60 ngày)
- Config vào backend .env

### Dành cho Production/Business:
✅ **Standard Login vẫn đủ** (cho authentication)
- Login chỉ cần verify user identity
- Không cần Business Login

✅ **Access Token từ Admin Account** (cho ads data)
- Dùng token của Admin có quyền truy cập ads
- Extend thành long-lived
- Rotate token định kỳ

---

## Troubleshooting

### Lỗi: "App Not Set Up"
**Nguyên nhân:** App chưa được setup hoặc domain chưa được thêm vào whitelist

**Giải pháp:**
1. Kiểm tra **App Domains** trong Settings → Basic
2. Thêm domain vào **Valid OAuth Redirect URIs**
3. Đảm bảo app đang ở **Live** mode (không phải Development)

### Lỗi: "This app doesn't have permission to access this data"
**Nguyên nhân:** Permissions chưa được approve

**Giải pháp:**
1. Vào **App Review** → Request permissions
2. Test với Test Users trong Development mode
3. Sau khi approved mới public cho users thật

### Lỗi: "redirect_uri is not whitelisted"
**Nguyên nhân:** URI chưa được thêm vào whitelist

**Giải pháp:**
1. Vào **Facebook Login** → **Settings**
2. Thêm URI vào **Valid OAuth Redirect URIs**
3. Đảm bảo URI khớp chính xác (http vs https, có/không có trailing slash)

---

## Testing trong Development Mode

Khi app ở **Development Mode**, chỉ những người sau có thể login:
- App Admins
- App Developers
- App Testers

**Cách thêm Test Users:**
1. Vào **Roles** → **Test Users**
2. Click **Add** → Tạo test user mới
3. Dùng test user để testing

**Chuyển sang Live Mode:**
1. Hoàn thành App Review
2. Vào **Settings** → **Basic**
3. Toggle **App Mode** từ Development → Live

---

## 🔑 PHẦN 2: Setup Access Token (Cho Ads Data - BẮT BUỘC)

Access Token dài hạn cần thiết để backend truy xuất dữ liệu quảng cáo.

### Bước 1: Lấy User Access Token

1. **Truy cập Graph API Explorer:**
   - Vào: https://developers.facebook.com/tools/explorer/

2. **Chọn App và Permissions:**
   - Dropdown **Meta App**: Chọn app của bạn
   - Click **Generate Access Token**
   - Chọn permissions:
     - ✅ `ads_read` - Đọc dữ liệu quảng cáo
     - ✅ `ads_management` - Quản lý quảng cáo
     - ✅ `business_management` - Truy cập business assets
   - Click **Generate Access Token**

3. **Copy Short-lived Token:**
   - Token xuất hiện trong ô **Access Token**
   - Copy token này (thời hạn 1-2 giờ)

### Bước 2: Extend Token Thành Long-lived (60 ngày)

**Option A: Dùng Graph API Explorer (Dễ nhất)**

1. Trong Graph API Explorer, click biểu tượng **ⓘ** bên cạnh Access Token
2. Click **Open in Access Token Tool**
3. Click **Extend Access Token**
4. Copy **Long-Lived Token** mới (hạn 60 ngày)

**Option B: Dùng API Request**

```bash
curl -i -X GET "https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

Thay:
- `YOUR_APP_ID`: Facebook App ID
- `YOUR_APP_SECRET`: Facebook App Secret
- `YOUR_SHORT_LIVED_TOKEN`: Token từ bước 1

Response:
```json
{
  "access_token": "EAAxxxxx...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

### Bước 3: Verify Token

Kiểm tra token có đúng permissions không:

```bash
curl -i -X GET "https://graph.facebook.com/v24.0/me?fields=id,name&access_token=YOUR_LONG_LIVED_TOKEN"
```

Hoặc dùng [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/):
- Paste token vào
- Kiểm tra:
  - ✅ **Expires:** Khoảng 60 ngày
  - ✅ **Scopes:** Có `ads_read`, `ads_management`, `business_management`
  - ✅ **Valid:** True

### Bước 4: Thêm vào .env

**Frontend (nếu cần):**
```env
VITE_FB_ACCESS_TOKEN=EAAxxxxx...your_long_lived_token
```

**Backend (BẮT BUỘC):**
```env
FACEBOOK_ACCESS_TOKEN=EAAxxxxx...your_long_lived_token
```

### Bước 5: Deploy lên Production

Khi deploy lên Railway/Vercel:
1. Vào **Environment Variables**
2. Thêm biến `FACEBOOK_ACCESS_TOKEN`
3. Paste long-lived token vào
4. Save và redeploy

---

## 📝 So Sánh 2 Loại Token

| Đặc điểm | Login Token | Access Token (.env) |
|----------|-------------|---------------------|
| **Mục đích** | Authentication user | Truy xuất ads data |
| **Cách lấy** | Tự động (SDK) | Manual (Graph API Explorer) |
| **Thời hạn** | 1-2 giờ | 60 ngày |
| **Permissions** | `public_profile`, `email` | `ads_read`, `ads_management`, `business_management` |
| **Nơi sử dụng** | Frontend + Backend (auth) | Backend only (ads API) |
| **Cấu hình** | VITE_FB_APP_ID | FACEBOOK_ACCESS_TOKEN |
| **Bắt buộc?** | Có (cho login) | Có (cho ads data) |

---

## ⚠️ Lưu Ý Bảo Mật

### Access Token (FACEBOOK_ACCESS_TOKEN):
- ❌ **KHÔNG** commit vào Git
- ❌ **KHÔNG** expose lên frontend/browser
- ❌ **KHÔNG** share public
- ✅ Chỉ config trên backend server (Railway/Vercel environment variables)
- ✅ Thay token mới khi gần hết hạn (60 ngày)
- ✅ Revoke token nếu bị lộ: [Token Tool](https://developers.facebook.com/tools/debug/accesstoken/)

### Login Token:
- ✅ OK để expose (qua SDK)
- ✅ Auto-managed bởi Facebook SDK
- ✅ Short-lived, tự động refresh

---

## 🔄 Renew Access Token (Sau 60 Ngày)

Khi token gần hết hạn:

1. **Check expiration:**
   - Dùng [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
   
2. **Renew token:**
   - Lặp lại PHẦN 2 để lấy token mới
   - Hoặc dùng API để extend (nếu còn trong hạn)

3. **Update .env:**
   - Thay token mới vào `FACEBOOK_ACCESS_TOKEN`
   - Redeploy app

---

## Tài Liệu Tham Khảo

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business)
- [Access Tokens Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [Extending Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)
- [Marketing API Permissions](https://developers.facebook.com/docs/marketing-api/overview/authorization)
- [App Review Process](https://developers.facebook.com/docs/app-review)
