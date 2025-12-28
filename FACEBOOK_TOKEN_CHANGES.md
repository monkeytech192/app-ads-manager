# Thay Đổi: Tách Biệt Facebook Login và Access Token

## 📋 Tóm Tắt

Dự án đã được cập nhật để **tách biệt** 2 loại Facebook Token:

### 1. Login Token (Authentication)
- **Mục đích:** CHỈ để đăng nhập/xác thực user
- **Cách hoạt động:** Tự động qua Facebook Login SDK
- **Permissions:** `public_profile`, `email`
- **Thời hạn:** 1-2 giờ (short-lived)

### 2. Access Token (Ads Data)
- **Mục đích:** CHỈ để truy xuất dữ liệu quảng cáo
- **Cách hoạt động:** Admin cấu hình trong `.env`
- **Permissions:** `ads_read`, `ads_management`, `business_management`
- **Thời hạn:** 60 ngày (long-lived)
- **Biến môi trường:** `FACEBOOK_ACCESS_TOKEN`

---

## 🔧 Các File Đã Thay Đổi

### 1. `.env.example`
**Thêm biến mới:**
```env
# Frontend (optional)
VITE_FB_ACCESS_TOKEN=your_long_lived_facebook_access_token

# Backend (BẮT BUỘC)
FACEBOOK_ACCESS_TOKEN=your_long_lived_facebook_access_token
```

**Thêm phần giải thích:**
- Hướng dẫn cách lấy long-lived token
- Giải thích sự khác biệt giữa 2 loại token

### 2. `client/src/services/facebookService.ts`
**Thay đổi:**
- Thêm header comment giải thích file này CHỈ cho authentication
- Cập nhật `loginWithFacebook()` và `loginWithFacebookPersonal()`:
  - Chỉ request permissions: `public_profile`, `email`
  - Loại bỏ: `ads_read`, `ads_management`, `business_management`
- Thêm comment rõ ràng về mục đích từng function

### 3. `server/src/api/controllers/facebookController.ts`
**Thay đổi lớn:**
- Thêm header comment giải thích 2 loại token
- Thêm constant: `FACEBOOK_ACCESS_TOKEN` từ `process.env`
- `getUserProfile()`: Giữ nguyên (dùng login token từ request)
- `getAdAccounts()`: 
  - Loại bỏ `access_token` từ request body
  - Dùng `FACEBOOK_ACCESS_TOKEN` từ .env
  - Thêm validation check token có tồn tại
- `getCampaigns()`:
  - Loại bỏ `access_token` từ request body
  - Dùng `FACEBOOK_ACCESS_TOKEN` từ .env
  - Thêm validation check token
- `getCampaignInsights()`:
  - Loại bỏ `access_token` từ request body
  - Dùng `FACEBOOK_ACCESS_TOKEN` từ .env
  - Thêm validation check token

### 4. `README.md`
**Cập nhật:**
- Phần "Tính Năng": Thêm section giải thích về 2 loại token
- Phần "Biến Môi Trường": 
  - Tăng từ 5 lên 6 biến BẮT BUỘC
  - Thêm `FACEBOOK_ACCESS_TOKEN`
- Phần "Quick Reference": Thêm dòng hướng dẫn lấy Access Token

### 5. `docs/FACEBOOK_LOGIN.md`
**Cập nhật lớn:**
- Thêm header warning về 2 loại token
- Tách thành 2 PHẦN:
  - **PHẦN 1:** Setup Facebook Login (Authentication)
  - **PHẦN 2:** Setup Access Token (Ads Data) - MỚI
- Bước 4 App Review: Cập nhật giải thích không cần review ads permissions cho login
- Phần "So Sánh": Thêm bảng so sánh 2 loại token
- Phần "Cách Ứng Dụng Xử Lý": Cập nhật flow mới
- Phần "PHẦN 2" MỚI bao gồm:
  - Hướng dẫn chi tiết lấy User Access Token
  - Cách extend thành long-lived token (60 ngày)
  - Verify token
  - Cấu hình .env
  - Lưu ý bảo mật
  - Cách renew token sau 60 ngày

