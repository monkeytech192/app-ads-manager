# Hướng Dẫn Deploy và Cấu Hình

## 🚀 Tóm Tắt Nhanh

**Chỉ cần 6 biến BẮT BUỘC:**
1. `VITE_API_URL` - URL backend
2. `VITE_FB_APP_ID` - Facebook App ID
3. `MONGODB_URI` - MongoDB connection string
4. `JWT_SECRET` - Random secret key (32+ ký tự)
5. `FACEBOOK_APP_SECRET` - Facebook App Secret
6. **`FACEBOOK_ACCESS_TOKEN`** - Long-lived Facebook Access Token (60 ngày)

**Tùy chọn:**
- `VITE_FB_CONFIG_ID` - Chỉ nếu dùng Business
- `GEMINI_API_KEY` - Chỉ nếu dùng AI

**LƯU Ý:** `FACEBOOK_ACCESS_TOKEN` là biến mới, BẮT BUỘC để truy xuất dữ liệu quảng cáo. Xem [FACEBOOK_LOGIN.md](docs/FACEBOOK_LOGIN.md) để biết cách lấy.

---

## 📋 Quy Trình Deploy (ĐÚNG THỨ TỰ!)

### Bước 1: Deploy Backend Trước

**Tại sao?** Cần có URL backend để config frontend và Facebook callback.

#### Option A: Railway (Khuyến nghị)

