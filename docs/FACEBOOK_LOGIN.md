# Hướng Dẫn Cấu Hình Facebook Login

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
   - Cloudflare tunnels (`*.trycloudflare.com`)
   
   **✅ PHẢI dùng:**
   - Domain thật từ Vercel/Railway/Netlify
   - HTTPS (bắt buộc)
   
3. Click **Save Changes**

**Cách lấy domain:**
- Deploy app lên Vercel/Railway trước
- Copy domain được cấp (vd: `https://your-app.vercel.app`)
- Hoặc custom domain (vd: `https://yourdomain.com`)

#### Bước 4: App Review (Quan trọng!)
1. Vào **App Review** → **Permissions and Features**
2. Request các permissions sau:
   - `ads_read` - Đọc dữ liệu quảng cáo
   - `ads_management` - Quản lý quảng cáo
   - `business_management` - Truy cập business assets

**Lưu ý:** App phải được review và approve bởi Facebook mới hoạt động cho users khác ngoài admins/testers.

#### Bước 5: Cấu hình .env
```env
VITE_FB_APP_ID=your_app_id_here
VITE_FB_CONFIG_ID=
VITE_FB_BUSINESS_CONFIG_ID=
```

**Chỉ cần App ID, không cần Config IDs!**

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

Ứng dụng **tự động phát hiện** và chọn phương thức phù hợp:

```typescript
// Nếu có VITE_FB_CONFIG_ID → Dùng Login for Business
// Nếu không → Fallback sang Standard Login với scope

if (FACEBOOK_CONFIG_ID) {
    // Facebook Login for Business
    loginOptions.config_id = FACEBOOK_CONFIG_ID;
} else {
    // Standard Facebook Login
    loginOptions.scope = 'public_profile,email,ads_read,ads_management';
}
```

---

## Khuyến Nghị

### Dành cho Demo/Testing:
✅ **Dùng Standard Facebook Login**
- Không cần config_id
- Chỉ cần App ID
- Đơn giản, nhanh chóng

### Dành cho Production/Business:
✅ **Dùng Facebook Login for Business**
- Token lifetime dài hơn
- Quản lý permissions tốt hơn
- Phù hợp với business use case

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

## Tài Liệu Tham Khảo

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business)
- [Marketing API Permissions](https://developers.facebook.com/docs/marketing-api/overview/authorization)
- [App Review Process](https://developers.facebook.com/docs/app-review)