### 6. `DEPLOY.md`
**Cập nhật:**
- Tóm tắt: Tăng từ 5 lên 6 biến BẮT BUỘC
- Bước 1 Deploy Backend: Thêm `FACEBOOK_ACCESS_TOKEN` vào env variables
- Thêm section mới: "Lấy Facebook Access Token" với hướng dẫn nhanh
- Checklist Deploy:
  - Backend: Thêm checkbox `FACEBOOK_ACCESS_TOKEN`
  - Facebook App: Cập nhật checklist về access token

---

## 🚀 Hướng Dẫn Migrate Cho Users Hiện Tại

Nếu bạn đã deploy dự án này trước đây, cần thực hiện:

### Bước 1: Lấy Long-lived Access Token

1. Truy cập: https://developers.facebook.com/tools/explorer/
2. Chọn app của bạn
3. Click **Generate Access Token**
4. Chọn permissions: `ads_read`, `ads_management`, `business_management`
5. Click biểu tượng **ⓘ** → **Open in Access Token Tool**
6. Click **Extend Access Token**
7. Copy long-lived token (60 ngày)

### Bước 2: Thêm vào Environment Variables

**Railway:**
1. Vào Dashboard → Variables
2. Thêm: `FACEBOOK_ACCESS_TOKEN` = `<token của bạn>`
3. Save → Auto redeploy

**Vercel:**
1. Vào Settings → Environment Variables
2. Thêm: `FACEBOOK_ACCESS_TOKEN` = `<token của bạn>`
3. Redeploy

### Bước 3: Test

1. Login vào app (vẫn hoạt động bình thường)
2. Thử truy cập Dashboard hoặc Campaigns
3. Backend sẽ tự động dùng token mới từ .env

---

## ✅ Lợi Ích Của Thay Đổi Này

### 1. Bảo Mật Cao Hơn
- Access token với quyền cao không còn expose qua browser
- Chỉ backend server có quyền truy cập token
- Giảm nguy cơ token bị đánh cắp

### 2. Ổn Định Hơn
- Token dài hạn (60 ngày) thay vì 1-2 giờ
- Không bị logout giữa chừng khi truy xuất ads data
- Backend không phụ thuộc vào login token của user

### 3. Đơn Giản Hơn
- Frontend không cần quản lý token cho ads API
- User chỉ cần login để xác thực, không cần cấp ads permissions
- API calls đơn giản hơn (không cần gửi token)

### 4. Linh Hoạt Hơn
- Admin control token riêng cho từng deployment
- Dễ rotate/renew token khi cần
- Có thể dùng token của nhiều accounts khác nhau

### 5. Tuân Thủ Best Practices
- Tách biệt authentication và authorization
- Server-side handling cho sensitive operations
- Client-side chỉ handle UI/UX

---

## 🔄 Breaking Changes

### API Changes (Backend)

**CŨ:**
```typescript
// Frontend gửi access_token trong request body
const response = await fetch('/api/facebook/campaigns', {
  method: 'POST',
  body: JSON.stringify({
    access_token: userToken,
    ad_account_id: '123'
  })
});
```

**MỚI:**
```typescript
// Frontend KHÔNG cần gửi access_token
// Backend tự động dùng FACEBOOK_ACCESS_TOKEN từ .env
const response = await fetch('/api/facebook/campaigns', {
  method: 'POST',
  body: JSON.stringify({
    ad_account_id: '123'
  })
});
```

### Login Changes (Frontend)

**CŨ:**
```typescript
// Login request nhiều permissions
scope: 'public_profile,email,ads_read,ads_management,business_management'
```

**MỚI:**
```typescript
// Login CHỈ request basic permissions
scope: 'public_profile,email'
```

---

## 📞 Support

Nếu gặp vấn đề khi migrate:

1. **Kiểm tra token:** https://developers.facebook.com/tools/debug/accesstoken/
2. **Đọc docs:** `docs/FACEBOOK_LOGIN.md` - PHẦN 2
3. **Check logs:** Backend logs sẽ báo nếu thiếu `FACEBOOK_ACCESS_TOKEN`

---

## 🔗 Links Hữu Ích

- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Extending Access Tokens Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)
- [Marketing API Documentation](https://developers.facebook.com/docs/marketing-api)

---

**Ngày cập nhật:** 28/12/2025