1. **Tạo tài khoản:** [railway.app](https://railway.app)
2. **Deploy từ GitHub:**
   - New Project → Deploy from GitHub repo
   - Chọn repo của bạn
   - Railway tự detect và deploy

3. **Thêm biến môi trường:**
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ads-manager
   JWT_SECRET=uF9vQ3kA7L2mZP6D8sX4NwEJcH0R5YbT
   FACEBOOK_APP_SECRET=your_app_secret
   FACEBOOK_ACCESS_TOKEN=EAAxxxxx_your_long_lived_token
   ```
   
   **CHÚ Ý:** `FACEBOOK_ACCESS_TOKEN` là token dài hạn (60 ngày) để truy xuất ads data. Xem [FACEBOOK_LOGIN.md](docs/FACEBOOK_LOGIN.md#-phần-2-setup-access-token-cho-ads-data---bắt-buộc) để biết cách lấy.

4. **Lấy domain backend:**
   - Settings → Generate Domain
   - Railway sẽ tạo URL: `https://your-app-production.up.railway.app`
   - Hoặc custom domain nếu có

#### Option B: Vercel (Frontend + Backend cùng domain)

1. **Deploy:**
   - New Project → Import Git Repository
   - Root Directory: để trống (cả monorepo)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`

2. **Thêm biến môi trường** (giống Railway)

3. **Custom Domain (nếu có):**
   - Settings → Domains
   - Add: `app-ads.tiemtocchu3.vn`

---

### Bước 2: Cấu Hình MongoDB Atlas

1. **Tạo cluster FREE:** [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Whitelist IPs:**
   - Network Access → Add IP Address
   - **Chọn:** Allow Access from Anywhere (`0.0.0.0/0`)
3. **Tạo Database User:**
   - Database Access → Add New User
   - Username: `admin`, Password: (tạo mạnh)
4. **Lấy Connection String:**
   - Connect → Drivers → Copy string
   - Thay `<password>` và database name
   ```
   mongodb+srv://admin:YourPassword@cluster.mongodb.net/ads-manager
   ```

---

### Bước 3: Cấu Hình Facebook App

**LƯU Ý QUAN TRỌNG:** Facebook KHÔNG cho phép localhost trong production!

1. **Tạo Facebook App:**
   - [developers.facebook.com/apps](https://developers.facebook.com/apps)
   - Create App → Consumer/Business type

2. **Thêm Facebook Login:**
   - Add Product → Facebook Login → Settings

3. **Cấu hình URIs (DÙNG DOMAIN THẬT):**
   ```
   Valid OAuth Redirect URIs:
   https://your-app.vercel.app
   https://yourdomain.com
   ```
   
   **❌ KHÔNG dùng:** `http://localhost:5173`
   
   **✅ Dùng:** Domain thật từ Vercel/Railway

4. **Lấy credentials:**
   - Settings → Basic
   - Copy: **App ID** và **App Secret**

5. **App Review (Quan trọng!):**
   - App Review → Request: `ads_read`, `ads_management`
   - Cung cấp use case cho Facebook
   - Chờ approve (~3-7 ngày)

---

### Bước 4: Deploy Frontend

1. **Thêm biến môi trường:**
   ```env
   VITE_API_URL=https://app-ads.tiemtocchu3.vn/api/v1
   VITE_FB_APP_ID=616155604752940
   ```

2. **Deploy:**
   - Vercel: tự động redeploy khi push code
   - Netlify: tương tự

3. **Custom Domain (nếu cùng domain với backend):**
   - Vercel tự động handle routing
   - Hoặc dùng subdomain: `app.tiemtocchu3.vn`

---

## 🔑 Tạo JWT Secret Ngẫu Nhiên

```bash
# Dùng OpenSSL
openssl rand -base64 32

# Hoặc Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Hoặc online: https://generate-random.org/api-token-generator
```

**Kết quả:** `uF9vQ3kA7L2mZP6D8sX4NwEJcH0R5YbT`

---

## � Lấy Facebook Access Token (BẮT BUỘC)

Access Token dài hạn cần để backend truy xuất dữ liệu quảng cáo.

### Cách Nhanh:

1. **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
2. Chọn app → **Generate Access Token**
3. Chọn permissions: `ads_read`, `ads_management`, `business_management`
4. Click biểu tượng **ⓘ** → **Open in Access Token Tool**
5. Click **Extend Access Token** → Copy Long-Lived Token (60 ngày)

### Hướng Dẫn Chi Tiết:

Xem [FACEBOOK_LOGIN.md - PHẦN 2](docs/FACEBOOK_LOGIN.md#-phần-2-setup-access-token-cho-ads-data---bắt-buộc)

---

## 📝 Checklist Deploy

### Backend (Railway/Vercel)
- [ ] Deploy và có domain: `https://your-app-production.up.railway.app`
- [ ] Set `MONGODB_URI`
- [ ] Set `JWT_SECRET` (random 32+ chars)
- [ ] Set `FACEBOOK_APP_SECRET`
- [ ] **Set `FACEBOOK_ACCESS_TOKEN` (long-lived 60 ngày)**
- [ ] Test API: `https://your-domain.com/health`

### MongoDB Atlas
- [ ] Cluster đã tạo (M0 FREE)
- [ ] IP Whitelist: `0.0.0.0/0` (Allow all)
- [ ] Database User đã tạo
- [ ] Connection string đã test

### Facebook App
- [ ] App đã tạo
- [ ] Facebook Login đã enable
- [ ] OAuth URIs: `https://your-domain.com` (KHÔNG localhost!)
- [ ] **Access Token đã lấy và extend (60 ngày)**
- [ ] App Mode: Development (test) → Live (nếu cần public)

### Frontend (Vercel/Netlify)
- [ ] Deploy thành công
- [ ] Set `VITE_API_URL`
- [ ] Set `VITE_FB_APP_ID`
- [ ] Domain: `https://your-app.vercel.app` hoặc custom domain
- [ ] Test login Facebook

---

## 🎯 Ví Dụ Cấu Hình Thực Tế

### Railway Variables (Backend)
```env
MONGODB_URI=mongodb+srv://admin:jWYoqF3GQkkuMlY@cluster0.mongodb.net/ads-manager
JWT_SECRET=uF9vQ3kA7L2mZP6D8sX4NwEJcH0R5YbT
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq
GEMINI_API_KEY=AIzaSy... (optional)
```

### Vercel Variables (Frontend)
```env
VITE_API_URL=https://your-app-production.up.railway.app/api/v1
VITE_FB_APP_ID=616155604752940
VITE_FB_CONFIG_ID=883107134291277
```

---

## ❓ FAQ

### Q: Tại sao không dùng localhost?
**A:** Facebook chặn localhost trong production apps. Phải dùng domain thật (HTTPS).

### Q: Deploy local để test được không?
**A:** Không. Phải deploy lên server có domain thật. Dùng Railway/Vercel FREE.

### Q: Cần bao nhiêu biến môi trường?
**A:** Tối thiểu 5 biến BẮT BUỘC. Còn lại tùy chọn.

### Q: Deploy mất bao lâu?
**A:** 
- Railway: ~5 phút
- MongoDB Atlas: ~3 phút
- Facebook App: ~5 phút
- **Tổng: ~15 phút**

### Q: Chi phí?
**A:**
- Railway: $5 FREE credit/tháng (~500h)
- Vercel: FREE (Hobby plan)
- MongoDB Atlas: FREE (M0 cluster)
- **Tổng: $0-5/tháng**

---

## 🔒 Security Checklist

- [ ] Không commit `.env` lên Git
- [ ] JWT_SECRET đủ dài (32+ chars)
- [ ] MongoDB Whitelist: Chỉ Railway IPs (production) hoặc 0.0.0.0/0 (dev)
- [ ] Facebook App Secret: Chỉ ở server, KHÔNG để client
- [ ] HTTPS cho production domain
- [ ] Environment variables đúng platform (Railway/Vercel)

---

## 📚 Tham Khảo

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Tutorial](https://docs.mongodb.com/atlas)
- [Facebook App Setup](https://developers.facebook.com/docs/development/create-an-app)
