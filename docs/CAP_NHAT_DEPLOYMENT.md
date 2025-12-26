# Cập Nhật Deployment Settings

> ✅ **ĐÃ FIX**: vercel.json đã được cập nhật trong commit `eac6ada`. Giờ chỉ cần **Redeploy** để Vercel sử dụng commit mới!

## 🎯 Quick Fix

### Nếu Vercel deployment đang fail với lỗi "cd: client: No such file or directory":

**Nguyên nhân:** Vercel đang deploy commit cũ (c836834) chưa có fix

**Giải pháp - 2 phút:**
1. Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click project: **ads-manager-brutalist**
3. Tab **Deployments**
4. Click **Redeploy** (nút 3 chấm ⋯ bên phải deployment)
5. Chọn **Use latest commit** (eac6ada)

✅ **XONG!** Không cần thay đổi Root Directory hay settings gì khác.

---

## 📖 Hướng Dẫn Đầy Đủ (Nếu Cần)

### Tổng Quan Thay Đổi

**Thay đổi cấu trúc:**
```
Trước:           →    Sau:
src/             →    client/src/
backend/         →    server/
index.html       →    client/index.html
package.json     →    client/package.json
```

---

## 1️⃣ Railway Backend (Cần Setup)

> ⚠️ Railway VẪN CẦN cập nhật Root Directory = `server`

### Bước 1: Truy cập Vercel Dashboard
1. Vào [vercel.com](https://vercel.com)
2. Đăng nhập
3. Click vào project: **ads-manager-brutalist**

### Bước 2: Vào Settings
1. Click tab **Settings** (thanh menu bên trái)
2. Scroll xuống phần **Build & Development Settings**

### Bước 3: Cập Nhật Root Directory
1. Tìm mục **Root Directory**
2. Click nút **Edit** bên cạnh
3. Nhập: `client`
4. Click **Save**

### Bước 4: Cập Nhật Build Settings (nếu cần)
Verify các settings sau (thường Vercel tự detect):

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Bước 5: Redeploy
1. Quay lại tab **Deployments**
2. Click deployment mới nhất
3. Click nút **Redeploy**
4. Hoặc đợi Vercel tự động deploy từ GitHub commit

### ✅ Kiểm Tra
- Vào URL: `https://app-ads.tiemtocchu3.vn`
- Nếu thấy app hiển thị bình thường → Thành công!
- Nếu bị lỗi → Check deployment logs

---

## 2️⃣ Cập Nhật Railway (Backend)

### Bước 1: Truy cập Railway Dashboard
1. Vào [railway.app](https://railway.app)
2. Đăng nhập
3. Click vào project: **app-ads-manager**
4. Click vào service: **app-ads-manager** (backend service)

### Bước 2: Vào Settings
1. Click tab **Settings** (bên trái)
2. Scroll xuống phần **Build & Deploy**

### Bước 3: Cập Nhật Root Directory
1. Tìm mục **Root Directory**
2. Nhập: `server`
3. Railway tự động save

### Bước 4: Cập Nhật Build/Start Commands (nếu cần)

Verify các settings sau:

```
Build Command: npm install && npm run build
Start Command: npm start
```

**Nếu chưa có, thêm vào:**
1. Click **+ New Variable** hoặc Edit Build Command
2. Nhập commands ở trên

### Bước 5: Trigger Redeploy
Railway sẽ tự động redeploy khi detect thay đổi settings.

**Hoặc manual trigger:**
1. Quay lại tab **Deployments**
2. Click **Deploy**
3. Chọn **Redeploy Latest**

### ✅ Kiểm Tra
- Vào URL: `https://app-ads-manager-production.up.railway.app/api/v1/health`
- Nếu thấy response: `{"status":"ok"}` → Thành công!
- Nếu bị lỗi → Check deployment logs

---

## 3️⃣ Kiểm Tra Biến Môi Trường

### Vercel Environment Variables
Vào **Settings** → **Environment Variables**

**Cần có:**
```bash
VITE_API_URL=https://app-ads-manager-production.up.railway.app/api/v1
VITE_FB_APP_ID=your_facebook_app_id
VITE_FB_CONFIG_ID=your_fb_config_id
VITE_FB_BUSINESS_CONFIG_ID=your_fb_business_config_id
VITE_GEMINI_API_KEY=your_gemini_key (optional)
```

### Railway Environment Variables
Vào **Variables** tab

**Cần có:**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REMEMBER_EXPIRE=30d
```

---

## 4️⃣ Xử Lý Lỗi Thường Gặp

### ❌ Vercel: "No package.json found"
**Nguyên nhân:** Root Directory chưa được set thành `client`

**Giải pháp:**
1. Settings → Root Directory → `client`
2. Redeploy

### ❌ Railway: "Cannot find module"
**Nguyên nhân:** Root Directory chưa được set thành `server`

**Giải pháp:**
1. Settings → Root Directory → `server`
2. Wait for auto redeploy hoặc trigger manual

### ❌ Vercel: Build thành công nhưng app bị lỗi 404
**Nguyên nhân:** Output Directory sai

**Giải pháp:**
1. Settings → Output Directory → `dist`
2. Redeploy

### ❌ Railway: "Module not found: @/models/User"
**Nguyên nhân:** Import paths sai sau khi move files

**Giải pháp:**
- Đã fix trong commit mới: imports đã được cập nhật
- Redeploy sẽ resolve

---

## 5️⃣ Checklist Hoàn Thành

### Vercel ✅
- [ ] Root Directory = `client`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Environment Variables đã set đầy đủ
- [ ] Deployment thành công (green ✓)
- [ ] App truy cập được qua domain

### Railway ✅
- [ ] Root Directory = `server`
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] Environment Variables đã set đầy đủ
- [ ] Deployment thành công (green ✓)
- [ ] API endpoint trả về response

---

## 6️⃣ Deployment Workflow Sau Khi Setup

### Workflow Tự Động
```
1. Push code lên GitHub (main branch)
   ↓
2. Vercel detect commit → Auto deploy frontend
   ↓
3. Railway detect commit → Auto deploy backend
   ↓
4. ✅ Cả 2 services đều deploy thành công
```

### Nếu Cần Deploy Manual
**Vercel:**
1. Deployments tab → Click deployment
2. Click **Redeploy**

**Railway:**
1. Deployments tab → Click **Deploy**
2. Chọn commit muốn deploy

---

## 📞 Support

Nếu gặp vấn đề:
1. Check deployment logs trên Vercel/Railway
2. Verify Root Directory settings
3. Check Environment Variables
4. Review commit history trên GitHub

**Railway Logs:**
- Deployments → Click deployment → View Logs

**Vercel Logs:**
- Deployments → Click deployment → Function Logs / Build Logs

---

## 🎉 Xong!

Sau khi setup xong, bạn chỉ cần:
1. Code changes
2. Git commit & push
3. Vercel + Railway tự động deploy

**Không cần làm gì thêm!** 🚀
