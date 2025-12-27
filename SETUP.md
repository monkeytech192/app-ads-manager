# Setup Nhanh

> 📖 **Hướng dẫn đầy đủ:** [DEPLOY.md](DEPLOY.md)

## ⚡ TL;DR

1. Fork repo này
2. Deploy backend lên Railway
3. Setup MongoDB Atlas
4. Tạo Facebook App
5. Deploy frontend lên Vercel

**Thời gian:** ~15 phút

---

## 🎯 Checklist

### Trước Khi Bắt Đầu
- [ ] Tài khoản GitHub
- [ ] Tài khoản Railway (FREE)
- [ ] Tài khoản Vercel (FREE)
- [ ] Tài khoản MongoDB Atlas (FREE)
- [ ] Tài khoản Facebook Developers

### Deploy
- [ ] Backend deployed → Copy domain
- [ ] MongoDB created → Copy connection string
- [ ] Facebook App created → Copy App ID & Secret
- [ ] Frontend deployed → Config env variables
- [ ] Test login Facebook

---

## 📋 5 Biến BẮT BUỘC

```env
VITE_API_URL=https://your-railway-domain.up.railway.app/api/v1
VITE_FB_APP_ID=your_facebook_app_id
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ads-manager
JWT_SECRET=random_32_chars_minimum
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

📖 **Chi tiết:** [.env.example](.env.example)

---

## 🔗 Links Hữu Ích

- [Railway Dashboard](https://railway.app)
- [Vercel Dashboard](https://vercel.com)
- [MongoDB Atlas](https://mongodb.com/cloud/atlas)
- [Facebook Developers](https://developers.facebook.com/apps)

---

## 📖 Docs Đầy Đủ

Xem [DEPLOY.md](DEPLOY.md) để biết:
- Chi tiết từng bước deploy
- Screenshots & examples
- Troubleshooting
- Security best practices
