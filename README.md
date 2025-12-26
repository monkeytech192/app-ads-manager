# Ads Manager - Quản Lý Quảng Cáo Facebook

> Ứng dụng quản lý quảng cáo Facebook chuyên nghiệp với giao diện Brutalist độc đáo

## 🌟 Tính Năng

- 🔐 **Đăng nhập Facebook Business** - Xác thực OAuth an toàn
- 📊 **Dashboard Thời Gian Thực** - Theo dõi hiệu suất chiến dịch 
- 🎯 **Quản Lý Chiến Dịch** - Tạo, sửa, xóa chiến dịch quảng cáo
- 📈 **Phân Tích Chi Tiết** - Biểu đồ và số liệu chi tiết
- 🤖 **Đề Xuất AI** - Tối ưu bằng Google Gemini
- 📱 **PWA** - Cài đặt như app mobile
- 🎨 **Giao diện Brutalist** - Thiết kế táo bạo, tối giản

## 🛠️ Công Nghệ

### Frontend
- React 19 + TypeScript
- Vite - Build siêu nhanh
- Tailwind CSS
- Lucide Icons
- PWA

### server
- Node.js 20 + Express
- MongoDB + Mongoose
- JWT Authentication
- Facebook Graph API
- Google Gemini AI

### Deploy
- **Frontend**: Vercel
- **server**: Railway
- **Database**: MongoDB Atlas

## 📁 Cấu Trúc Dự Án

```
ads-manager/
├── src/
│   ├── screens/           # Các màn hình chính
│   │   ├── Dashboard.tsx
│   │   ├── QuanLyChienDich.tsx
│   │   ├── ChiTietChienDich.tsx
│   │   ├── SoSanhChienDich.tsx
│   │   ├── DeXuat.tsx
│   │   └── CaiDat.tsx
│   │
│   ├── shared/            # Components dùng chung
│   │   ├── UIComponents.tsx
│   │   └── BottomNav.tsx
│   │
│   ├── services/          # API services
│   │   ├── facebookService.ts
│   │   └── geminiService.ts
│   │
│   ├── features/          # Tính năng riêng
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   ├── config/            # Cấu hình
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── server/
│   └── src/
│       ├── api/           # API layer
│       │   ├── controllers/
│       │   └── routes/
│       │
│       ├── database/      # Database layer
│       │   ├── models/
│       │   └── scripts/
│       │
│       ├── middleware/
│       ├── config/
│       └── index.ts
│
├── docs/                  # Tài liệu
│   ├── HUONG_DAN_DEPLOY.md
│   └── CAI_DAT_FACEBOOK.md
│
└── ...files cấu hình
```

## 🚀 Bắt Đầu

### Yêu Cầu
- Node.js 20+
- MongoDB
- Facebook App
- Google Gemini API key (tùy chọn)

### Cài Đặt

```bash
# Clone repo
git clone https://github.com/monkeytech192/app-ads-manager.git
cd app-ads-manager

# Cài dependencies
npm install
cd server && npm install
```

### Cấu Hình Môi Trường

Tạo file `.env` ở thư mục gốc:

```env
# API
VITE_API_URL=http://localhost:5000/api/v1

# Facebook
VITE_FB_APP_ID=your_app_id
VITE_FB_CONFIG_ID=your_config_id

# server
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ads-manager
JWT_SECRET=your_secret
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_secret
GEMINI_API_KEY=your_key
```

### Chạy Development

```bash
# Terminal 1 - Frontend
npm run dev
# Mở http://localhost:5173

# Terminal 2 - server
cd server
npm run dev
# Server chạy ở http://localhost:5000
```

### Seed Database

```bash
cd server
npm run seed
```

**Tài khoản mặc định:**
- Email: `admin@example.com`
- Password: `123456`

## 📦 Deploy Production

Xem hướng dẫn chi tiết tại:
- [Hướng Dẫn Deploy](./docs/HUONG_DAN_DEPLOY.md)
- [Cài Đặt Facebook Login](./docs/CAI_DAT_FACEBOOK.md)

**Địa chỉ production:**
- Frontend: https://app-ads.tiemtocchu3.vn
- server: https://app-ads-manager-production.up.railway.app

## 🔐 Xác Thực

Hỗ trợ 2 loại đăng nhập Facebook:

1. **User Access Token** - Đăng nhập tài khoản cá nhân
2. **System User Access Token** - Đăng nhập business portfolio (dài hạn)

## 📚 API Endpoints

### Base URL
```
Production: https://app-ads-manager-production.up.railway.app/api/v1
Development: http://localhost:5000/api/v1
```

### Auth
```
POST /auth/register    - Đăng ký
POST /auth/login       - Đăng nhập
GET  /auth/me          - Lấy thông tin user
```

### Facebook
```
POST /facebook/exchange-token  - Đổi code lấy token
POST /facebook/profile         - Lấy profile
POST /facebook/adaccounts      - Lấy ad accounts
POST /facebook/campaigns       - Lấy campaigns
POST /facebook/insights        - Lấy metrics
```

### Dashboard
```
GET /dashboard/stats     - Thống kê tổng quan
GET /dashboard/campaigns - Danh sách campaigns
```

### Quản Lý
```
GET    /accounts       - DS tài khoản quảng cáo
POST   /accounts       - Tạo tài khoản
GET    /campaigns      - DS chiến dịch
POST   /campaigns      - Tạo chiến dịch
PUT    /campaigns/:id  - Sửa chiến dịch
DELETE /campaigns/:id  - Xóa chiến dịch
```

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Xem [CONTRIBUTING.md](./CONTRIBUTING.md) để biết thêm chi tiết.

### Quy Trình:
1. Fork repo
2. Tạo branch (`git checkout -b feature/tinh-nang-moi`)
3. Commit (`git commit -m 'Thêm tính năng mới'`)
4. Push (`git push origin feature/tinh-nang-moi`)
5. Tạo Pull Request

## 📝 License

MIT License - Xem file [LICENSE.md](./LICENSE.md)

## 👤 Tác Giả

**Monkey Tech**
- GitHub: [@monkeytech192](https://github.com/monkeytech192)

## 📞 Hỗ Trợ

- Issues: [GitHub Issues](https://github.com/monkeytech192/app-ads-manager/issues)
- Email: support@example.com

---

**Được xây dựng với ❤️ bởi Monkey Tech**
