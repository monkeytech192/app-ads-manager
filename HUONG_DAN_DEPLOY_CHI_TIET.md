# 🚀 HƯỚNG DẪN DEPLOY CHI TIẾT - TỪNG BƯỚC

## Bước 1️⃣: Point Domain về Server IP

### 1.1. Chuẩn bị Server
Thuê một VPS (Virtual Private Server):
- **Khuyên dùng**: DigitalOcean, Linode, Vultr, AWS EC2, hoặc VPS Việt Nam
- **Cấu hình tối thiểu**: 
  - 2GB RAM
  - 2 CPU cores
  - 20GB SSD
  - Ubuntu 22.04 LTS

### 1.2. Lấy IP của Server
Sau khi tạo server, bạn sẽ có một **Public IP** (ví dụ: `123.45.67.89`)

### 1.3. Cấu hình DNS cho Domain

**Bước 1: Đăng nhập vào trang quản lý domain của bạn**
- Nếu mua domain từ: GoDaddy, Namecheap, Google Domains, hoặc nhà cung cấp VN (Tenten, Mat Bao, v.v.)

**Bước 2: Tìm mục DNS Management / DNS Settings**

**Bước 3: Tạo A Record**
```
Type: A
Name: @ (hoặc để trống, nghĩa là domain gốc)
Value: 123.45.67.89 (IP server của bạn)
TTL: 3600 (hoặc Auto)
```

**Nếu muốn dùng subdomain (ví dụ: ads.domain.com):**
```
Type: A
Name: ads
Value: 123.45.67.89
TTL: 3600
```

**Bước 4: Lưu lại và chờ**
- DNS cần 5-60 phút để propagate
- Kiểm tra bằng cách ping: `ping yourdomain.com`

---

## Bước 2️⃣: Cài đặt Server (Ubuntu)

### 2.1. SSH vào Server
```bash
# Windows: Dùng PowerShell hoặc PuTTY
ssh root@123.45.67.89

# Nhập password được gửi qua email
```

### 2.2. Update hệ thống
```bash
apt update && apt upgrade -y
```

### 2.3. Cài đặt Docker
```bash
# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài Docker Compose
apt install docker-compose -y

# Kiểm tra
docker --version
docker-compose --version
```

### 2.4. Cài đặt Git (nếu chưa có)
```bash
apt install git -y
```

---

## Bước 3️⃣: Upload Code lên Server

### Cách 1: Dùng Git (Khuyến nghị)
```bash
# Tạo repository trên GitHub/GitLab
# Push code lên

# Trên server:
cd /opt
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Cách 2: Dùng SCP (Copy trực tiếp)
```powershell
# Trên máy Windows của bạn:
scp -r "c:\Users\Admin\Downloads\ads-manager-brutalist (1)" root@123.45.67.89:/opt/ads-manager
```

### Cách 3: Dùng FileZilla/WinSCP (GUI)
- Download WinSCP: https://winscp.net/
- Connect bằng SFTP với IP, username, password
- Kéo thả folder lên server

---

## Bước 4️⃣: Cấu hình Environment Variables

```bash
# Trên server, vào thư mục project
cd /opt/ads-manager

# Tạo file .env
nano .env
```

**Nội dung file .env:**
```env
# Thay thế bằng domain thật của bạn
DOMAIN=yourdomain.com

# Tạo JWT secret ngẫu nhiên (dùng lệnh dưới để generate)
JWT_SECRET=abc123xyz789_random_secret_key

# Gemini API Key (nếu có)
GEMINI_API_KEY=your_gemini_key_here
```

**Tạo JWT Secret ngẫu nhiên:**
```bash
openssl rand -base64 32
# Copy kết quả vào JWT_SECRET
```

**Lưu file:**
- Nhấn `Ctrl + X`
- Nhấn `Y`
- Nhấn `Enter`

---

## Bước 5️⃣: Setup SSL Certificate (Let's Encrypt)

### 5.1. Sửa file nginx.conf tạm thời (cho bước init)
```bash
nano nginx.conf
```

**Tìm dòng `${DOMAIN}` và thay bằng domain thật:**
```nginx
server_name yourdomain.com;  # Thay ${DOMAIN}
```

**Hoặc chạy lệnh này tự động:**
```bash
sed -i 's/${DOMAIN}/yourdomain.com/g' nginx.conf
```

### 5.2. Start Nginx tạm để verify domain
```bash
# Start chỉ Nginx để Let's Encrypt verify
docker-compose up -d nginx
```

### 5.3. Tạo SSL Certificate
```bash
# Tạo thư mục
mkdir -p ssl certbot_data

# Run certbot
docker run -it --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/certbot_data:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  -d yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Nếu dùng subdomain:
# -d ads.yourdomain.com
```

**Kết quả thành công:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 5.4. Kiểm tra certificate
```bash
ls -la ssl/live/yourdomain.com/
# Phải thấy: fullchain.pem, privkey.pem
```

---

## Bước 6️⃣: Deploy Full Stack

### 6.1. Stop Nginx tạm
```bash
docker-compose down
```

### 6.2. Build và Start tất cả services
```bash
# Build images và start containers
docker-compose up -d --build

# Quá trình này mất 5-10 phút
```

### 6.3. Theo dõi logs
```bash
# Xem logs tất cả services
docker-compose logs -f

