# LỖI: Token hiện tại là PAGE TOKEN thay vì USER TOKEN

## Vấn đề:
Token trong .env là Page Access Token của fanpage "Tiệm Tóc Chú 3", không phải User Access Token.
Page token KHÔNG THỂ truy cập ad accounts.

## Giải pháp: Lấy User Access Token

### Bước 1: Truy cập Graph API Explorer
https://developers.facebook.com/tools/explorer/

### Bước 2: Chọn đúng token type
1. Ở góc trên bên phải, có dropdown hiển thị token type hiện tại
2. **QUAN TRỌNG**: Đảm bảo chọn **"User Token"** KHÔNG phải "Page Token"
3. Nếu đang là Page Token, click vào dropdown và chọn "Get User Access Token"

### Bước 3: Chọn App
- Dropdown "Meta App": Chọn app "616155604752940" (app của bạn)

### Bước 4: Generate Token với đúng permissions
1. Click **"Generate Access Token"**
2. Trong hộp thoại permissions, chọn:
   - ✅ `ads_management`
   - ✅ `ads_read`
   - ✅ `business_management`
   - ⚠️ **KHÔNG** chọn các page permissions
   - ⚠️ Đăng nhập bằng **USER account** có quyền quản lý ads, không phải page

3. Click **"Generate Access Token"**
4. Login và cho phép permissions

### Bước 5: Verify Token
Token phải có type là **"USER"**, không phải "PAGE":
```json
{
  "type": "USER",  // ← PHẢI LÀ USER
  "app_id": "616155604752940",
  "is_valid": true,
  "scopes": ["ads_read", "ads_management", "business_management"]
}
```

### Bước 6: Extend Token thành Long-lived
1. Click biểu tượng **ⓘ** bên cạnh Access Token
2. Click **"Open in Access Token Tool"**
3. Click **"Extend Access Token"**
4. Copy long-lived token (60 ngày)

### Bước 7: Update .env
Thay token trong file `.env`:
```env
FACEBOOK_ACCESS_TOKEN=<your_new_user_token_here>
```

### Bước 8: Test
Chạy lại script test:
```bash
node check-token.js
```

Token phải hiển thị:
- ✅ type: "USER" (không phải "PAGE")
- ✅ is_valid: true
- ✅ scopes: ads_read, ads_management, business_management

## Lưu ý quan trọng:

1. **USER vs PAGE token**:
   - USER token: Của user Facebook, có thể truy cập ad accounts
   - PAGE token: Của fanpage, chỉ quản lý page, KHÔNG thể truy cập ads

2. **Đăng nhập đúng account**:
   - Phải là user có quyền quản lý ad accounts
   - Không phải page admin

3. **Permissions cần thiết**:
   - ads_read
   - ads_management
   - business_management

4. **Token expiration**:
   - Short-lived: 1-2 giờ
   - Long-lived: 60 ngày
   - Phải extend để có long-lived token
