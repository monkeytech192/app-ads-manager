# Ads Manager - Backend & Deployment Guide

## 🚀 Backend đã build xong với Node.js + Express + TypeScript + MongoDB

## 📁 Cấu trúc Backend
```
backend/
├── src/
│   ├── controllers/      # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Seed data script
│   └── index.ts         # Main server file
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Cài đặt và chạy Backend (Local)

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Tạo file .env
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ads-manager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REMEMBER_EXPIRE=30d
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
```

### 3. Cài đặt MongoDB (nếu chưa có)
```bash
# Windows: Download từ https://www.mongodb.com/try/download/community
# Hoặc dùng Docker:
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 4. Seed dữ liệu mẫu
```bash
npm run seed
```

Login credentials sau khi seed:
- Email: `admin@example.com`
- Password: `123456`

### 5. Chạy backend development
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

## 🐳 Deploy với Docker (Production)

### Bước 1: Chuẩn bị file .env ở root
Chỉnh sửa file `.env` ở thư mục root:
```env
JWT_SECRET=your_strong_random_secret_key_change_this
GEMINI_API_KEY=your_gemini_api_key_here
DOMAIN=yourdomain.com
```

### Bước 2: Point domain về server
Trên DNS của domain, tạo A record trỏ về IP server:
```
Type: A
Name: @ (hoặc subdomain)
Value: YOUR_SERVER_IP
```

### Bước 3: Cài đặt Docker trên server
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Bước 4: Upload code lên server
```bash
# Sử dụng Git
git clone your-repo
cd ads-manager-brutalist

# Hoặc sử dụng SCP/SFTP để upload
```

### Bước 5: Tạo SSL certificate (Let's Encrypt)
```bash
# Tạo thư mục SSL
mkdir -p ssl

# Chạy certbot để lấy certificate
docker run -it --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/certbot_data:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  --email your-email@example.com \
  --agree-tos
```

### Bước 6: Deploy với Docker Compose
```bash
# Build và start tất cả services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Bước 7: Seed dữ liệu vào production
```bash
# Vào container backend
docker exec -it ads-manager-backend sh

# Chạy seed script
npm run seed

# Exit
exit
```

## 🌐 Cấu trúc Docker Deployment

Docker Compose sẽ tạo 5 containers:
1. **MongoDB** (port internal 27017) - Database
2. **Backend** (port internal 5000) - API server
3. **Frontend** (port internal 80) - React app
4. **Nginx** (port 80, 443) - Reverse proxy + SSL
5. **Certbot** - Auto-renew SSL certificates

## 📡 API Endpoints đã implement

### Authentication
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Lấy thông tin user

### Dashboard
- `GET /api/v1/dashboard/summary` - Tổng quan
- `GET /api/v1/dashboard/chart-data` - Dữ liệu biểu đồ
- `GET /api/v1/dashboard/ad-sets` - Top ad sets

### Management
- `GET /api/v1/accounts` - Danh sách accounts
- `PATCH /api/v1/accounts/:id/toggle` - Bật/tắt account
- `GET /api/v1/campaigns` - Danh sách campaigns
- `GET /api/v1/campaigns/:id` - Chi tiết campaign
- `PATCH /api/v1/campaigns/:id/status` - Cập nhật status
- `GET /api/v1/campaigns/:id/stats` - Statistics
- `GET /api/v1/campaigns/:id/chart` - Chart data
- `GET /api/v1/campaigns/:id/demographics` - Demographics

### Reports
- `GET /api/v1/reports/compare` - So sánh campaigns

### Settings
- `GET /api/v1/settings` - Lấy settings
- `PUT /api/v1/settings` - Cập nhật settings
- `GET /api/v1/recommendations` - Đề xuất

### AI
- `POST /api/v1/ai/chat` - Chat với Gemini AI

## 🔒 Bảo mật

- JWT authentication cho tất cả protected routes
- Passwords được hash với bcrypt
- CORS được config chặt chẽ
- HTTPS bắt buộc ở production
- Environment variables cho secrets

## 🛠️ Maintenance Commands

```bash
# Restart services
docker-compose restart

# View logs
docker-compose logs backend
docker-compose logs nginx

# Update application
git pull
docker-compose up -d --build

# Backup database
docker exec ads-manager-mongodb mongodump --out=/backup
docker cp ads-manager-mongodb:/backup ./backup

# Restore database
docker cp ./backup ads-manager-mongodb:/backup
docker exec ads-manager-mongodb mongorestore /backup
```

## 📊 Monitoring

Health check endpoint:
```bash
curl https://yourdomain.com/api/v1/health
```

## ✅ Checklist Deploy

- [ ] Point domain về server IP
- [ ] Cài Docker trên server
- [ ] Upload code lên server
- [ ] Cấu hình .env file
- [ ] Generate SSL certificate
- [ ] Run docker-compose up
- [ ] Seed database
- [ ] Test API endpoints
- [ ] Cấu hình firewall (mở port 80, 443)

## 🎯 Kết quả

Sau khi deploy xong:
- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api/v1`
- Auto SSL renewal mỗi 12h
- MongoDB được backup trong volume
- Nginx làm reverse proxy và handle SSL

Good luck! 🚀
