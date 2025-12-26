# 🚀 DEPLOY HOÀN TOÀN MIỄN PHÍ VỚI CLOUDFLARE

## 💰 CHI PHÍ: **0 ĐỒNG** (100% FREE)

### Cloudflare Free Tier bao gồm:
- ✅ **Cloudflare Pages**: Host frontend (unlimited, miễn phí mãi mãi)
- ✅ **Cloudflare Workers**: Backend serverless (100,000 requests/ngày FREE)
- ✅ **Cloudflare D1**: SQLite database (5GB FREE)
- ✅ **R2 Storage**: Lưu files/images (10GB FREE)
- ✅ **SSL Certificate**: Tự động miễn phí
- ✅ **CDN Global**: Nhanh toàn thế giới

### MongoDB Atlas (nếu muốn dùng MongoDB):
- ✅ **M0 Free Tier**: 512MB, miễn phí mãi mãi

---

## 🏗️ KIẾN TRÚC CLOUDFLARE

```
Domain (yourdomain.com)
    ↓
Cloudflare DNS & CDN
    ↓
Frontend (Cloudflare Pages) ← Static React App
    ↓
Backend (Cloudflare Workers) ← API Routes (Serverless)
    ↓
Database (D1 hoặc MongoDB Atlas) ← Data Storage
    ↓
R2 Storage (Optional) ← Images/Files
```

---

## 📋 CHUẨN BỊ

### 1. Tạo tài khoản Cloudflare
```
https://dash.cloudflare.com/sign-up
```

### 2. Add domain vào Cloudflare
- Vào **Websites** → **Add a Site**
- Nhập domain của bạn
- Chọn plan **Free**
- Copy 2 nameservers Cloudflare đưa cho bạn

### 3. Đổi Nameserver tại nhà cung cấp domain
Vào trang quản lý domain (GoDaddy, Namecheap, v.v.), đổi nameserver thành:
```
NS1: amber.ns.cloudflare.com
NS2: rick.ns.cloudflare.com
```
(Nameserver của bạn sẽ khác, copy chính xác từ Cloudflare)

Chờ 5-60 phút để DNS propagate.

---

## Bước 1️⃣: Setup Database - MongoDB Atlas

### 1.1. Tạo tài khoản (nếu chưa có)
```
https://www.mongodb.com/cloud/atlas/register
```

### 1.2. Tạo Free Cluster
- Chọn **M0 Free** (512MB)
- Region: **Singapore** (gần VN nhất)
- Cluster Name: `ads-manager`
- Click **Create**

### 1.3. Tạo Database User
- **Security** → **Database Access**
- Username: `admin`
- Password: tạo password mạnh (copy lại)
- Privileges: **Read and write to any database**

### 1.4. Whitelist IP
- **Security** → **Network Access**
- **Add IP Address** → **ALLOW ACCESS FROM ANYWHERE** (0.0.0.0/0)

### 1.5. Get Connection String
- **Deployment** → **Database** → **Connect**
- **Connect your application**
- Copy connection string:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Thay `<password>` và thêm database name:
```
mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/ads-manager?retryWrites=true&w=majority
```

---

## Bước 2️⃣: Deploy Backend với Cloudflare Workers

### 2.1. Cài Wrangler CLI (Cloudflare CLI)
```powershell
npm install -g wrangler

# Login vào Cloudflare
wrangler login
```

### 2.2. Tạo Workers project cho backend
```powershell
cd "c:\Users\Admin\Downloads\ads-manager-brutalist (1)"

# Tạo thư mục workers
mkdir cloudflare-backend
cd cloudflare-backend

# Init Wrangler
wrangler init
```

Chọn:
- TypeScript? **Yes**
- Git? **Yes**
- Package manager? **npm**

### 2.3. Cài đặt dependencies
```powershell
npm install hono @hono/node-server
npm install mongoose jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs -D
```

### 2.4. Tạo file wrangler.toml
```toml
name = "ads-manager-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
NODE_ENV = "production"

# Secrets (sẽ set bằng command line)
# MONGODB_URI
# JWT_SECRET
# GEMINI_API_KEY
```

### 2.5. Convert Backend code sang Hono (Workers framework)

Tạo `src/index.ts`:
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import mongoose from 'mongoose';

const app = new Hono();

// CORS
app.use('/*', cors({
  origin: ['https://yourdomain.com', 'https://ads.yourdomain.com'],
  credentials: true,
}));

// Connect MongoDB
let isConnected = false;
async function connectDB(uri: string) {
  if (isConnected) return;
  await mongoose.connect(uri);
  isConnected = true;
  console.log('MongoDB connected');
}

// Health check
app.get('/health', (c) => {
  return c.json({ success: true, message: 'API is running' });
});

// Auth routes
import authRoutes from './routes/auth';
app.route('/api/v1/auth', authRoutes);

