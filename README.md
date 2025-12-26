# Ads Manager - Facebook Ads Management Platform

> A modern, brutalist-style Facebook Ads Manager built with React 19, TypeScript, and Node.js

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

- 🔐 **Facebook Login for Business** - Secure OAuth authentication
- 📊 **Real-time Dashboard** - Monitor campaigns and performance metrics
- 🎯 **Campaign Management** - Full CRUD operations for ad campaigns
- 📈 **Advanced Analytics** - Detailed insights with charts and comparisons
- 🤖 **AI Recommendations** - Google Gemini-powered optimization suggestions
- 📱 **PWA Support** - Installable progressive web app
- 🎨 **Brutalist UI** - Bold, minimalist design with sharp aesthetics
- ⚡ **Fast & Responsive** - Optimized for all devices

## 🛠️ Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for blazing fast builds
- Tailwind CSS for styling
- Lucide Icons
- PWA capabilities

### Backend
- Node.js 20 + Express
- MongoDB with Mongoose
- JWT authentication
- Axios for Facebook Graph API
- Google Gemini AI integration

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas
- **Version Control**: GitHub

## 📁 Project Structure

```
ads-manager/
├── components/              # React components
│   ├── DashboardScreen.tsx
│   ├── ManagementScreen.tsx
│   ├── CampaignDetailScreen.tsx
│   ├── ComparisonScreen.tsx
│   ├── RecommendationsScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── BottomNav.tsx
│   └── BrutalistComponents.tsx
│
├── services/               # API services
│   ├── facebookService.ts
│   └── geminiService.ts
│
├── backend/                # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── scripts/
│   └── Dockerfile
│
├── docs/                   # Documentation
│   ├── DEPLOY_VERCEL_RAILWAY.md
│   └── FACEBOOK_LOGIN_SETUP.md
│
└── ...config files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB
- Facebook App credentials
- Google Gemini API key (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/monkeytech192/app-ads-manager.git
cd app-ads-manager

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### Environment Setup

**Frontend** (`.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FB_APP_ID=your_facebook_app_id
VITE_FB_CONFIG_ID=your_fb_config_id
```

**Backend** (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ads-manager
JWT_SECRET=your_secret_key
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
GEMINI_API_KEY=your_gemini_key
```

### Run Development Servers

```bash
# Terminal 1 - Frontend (http://localhost:5173)
npm run dev

# Terminal 2 - Backend (http://localhost:5000)
cd backend && npm run dev
```

### Seed Database

```bash
cd backend
npm run seed
```

**Default credentials:**
- Email: `admin@example.com`
- Password: `123456`

## 📦 Deployment

### Production Deployment

See detailed guides:
- [Vercel + Railway Deployment](./docs/DEPLOY_VERCEL_RAILWAY.md)
- [Facebook Login Configuration](./docs/FACEBOOK_LOGIN_SETUP.md)

**Live URLs:**
- Frontend: https://app-ads.tiemtocchu3.vn
- Backend: https://app-ads-manager-production.up.railway.app

## 🔐 Authentication

Supports two Facebook authentication modes:

1. **User Access Token** - Personal Facebook account login
2. **System User Access Token** - Business portfolio with long-term access

See [Facebook Login Setup](./docs/FACEBOOK_LOGIN_SETUP.md) for configuration.

## 📚 API Documentation

### Base URL
```
Production: https://app-ads-manager-production.up.railway.app/api/v1
Development: http://localhost:5000/api/v1
```

### Endpoints

#### Authentication
```
POST /auth/register    - Register new user
POST /auth/login       - User login
GET  /auth/me          - Get current user
```

#### Facebook Integration
```
POST /facebook/exchange-token  - Exchange auth code for token
POST /facebook/profile         - Get Facebook profile
POST /facebook/adaccounts      - Get ad accounts
POST /facebook/campaigns       - Get campaigns
POST /facebook/insights        - Get campaign metrics
```

#### Dashboard
```
GET /dashboard/stats     - Dashboard statistics
GET /dashboard/campaigns - Campaign list with metrics
```

#### Management
```
GET    /accounts       - List ad accounts
POST   /accounts       - Create ad account
GET    /campaigns      - List campaigns
POST   /campaigns      - Create campaign
PUT    /campaigns/:id  - Update campaign
DELETE /campaigns/:id  - Delete campaign
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 🐛 Known Issues

- Facebook API rate limiting may affect data fetching
- Mobile navigation needs optimization for small screens
- Token refresh flow needs implementation

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 👤 Author

**Monkey Tech**
- GitHub: [@monkeytech192](https://github.com/monkeytech192)

## 🙏 Acknowledgments

- Facebook Marketing API
- Google Gemini AI
- React & TypeScript community

---

**Built with ❤️ using React, TypeScript, and Node.js**