# Hoặc xem từng service
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f mongodb
```

**Các dấu hiệu thành công:**
```
backend  | ✅ MongoDB connected successfully
backend  | 🚀 Server is running on port 5000
nginx    | [notice] start worker processes
```

### 6.4. Kiểm tra containers đang chạy
```bash
docker ps

# Phải thấy 5 containers:
# - ads-manager-backend
# - ads-manager-frontend
# - ads-manager-mongodb
# - ads-manager-nginx
# - ads-manager-certbot
```

---

## Bước 7️⃣: Seed Dữ Liệu (Tạo User Mẫu)

```bash
# Vào container backend
docker exec -it ads-manager-backend sh

# Chạy seed script
npm run seed

# Output:
# ✅ MongoDB connected successfully
# 🗑️  Cleared existing data
# 👤 Created admin user
# 🏢 Created ad accounts
# 📊 Created campaigns
# 📈 Created campaign metrics
# ✅ Seed data created successfully!
# 
# 📝 Login credentials:
#    Email: admin@example.com
#    Password: 123456

# Thoát container
exit
```

---

## Bước 8️⃣: Test và Verify

### 8.1. Test API
```bash
# Health check
curl https://yourdomain.com/api/v1/health

# Kết quả:
# {"success":true,"message":"Server is running"}
```

### 8.2. Test Login
```bash
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'

# Kết quả phải trả về token
```

### 8.3. Mở trình duyệt
```
https://yourdomain.com
```

Login với:
- Email: `admin@example.com`
- Password: `123456`

---

## Bước 9️⃣: Cấu hình Firewall (Bảo mật)

```bash
# Cài UFW (Uncomplicated Firewall)
apt install ufw -y

# Allow SSH (QUAN TRỌNG - không là bị khóa)
ufw allow 22/tcp

# Allow HTTP và HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Kiểm tra
ufw status
```

---

## 🔟 Cấu hình Auto-Restart (Nếu server reboot)

```bash
# Tạo systemd service
nano /etc/systemd/system/ads-manager.service
```

**Nội dung file:**
```ini
[Unit]
Description=Ads Manager Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ads-manager
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

**Enable service:**
```bash
systemctl enable ads-manager.service
systemctl start ads-manager.service
```

---

## 📊 TROUBLESHOOTING (Xử lý lỗi thường gặp)

### Lỗi 1: Domain không trỏ được
```bash
# Kiểm tra DNS
nslookup yourdomain.com
ping yourdomain.com

# Nếu không ping được, chờ DNS propagate (5-60 phút)
```

### Lỗi 2: SSL certificate fail
```bash
# Kiểm tra port 80 có mở không
netstat -tulpn | grep :80

# Tắt tất cả services khác dùng port 80
systemctl stop apache2

# Thử lại certbot
```

### Lỗi 3: Container không start
```bash
# Xem logs chi tiết
docker-compose logs backend
docker-compose logs nginx

# Restart containers
docker-compose restart

# Rebuild nếu cần
docker-compose up -d --build --force-recreate
```

### Lỗi 4: MongoDB connection error
```bash
# Kiểm tra MongoDB container
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb

# Xem logs
docker-compose logs mongodb
```

### Lỗi 5: Không vào được website (502 Bad Gateway)
```bash
# Kiểm tra backend có chạy không
docker-compose logs backend

# Kiểm tra nginx config
docker exec -it ads-manager-nginx nginx -t

# Restart nginx
docker-compose restart nginx
```

---

## 🔄 Maintenance Commands (Bảo trì)

### Update Code
```bash
cd /opt/ads-manager
git pull
docker-compose up -d --build
```

### Backup Database
```bash
# Backup
docker exec ads-manager-mongodb mongodump --out=/backup --db=ads-manager
docker cp ads-manager-mongodb:/backup ./backup-$(date +%Y%m%d)

# Download về máy local
scp -r root@123.45.67.89:/opt/ads-manager/backup-20241226 ./
```

### Restore Database
```bash
# Upload backup lên server
scp -r ./backup-20241226 root@123.45.67.89:/opt/ads-manager/

# Restore
docker cp backup-20241226 ads-manager-mongodb:/backup
docker exec ads-manager-mongodb mongorestore /backup --db=ads-manager
```

### View Logs
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart nginx
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Server đã thuê và có IP
- [ ] Domain đã point về IP server (test bằng ping)
- [ ] Docker và Docker Compose đã cài
- [ ] Code đã upload lên server
- [ ] File .env đã cấu hình đúng domain
- [ ] SSL certificate đã tạo thành công
- [ ] Docker Compose đã chạy (5 containers)
- [ ] Database đã seed xong
- [ ] Test API trả về 200 OK
- [ ] Website mở được trên trình duyệt
- [ ] Login thành công với admin@example.com
- [ ] Firewall đã cấu hình
- [ ] Auto-restart đã setup

---

## 🎯 KẾT QUẢ CUỐI CÙNG

Sau khi hoàn thành:

✅ **Frontend**: `https://yourdomain.com`
✅ **API**: `https://yourdomain.com/api/v1`
✅ **SSL**: Chứng chỉ Let's Encrypt (A+ rating)
✅ **Auto-renew**: Mỗi 12 giờ certbot sẽ check
✅ **Database**: MongoDB với data persistence
✅ **Monitoring**: Logs qua docker-compose logs

---

## 📞 Liên hệ khi gặp vấn đề

Nếu gặp lỗi, gửi output của:
```bash
docker-compose ps
docker-compose logs
curl -I https://yourdomain.com
```

Happy deploying! 🚀
