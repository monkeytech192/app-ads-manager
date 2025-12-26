# 🚀 HƯỚNG DẪN DEPLOY: VERCEL + RAILWAY

## 💰 CHI PHÍ: **$0 - $5/THÁNG**
- **Vercel**: FREE (frontend)
- **Railway**: $0-5/tháng (server - dùng $5 credit FREE)
- **MongoDB Atlas**: FREE (database)

**Tổng: $0-2/tháng** (6-12 tháng đầu hoàn toàn FREE!)

---

## 📋 CHUẨN BỊ

### 1. Tài khoản cần thiết:
- ✅ **GitHub** account (để connect Vercel & Railway)
- ✅ **Vercel** account: https://vercel.com/signup
- ✅ **Railway** account: https://railway.app
- ✅ **MongoDB Atlas** account: https://www.mongodb.com/cloud/atlas/register

---

## Bước 1️⃣: Setup MongoDB Atlas (Database)

### 1.1. Tạo Free Cluster
1. Đăng nhập MongoDB Atlas: https://cloud.mongodb.com
2. Click **Build a Database** → Chọn **M0 Free**
3. Provider: **AWS**
4. Region: **Singapore** (ap-southeast-1)
5. Cluster Name: `ads-manager`
6. Click **Create**

### 1.2. Tạo Database User
1. **Security** → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `admin`
4. Password: Tạo password mạnh (click **Autogenerate** và copy)
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### 1.3. Whitelist All IPs
1. **Security** → **Network Access** → **Add IP Address**
2. Click **ALLOW ACCESS FROM ANYWHERE**
3. IP: `0.0.0.0/0` (tự động điền)
4. Click **Confirm**

### 1.4. Get Connection String
1. **Deployment** → **Database** → Click **Connect** trên cluster
2. Chọn **Connect your application**
3. Driver: **Node.js** / Version: **5.5 or later**
4. Copy connection string:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Thay `<password>` và thêm database name:
```
mongodb+srv://admin:YourActualPassword@cluster0.xxxxx.mongodb.net/ads-manager?retryWrites=true&w=majority
```

**LƯU LẠI CONNECTION STRING NÀY!**

---

## Bước 2️⃣: Push Code lên GitHub

### 2.1. Tạo repository trên GitHub
1. Vào https://github.com/new
2. Repository name: `ads-manager-brutalist`
3. Visibility: **Private** (hoặc Public)
4. Click **Create repository**

### 2.2. Push code local lên GitHub
```powershell
cd "c:\Users\Admin\Downloads\ads-manager-brutalist (1)"

# Init git (nếu chưa có)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/ads-manager-brutalist.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Vercel + Railway deployment ready"

# Push
git branch -M main
git push -u origin main
```

---

## Bước 3️⃣: Deploy server lên Railway

### 3.1. Tạo Project trên Railway
1. Đăng nhập Railway: https://railway.app
2. Click **New Project** → **Deploy from GitHub repo**
3. Authorize Railway với GitHub
4. Chọn repository: `ads-manager-brutalist`
5. Click **Deploy Now**

### 3.2. Configure Environment Variables
1. Click vào service vừa tạo
2. Click tab **Variables**
3. Thêm các biến sau:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/ads-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_random_key_here_change_this_123456789
JWT_EXPIRE=7d
JWT_REMEMBER_EXPIRE=30d
CORS_ORIGIN=https://yourdomain.com
```

**Tạo JWT_SECRET ngẫu nhiên:**
```powershell
# Chạy lệnh này để tạo random key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3.3. Configure Build Settings
1. Tab **Settings** → **Build**
2. **Root Directory**: `server`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Click **Save**

### 3.4. Enable Sleep Settings (tiết kiệm credit)
1. Tab **Settings** → **Service**
2. Scroll xuống **Sleep Mode**
3. Enable **Sleep after 15 minutes of inactivity**
4. Click **Save**

### 3.5. Get Railway URL
1. Tab **Settings** → **Domains**
2. Click **Generate Domain**
3. Railway sẽ cho bạn URL: `your-app-name.up.railway.app`
4. **COPY URL NÀY** - sẽ dùng cho Vercel!

### 3.6. Update CORS Origin
Quay lại **Variables**, sửa `CORS_ORIGIN`:
```
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://yourdomain.com
```
(Sẽ update chính xác sau khi có URL Vercel)

### 3.7. Test Railway Deployment
```powershell
curl https://your-app-name.up.railway.app/health
```

Kết quả phải trả về:
```json
{"success":true,"message":"Server is running"}
```

---

## Bước 4️⃣: Seed Database (Tạo dữ liệu mẫu)

### 4.1. Tạo Railway SSH Terminal
1. Trong Railway project, click **New** → **Empty Service**
2. Rename thành `seed-runner`
3. **Settings** → **Source** → Connect to same GitHub repo
4. **Variables**: Copy tất cả variables từ server service
5. **Build Command**: `cd server && npm install`
6. **Start Command**: `cd server && npm run seed`
7. Click **Deploy**

Seed sẽ chạy một lần, sau đó bạn có thể xóa service `seed-runner`.

### 4.2. Hoặc seed local (nếu có MongoDB Atlas access)
```powershell
cd server

# Tạo file .env
copy .env.example .env

# Chỉnh MONGODB_URI trong .env

# Chạy seed
npm run seed
```

Kết quả:
```
✅ Seed data created successfully!

📝 Login credentials:
   Email: admin@example.com
   Password: 123456
```

---

