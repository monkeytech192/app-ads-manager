# Về Cloudflare Tunnel URI

## Câu hỏi: URI `https://refused-farming-trembl-forget.trycloudflare.com` vẫn hoạt động?

**TL;DR:** Có, vẫn hoạt động vì đã được thêm vào whitelist của Facebook App.

---

## Giải Thích

### Cloudflare Tunnel là gì?

Cloudflare Tunnel (hay Quick Tunnels với `trycloudflare.com`) là dịch vụ tạo public URL tạm thời để expose local server ra internet.

```bash
# Ví dụ chạy tunnel
cloudflared tunnel --url http://localhost:5173
# → Tạo URL: https://random-name.trycloudflare.com
```

### Tại sao URI cũ vẫn hoạt động?

1. **Facebook lưu whitelist:** Khi bạn thêm URI vào **Valid OAuth Redirect URIs**, Facebook lưu lại vĩnh viễn
2. **Không tự động xóa:** Facebook không tự động xóa URIs đã thêm
3. **Tunnel có thể đã bị terminate:** Nhưng URI vẫn trong whitelist của Facebook

### Vấn đề tiềm ẩn

⚠️ **Security Risk:**
- Nếu ai đó tạo được tunnel với tên domain cũ (ít khả năng)
- Họ có thể intercept OAuth callback
- Lấy được authorization code/token

✅ **Khuyến nghị:**
1. **XÓA** URI cũ khỏi Facebook App settings
2. Chỉ giữ URIs đang dùng:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)

---

## Cách Xóa URI Cũ

1. Vào [Facebook Developers](https://developers.facebook.com/apps)
2. Chọn App của bạn
3. **Products** → **Facebook Login** → **Settings**
4. Tìm **Valid OAuth Redirect URIs**
5. Xóa URI: `https://refused-farming-trembl-forget.trycloudflare.com/auth/facebook/callback`
6. **Save Changes**

---

## Best Practices cho Redirect URIs

### Development
```
http://localhost:5173
http://localhost:5173/auth/callback
http://127.0.0.1:5173
```

### Staging (nếu có)
```
https://staging.yourdomain.com
https://staging.yourdomain.com/auth/callback
```

### Production
```
https://yourdomain.com
https://yourdomain.com/auth/callback
```

### ❌ Tránh dùng:
- Cloudflare Quick Tunnels (`*.trycloudflare.com`)
- ngrok free tier (`*.ngrok.io`)
- Temporary tunnels
- Development tunnels trong production whitelist

### ✅ Nên dùng:
- Domain/subdomain riêng
- HTTPS cho production
- localhost cho development

---

## Kiểm Tra URIs Hiện Tại

1. Vào Facebook App Settings
2. **Facebook Login** → **Settings**
3. Xem danh sách **Valid OAuth Redirect URIs**
4. Xóa những URIs:
   - Không còn dùng
   - Temporary tunnels
   - Testing URIs cũ

---

## Cấu Trúc URI Trong Code

### Client Side (facebookService.ts)
Facebook SDK tự động xử lý redirect, không cần config URI trong code.

### Server Side (facebookController.ts)
```typescript
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || '';
```

Chỉ cần cho System User token exchange (advanced use case).

---

## Demo/Testing an toàn

Nếu cần expose localhost để test trên mobile/share với người khác:

### Option 1: ngrok (miễn phí có hạn)
```bash
ngrok http 5173
# Nhận URL: https://abc123.ngrok-free.app
```

### Option 2: Cloudflare Tunnel (recommended)
```bash
cloudflared tunnel --url http://localhost:5173
# Nhận URL: https://random.trycloudflare.com
```

### Option 3: LocalTunnel
```bash
npx localtunnel --port 5173
```

**Lưu ý:** CHỈ thêm vào Facebook whitelist khi testing, XÓA ngay sau khi xong!

---

## Security Checklist

- [ ] Xóa các tunnel URIs cũ khỏi Facebook App
- [ ] Chỉ whitelist localhost cho development
- [ ] Chỉ whitelist production domain cho live app
- [ ] Không commit `.env` có production credentials
- [ ] Enable HTTPS cho production
- [ ] Regular review Facebook App settings

---

## Tóm Lại

**Câu trả lời:** URI cloudflare cũ vẫn trong whitelist nên Facebook "cho phép", nhưng tunnel đã mất/hết hạn nên không hoạt động thực tế.

**Action Items:**
1. ✅ Xóa URI cũ khỏi Facebook App
2. ✅ Chỉ giữ URIs đang dùng
3. ✅ Thường xuyên review và dọn dẹp URIs