// Dashboard routes
import dashboardRoutes from './routes/dashboard';
app.route('/api/v1/dashboard', dashboardRoutes);

// Management routes
import managementRoutes from './routes/management';
app.route('/api/v1', managementRoutes);

// Settings routes
import settingsRoutes from './routes/settings';
app.route('/api/v1', settingsRoutes);

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // Connect to MongoDB
    await connectDB(env.MONGODB_URI);
    
    return app.fetch(request, env, ctx);
  },
};
```

### 2.6. Copy models và controllers từ backend

Giữ nguyên code models và controllers, chỉ cần adjust imports.

### 2.7. Set Secrets (Environment Variables)
```powershell
# Set MongoDB URI
wrangler secret put MONGODB_URI
# Paste connection string khi được hỏi

# Set JWT Secret
wrangler secret put JWT_SECRET
# Paste secret key

# Set Gemini API Key (optional)
wrangler secret put GEMINI_API_KEY
# Paste API key
```

### 2.8. Deploy Workers
```powershell
wrangler deploy
```

Kết quả sẽ có URL:
```
https://ads-manager-api.yourname.workers.dev
```

### 2.9. Custom Domain cho Workers (dùng domain của bạn)
- Vào Cloudflare Dashboard → **Workers & Pages**
- Click vào worker `ads-manager-api`
- **Settings** → **Triggers** → **Custom Domains**
- Add domain: `api.yourdomain.com`

Kết quả:
```
https://api.yourdomain.com
```

---

## Bước 3️⃣: Deploy Frontend với Cloudflare Pages

### 3.1. Build Frontend với đúng API URL
```powershell
cd "c:\Users\Admin\Downloads\ads-manager-brutalist (1)"

# Tạo file .env.production
echo "VITE_API_URL=https://api.yourdomain.com/api/v1" > .env.production

# Install và build
npm install
npm run build
```

### 3.2. Deploy lên Cloudflare Pages

**Cách 1: Deploy qua Dashboard (Dễ nhất)**

1. Vào Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages**
2. **Connect to Git** → Chọn GitHub/GitLab
3. Authorize Cloudflare
4. Chọn repository của bạn
5. Configure:
   - **Project name**: `ads-manager`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. **Environment variables**:
   ```
   VITE_API_URL = https://api.yourdomain.com/api/v1
   ```
7. Click **Save and Deploy**

**Cách 2: Deploy qua Wrangler CLI**

```powershell
# Tạo Pages project
npx wrangler pages project create ads-manager

# Deploy
npx wrangler pages deploy dist --project-name=ads-manager
```

### 3.3. Custom Domain cho Pages
- Vào project `ads-manager` trên Pages
- **Custom domains** → **Set up a custom domain**
- Add domain: `ads.yourdomain.com` hoặc `yourdomain.com`
- Cloudflare tự động setup DNS

Kết quả:
```
https://yourdomain.com
hoặc
https://ads.yourdomain.com
```

---

## Bước 4️⃣: Seed Database

### 4.1. Tạo seed script riêng
Tạo file `cloudflare-backend/seed.ts`:
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from '../backend/src/models/User';
import AdAccount from '../backend/src/models/AdAccount';
import Campaign from '../backend/src/models/Campaign';
import CampaignMetric from '../backend/src/models/CampaignMetric';
import Settings from '../backend/src/models/Settings';

async function seed() {
  // Connect
  await mongoose.connect(process.env.MONGODB_URI!);
  
  // Clear data
  await User.deleteMany({});
  await AdAccount.deleteMany({});
  await Campaign.deleteMany({});
  await CampaignMetric.deleteMany({});
  await Settings.deleteMany({});
  
  // Create user
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: hashedPassword,
  });
  
  // Create settings
  await Settings.create({ user_id: user._id });
  
  // Create accounts
  const account1 = await AdAccount.create({
    user_id: user._id,
    name: 'Ad Account A',
    status: 'active'
  });
  
  // Create campaigns (copy from seed script cũ)
  // ... (rest of seed data)
  
  console.log('✅ Seed completed!');
  process.exit(0);
}

seed();
```

### 4.2. Chạy seed
```powershell
cd cloudflare-backend
npx ts-node seed.ts
```

---

## Bước 5️⃣: Test và Verify

### 5.1. Test API
```powershell
curl https://api.yourdomain.com/health
```

### 5.2. Test Login
```powershell
curl -X POST https://api.yourdomain.com/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"123456"}'
```

### 5.3. Mở Frontend
```
https://yourdomain.com
```

---

## 🎯 GIỚI HẠN CLOUDFLARE FREE TIER

### Workers (Backend)
- ✅ **100,000 requests/ngày** (3 triệu/tháng)
- ✅ **10ms CPU time per request**
- ✅ **128MB memory**
- ⚠️ Đủ cho 3-5k users hoạt động/ngày