## Bước 5️⃣: Deploy Frontend lên Vercel

### 5.1. Update API URL
Chỉnh file `.env.production`:
```env
VITE_API_URL=https://your-app-name.up.railway.app/api/v1
```

Commit và push:
```powershell
git add .env.production
git commit -m "Update Railway API URL"
git push
```

### 5.2. Import Project vào Vercel
1. Đăng nhập Vercel: https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. **Import Git Repository** → Chọn `ads-manager-brutalist`
4. Click **Import**

### 5.3. Configure Build Settings
Vercel tự động detect Vite, nhưng double-check:
- **Framework Preset**: Vite
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5.4. Environment Variables
Click **Environment Variables**, thêm:
```
VITE_API_URL = https://your-app-name.up.railway.app/api/v1
```

### 5.5. Deploy
1. Click **Deploy**
2. Chờ 2-3 phút build
3. Done! Vercel cho bạn URL: `your-app.vercel.app`

---

## Bước 6️⃣: Setup Custom Domain (Optional)

### 6.1. Domain cho Frontend (Vercel)
1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add domain: `yourdomain.com` hoặc `ads.yourdomain.com`
3. Vercel đưa cho bạn DNS records
4. Vào quản lý domain, add records:
   - Type: **CNAME**
   - Name: `@` hoặc `ads`
   - Value: `cname.vercel-dns.com`
5. Chờ 5-60 phút propagate
6. Vercel tự động issue SSL

### 6.2. Domain cho server (Railway)
1. Railway Dashboard → Service → **Settings** → **Domains**
2. Click **Custom Domain**
3. Add: `api.yourdomain.com`
4. Railway đưa cho bạn CNAME target
5. Add DNS record:
   - Type: **CNAME**
   - Name: `api`
   - Value: Railway's target
6. Chờ propagate
7. Railway tự động SSL

### 6.3. Update CORS
Sau khi có custom domain, update lại Railway variables:
```
CORS_ORIGIN=https://yourdomain.com,https://ads.yourdomain.com
```

Redeploy Railway.

---

## Bước 7️⃣: Test Full Stack

### 7.1. Test API
```powershell
# Health check
curl https://api.yourdomain.com/health

# Test login
curl -X POST https://api.yourdomain.com/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"123456\"}'
```

### 7.2. Test Frontend
Mở trình duyệt: `https://yourdomain.com`

Login:
- Email: `admin@example.com`
- Password: `123456`

---

## 🎉 KẾT QUẢ

✅ **Frontend**: `https://yourdomain.com` (Vercel)
✅ **server**: `https://api.yourdomain.com` (Railway)
✅ **Database**: MongoDB Atlas Singapore (FREE)
✅ **SSL**: Tự động, miễn phí
✅ **Auto Deploy**: Git push → Auto deploy
✅ **Sleep Mode**: server ngủ sau 15 phút → Tiết kiệm credit

---

## 💰 MONITORING RAILWAY CREDIT

### Xem usage:
1. Railway Dashboard → Click avatar → **Account Settings**
2. Tab **Usage**
3. Xem **Current Usage** và **Estimated Monthly Cost**

### Tips tiết kiệm credit:
✅ Bật Sleep Mode (đã làm ở trên)
✅ Optimize Docker image (Alpine base)
✅ Limit RAM: 256-512MB (Settings → Resources)
✅ Dùng MongoDB Atlas external (không chạy MongoDB trên Railway)

**Với Sleep Mode: $5 credit đủ chạy 1-2 tháng!**

---

## 🔄 UPDATE CODE SAU NÀY

### Update Frontend:
```powershell
git add .
git commit -m "Update frontend"
git push
```
→ Vercel tự động deploy

### Update server:
```powershell
git add .
git commit -m "Update server"
git push
```
→ Railway tự động deploy

---

## 🛠️ TROUBLESHOOTING

### Railway app không start:
- Check logs: Railway Dashboard → Service → **Deployments** → Click vào deploy → **View Logs**
- Common issues:
  - MongoDB connection failed → Check MONGODB_URI
  - Port binding → Phải dùng `PORT=5000`
  - Build failed → Check build command

### Vercel build failed:
- Check logs: Vercel Dashboard → Project → **Deployments** → Click deploy → Logs
- Common issues:
  - `VITE_API_URL` chưa set
  - Node version → Vercel dùng Node 18-20
  - Dependencies missing → Check package.json

### CORS Error:
- Check `CORS_ORIGIN` trong Railway variables
- Phải match chính xác domain Vercel/custom domain
- Format: `https://domain1.com,https://domain2.com` (không space!)

---

## 📊 PERFORMANCE METRICS

**Expected:**
- Frontend load: < 500ms (Vercel CDN)
- API response: 100-300ms (Railway + MongoDB Atlas Singapore)
- Cold start (khi app thức dậy): 3-5s (chỉ request đầu tiên)

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] MongoDB Atlas cluster created
- [ ] GitHub repo created và pushed code
- [ ] Railway project deployed
- [ ] Railway environment variables set
- [ ] Railway sleep mode enabled
- [ ] Database seeded
- [ ] Vercel project imported
- [ ] Vercel environment variables set
- [ ] Both deployments successful
- [ ] Custom domains configured (optional)
- [ ] Test login successful
- [ ] Monitor Railway credit usage

---

## 🎯 DONE! 🎊

Website của bạn đã LIVE:
- **Frontend**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Cost**: $0-2/tháng (6+ tháng đầu FREE!)

Happy coding! 🚀
