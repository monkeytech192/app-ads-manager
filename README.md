# Ads Manager - Quản Lý Quảng Cáo Facebook

> Ứng dụng quản lý quảng cáo Facebook chuyên nghiệp với giao diện Brutalist độc đáo

> 📌 **LƯU Ý:** Docs này dùng **placeholders** như `your-app.vercel.app`. Thay bằng domain thật của bạn sau khi deploy! Xem [docs/DOMAIN_GUIDE.md](docs/DOMAIN_GUIDE.md)

## 🌟 Tính Năng

- 🔐 **Đăng nhập Facebook** - Xác thực user với Facebook Login
- 📊 **Dashboard Thời Gian Thực** - Theo dõi hiệu suất chiến dịch 
- 🎯 **Quản Lý Chiến Dịch** - Tạo, sửa, xóa chiến dịch quảng cáo
- 📈 **Phân Tích Chi Tiết** - Biểu đồ và số liệu chi tiết
- 🤖 **Đề Xuất AI** - Tối ưu bằng Google Gemini (optional)
- 📱 **PWA** - Cài đặt như app mobile
- 🎨 **Giao diện Brutalist** - Thiết kế táo bạo, tối giản

### 🔑 Về Facebook Access Token

App sử dụng **2 loại token riêng biệt**:

1. **Login Token** (tự động):
   - Dùng CHỈ cho đăng nhập/authentication user
   - Tạo tự động qua Facebook Login SDK
   - Token ngắn hạn (1-2 giờ)

2. **Access Token** (cấu hình trong .env):
   - Dùng CHỈ cho truy xuất dữ liệu quảng cáo (campaigns, metrics)
   - **BẮT BUỘC** phải cấu hình `FACEBOOK_ACCESS_TOKEN` trong .env
   - Token dài hạn (60 ngày)
   - Lấy từ: [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Permissions cần: `ads_read`, `ads_management`, `business_management`

## 🛠️ Công Nghệ

### Frontend
- React 19 + TypeScript
- Vite - Build siêu nhanh
- Tailwind CSS
- Lucide Icons
- PWA

### Backend
- Node.js 20 + Express
- MongoDB + Mongoose
- JWT Authentication
- Facebook Marketing API
- Google Gemini AI (optional)

### Deploy
- **Frontend & Backend**: Vercel / Railway / Netlify
- **Database**: MongoDB Atlas (FREE tier)

---

## 🚀 Deploy Nhanh (15 phút)

> ⚠️ **QUAN TRỌNG:** App cần deploy lên server thật vì Facebook không hỗ trợ localhost.

### 5 Bước Deploy

1. **Deploy Backend** (Railway) → Lấy domain API
2. **Setup MongoDB** (Atlas FREE) → Lấy connection string  
3. **Tạo Facebook App** → Lấy App ID & Secret
4. **Deploy Frontend** (Vercel) → Config biến môi trường
5. **Hoàn thành!** → Truy cập app

### 📖 Hướng Dẫn Chi Tiết

- **[DEPLOY.md](DEPLOY.md)** - Hướng dẫn deploy từng bước (15 phút)
- **[.env.example](.env.example)** - 5 biến môi trường BẮT BUỘC
- **[docs/DOMAIN_GUIDE.md](docs/DOMAIN_GUIDE.md)** - Về placeholders và domain

### ⚡ Quick Reference

| Cần | Lấy Từ Đâu |
|-----|------------|
| Backend URL | Railway Dashboard → Domain |
| MongoDB URI | MongoDB Atlas → Connect → Drivers |
| Facebook App ID | developers.facebook.com/apps |
| Facebook App Secret | Facebook App → Settings → Basic |
| **Facebook Access Token** | **Graph API Explorer → Get User Access Token → Extend** |
| JWT Secret | `openssl rand -base64 32` |

**LƯU Ý:** `FACEBOOK_ACCESS_TOKEN` là BẮT BUỘC để truy xuất dữ liệu quảng cáo!

---

## 📋 Biến Môi Trường

**CHỈ 6 BIẾN BẮT BUỘC:**

```env
VITE_API_URL=https://your-railway-domain.up.railway.app/api/v1
VITE_FB_APP_ID=your_facebook_app_id
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ads-manager
JWT_SECRET=random_32_chars_minimum
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_long_lived_facebook_access_token
```

📖 **Chi tiết:** [.env.example](.env.example)

**LƯU Ý:** 
- Development local: Copy `.env.example` thành `.env` và điền giá trị
- Production: Nhập biến vào Railway/Vercel Dashboard (KHÔNG cần file .env)
- **QUAN TRỌNG**: `FACEBOOK_ACCESS_TOKEN` cần là long-lived token (60 ngày) có đủ permissions

---

## 📖 Tài Liệu

| File | Mục Đích |
|------|----------|
| **[DEPLOY.md](DEPLOY.md)** | 📦 Hướng dẫn deploy chi tiết từng bước |
| **[.env.example](.env.example)** | ⚙️ Template biến môi trường + giải thích |
| **[docs/DOMAIN_GUIDE.md](docs/DOMAIN_GUIDE.md)** | 🌐 Về placeholders và domain của bạn |
| **[docs/FACEBOOK_LOGIN.md](docs/FACEBOOK_LOGIN.md)** | 🔐 Setup Facebook Login (Standard & Business) |
| **[docs/REDIRECT_URI.md](docs/REDIRECT_URI.md)** | 🔗 Về OAuth Redirect URIs |

---

## 📱 Sử Dụng

### 1. Đăng Nhập Facebook
- Click "Login with Facebook"
- Cấp quyền truy cập Ad Accounts
- App hỗ trợ cả Personal và Business accounts

### 2. Dashboard
- Xem tổng quan hiệu suất campaigns
- Biểu đồ real-time
- Metrics: Impressions, Clicks, CTR, CPC, Conversions

### 3. Quản Lý Chiến Dịch
- Tạo/sửa/xóa campaigns
- Chỉnh budget, schedule
- Pause/Resume campaigns
- Chi tiết metrics từng campaign

### 4. Đề Xuất AI (Optional)
- Suggestions từ Google Gemini
- Tối ưu targeting & bidding
- Cải thiện ad creative

---

## 💰 Chi Phí Deploy

- **Railway**: $5 FREE credit/tháng (~500 giờ)
- **Vercel**: FREE (Hobby plan)
- **MongoDB Atlas**: FREE (M0 - 512MB)
- **Tổng: $0-5/tháng** (6-12 tháng đầu FREE)

---

## 🔒 Bảo Mật

- ✅ Không commit file `.env` lên Git
- ✅ JWT Secret tối thiểu 32 ký tự
- ✅ HTTPS cho production domain
- ✅ App Secret chỉ ở server, không expose ra client
- ✅ MongoDB whitelist phù hợp với environment

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón!

1. Fork repo
2. Tạo branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

---

## 📝 License

MIT License - Xem file [LICENSE.md](LICENSE.md)

---

## 👤 Tác Giả

**Monkey Tech**

---

## 📞 Hỗ Trợ

Gặp vấn đề? Tạo [issue trên GitHub](../../issues)

---

**Được xây dựng với ❤️ bằng React + Node.js**