### Pages (Frontend)
- ✅ **Unlimited requests**
- ✅ **Unlimited bandwidth**
- ✅ **500 builds/tháng**
- ✅ **20,000 files per deployment**

### R2 Storage (nếu dùng)
- ✅ **10GB storage miễn phí**
- ✅ **1 triệu Class A operations/tháng**
- ✅ **10 triệu Class B operations/tháng**

### Khi nào cần nâng cấp?
- Workers: > 100k requests/ngày → **$5/tháng** (10 triệu requests)
- Pages: Không cần nâng cấp (unlimited free)
- R2: > 10GB → **$0.015/GB/tháng** (rất rẻ)

---

## 📁 CẤU TRÚC PROJECT CLOUDFLARE

```
ads-manager-brutalist/
├── backend/                    # Backend gốc (giữ nguyên)
├── cloudflare-backend/         # Workers backend
│   ├── src/
│   │   ├── index.ts           # Workers entry
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Controllers
│   │   └── models/            # Mongoose models
│   ├── wrangler.toml          # Workers config
│   ├── package.json
│   └── seed.ts                # Seed script
├── dist/                       # Frontend build (Pages)
├── package.json
└── .env.production
```

---

## 🔄 WORKFLOW DEPLOY

### Lần đầu:
1. Setup MongoDB Atlas
2. Deploy Workers backend
3. Set secrets
4. Deploy Pages frontend
5. Custom domains
6. Seed database

### Update code sau này:
```powershell
# Update backend
cd cloudflare-backend
wrangler deploy

# Update frontend
cd ..
npm run build
npx wrangler pages deploy dist --project-name=ads-manager
```

### Hoặc auto deploy qua Git:
- Push code lên GitHub
- Cloudflare Pages tự động build & deploy

---

## ⚡ PERFORMANCE & LATENCY

Cloudflare có 300+ edge locations trên toàn thế giới:
- **Frontend (Pages)**: Cache tại edge → Load < 100ms
- **Backend (Workers)**: Chạy tại edge gần user nhất
- **Database**: MongoDB Atlas Singapore → ~50-100ms latency

**Kết quả**: Website load cực nhanh, toàn cầu! 🚀

---

## 💰 SO SÁNH CHI PHÍ

| Giải pháp | Chi phí/tháng | Ưu điểm | Nhược điểm |
|-----------|---------------|---------|------------|
| **Cloudflare Free** | **$0** | Miễn phí, nhanh, CDN global | Giới hạn 100k req/day |
| VPS | $5-10 | Toàn quyền, không giới hạn | Phải tự quản lý, chậm hơn |
| Shared Hosting | $2-5 | Dễ dùng, cPanel | Chậm, hạn chế |

**Kết luận**: Cloudflare FREE là lựa chọn tốt nhất cho startup/MVP!

---

## ✅ CHECKLIST

- [ ] Tạo tài khoản Cloudflare
- [ ] Add domain vào Cloudflare
- [ ] Đổi nameserver
- [ ] Setup MongoDB Atlas
- [ ] Cài Wrangler CLI
- [ ] Tạo Workers project
- [ ] Convert backend sang Hono
- [ ] Set secrets cho Workers
- [ ] Deploy Workers
- [ ] Custom domain cho API
- [ ] Build frontend với đúng API URL
- [ ] Deploy Pages
- [ ] Custom domain cho frontend
- [ ] Seed database
- [ ] Test API và frontend

---

## 🎉 KẾT QUẢ

**Sau khi hoàn thành:**
- ✅ Frontend: `https://yourdomain.com` (Cloudflare Pages)
- ✅ API: `https://api.yourdomain.com` (Cloudflare Workers)
- ✅ Database: MongoDB Atlas (Free M0)
- ✅ SSL: Tự động, miễn phí
- ✅ CDN: Global, cực nhanh
- ✅ Chi phí: **$0/tháng** 🎊

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Workers cần convert code**: Backend Express phải chuyển sang Hono framework
2. **Mongoose trên Workers**: Cần dùng connection pooling cẩn thận
3. **Cold start**: Request đầu tiên có thể chậm 1-2s, sau đó nhanh
4. **Giới hạn 100k/day**: Nếu vượt, cần nâng cấp plan ($5/tháng)

---

## 🆚 NÊN CHỌN GÌ?

### Chọn Cloudflare nếu:
✅ Muốn miễn phí hoàn toàn
✅ Traffic < 100k requests/ngày
✅ Muốn website nhanh toàn cầu
✅ Không muốn quản lý server

### Chọn VPS nếu:
✅ Traffic cao > 100k/ngày
✅ Cần chạy background jobs
✅ Cần WebSocket real-time
✅ Muốn toàn quyền kiểm soát

---

Bạn muốn tôi hướng dẫn chi tiết hơn phần convert Express sang Hono không? 🚀
