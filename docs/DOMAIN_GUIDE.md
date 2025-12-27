# Lưu Ý Về Domain

## ⚠️ Quan Trọng

Tất cả các ví dụ trong docs sử dụng **placeholders**:
- `your-app-production.up.railway.app` - Domain Railway của BẠN
- `your-app.vercel.app` - Domain Vercel của BẠN
- `yourdomain.com` - Custom domain của BẠN (nếu có)

**THAY THẾ** chúng bằng domain thật của bạn!

---

## 🔄 Cách Lấy Domain

### Railway (Backend)
1. Deploy xong → Settings → Domains
2. Click "Generate Domain"
3. Railway tạo: `your-app-production.up.railway.app`
4. Copy URL này

### Vercel (Frontend)
1. Deploy xong → Settings → Domains
2. Vercel tự tạo: `your-app-xxx.vercel.app`
3. Hoặc add custom domain

---

## 📝 Ví Dụ Thực Tế

### User A Deploy:
```env
# Railway backend
https://my-ads-manager-production.up.railway.app

# Vercel frontend
https://my-ads-app.vercel.app

# Facebook OAuth URIs
https://my-ads-app.vercel.app
```

### User B Deploy (có custom domain):
```env
# Railway backend
https://api.mycompany.com

# Vercel frontend
https://ads.mycompany.com

# Facebook OAuth URIs
https://ads.mycompany.com
```

---

## ✅ Checklist

Sau khi deploy, đảm bảo:

- [ ] Đã thay tất cả placeholders bằng domain thật
- [ ] Backend URL kết thúc bằng `/api/v1`
- [ ] Frontend URL KHÔNG có `/api/v1`
- [ ] Facebook OAuth URIs khớp với Frontend URL
- [ ] Tất cả URLs dùng HTTPS (không phải HTTP)

---

## 🚨 Lỗi Thường Gặp

### "Redirect URI mismatch"
→ Facebook OAuth URI không khớp với domain bạn đang truy cập

**Fix:** Vào Facebook App → Settings → Thêm đúng domain của bạn

### "API connection failed"
→ `VITE_API_URL` sai hoặc backend chưa deploy

**Fix:** Check Railway backend đã deploy và domain đúng

### "CORS error"
→ Backend không cho phép frontend domain

**Fix:** Thường tự động, nếu không thì thêm `CORS_ORIGIN` trên Railway

---

## 💡 Tips

1. **Copy-paste cẩn thận:** Đừng để trailing slash thừa
   - ✅ `https://my-app.vercel.app`
   - ❌ `https://my-app.vercel.app/`

2. **Backend URL phải có /api/v1:**
   - ✅ `https://backend.com/api/v1`
   - ❌ `https://backend.com`

3. **Frontend URL KHÔNG có /api/v1:**
   - ✅ `https://frontend.com`
   - ❌ `https://frontend.com/api/v1`

4. **Test từng bước:**
   - Deploy backend → Test `/health` endpoint
   - Deploy frontend → Test load trang
   - Config Facebook → Test login
