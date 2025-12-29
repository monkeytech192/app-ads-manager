# Lịch Sử Thay Đổi

Tất cả thay đổi quan trọng của dự án sẽ được ghi lại trong file này.

## [1.3.0] - 2025-12-29

### ✨ Thêm Mới
- **Metrics mở rộng từ Facebook API:**
  - Actions: Page Likes, Page Engagement, Post Reactions, Saves, Shares
  - Link Clicks, Outbound Clicks
  - Video metrics: Views, 25%/50%/75%/100% watch rates
  - Social spend, Unique clicks, Unique CTR
- **Tab Placements mới** trong Campaign Detail:
  - Breakdown theo vị trí quảng cáo (Facebook Reels, Feed, Stories, etc.)
  - Breakdown theo vị trí địa lý (tỉnh/thành phố)
- **API mới:**
  - `POST /facebook/placement-insights` - Lấy dữ liệu theo placement
  - `POST /facebook/location-insights` - Lấy dữ liệu theo vị trí địa lý

### 🔄 Thay Đổi
- Mở rộng `CampaignInsights` interface với actions và video metrics
- Thêm `PlacementData` và `LocationData` interfaces
- UI Campaign Detail hiển thị thêm:
  - Card "Tương Tác & Kết Quả" với engagement metrics
  - Card "Số Liệu Video" với video watch rates
  - Tab "Vị trí" với placement và location breakdown

### 📚 Tài Liệu
- Gộp docs trùng lặp (xóa SETUP.md, REDIRECT_URI.md)
- Cập nhật README.md với links chính xác đến docs/
- Đơn giản hóa cấu trúc tài liệu

---

## [1.2.0] - 2025-06-27

### ✨ Thêm Mới
- **Đa ngôn ngữ (i18n)**: Hỗ trợ Tiếng Việt và English
- Thêm service i18n.ts với ~150 translation keys
- Thêm hook useTranslation() cho React components
- Selector ngôn ngữ trong Settings với cờ quốc gia (🇻🇳 🇺🇸)
- Lưu ngôn ngữ vào localStorage

### 🔄 Thay Đổi
- Cập nhật tất cả màn hình với translations:
  - Dashboard.tsx
  - QuanLyChienDich.tsx (Campaign Management)
  - ChiTietChienDich.tsx (Campaign Detail)
  - SoSanhChienDich.tsx (Comparison)
  - DeXuat.tsx (Recommendations)
  - CaiDat.tsx (Settings)
  - BottomNav.tsx (Navigation)

### 🐛 Sửa Lỗi
- Xóa debug console logs từ API service
- Tối ưu API caching với 60s TTL

---

## [1.1.0] - 2025-12-26

### ✨ Thêm Mới
- Tổ chức lại cấu trúc dự án theo chuẩn client/server
- Chia tách rõ ràng: client/ (Frontend), server/ (Backend)
- Cấu trúc chuyên nghiệp như các ứng dụng lớn
- Thêm docs/ folder cho tài liệu
- Thêm các file chuẩn: LICENSE, CHANGELOG
- Tài liệu tiếng Việt đầy đủ

### 🔄 Thay Đổi
- Đổi tên file rõ ràng hơn (Dashboard.tsx, QuanLyChienDich.tsx...)
- Frontend: src/ → client/src/
- Backend: backend/ → server/
- Cải thiện cấu trúc: client/src/screens/, client/src/shared/
- Backend: server/src/api/, server/src/database/
- Gom gọn environment variables
- Tối ưu imports và dependencies

### 🗑️ Xóa
- Loại bỏ folders trống và duplicate
- Xóa config files không dùng
- Xóa deployment docs duplicate

## [1.0.0] - 2025-12-26

### ✨ Tính Năng Chính
- Tích hợp Facebook Login for Business
- Xác thực User Access Token
- System User Access Token cho business portfolios
- Backend API cho Facebook Graph API
- Dashboard với metrics thời gian thực
- Quản lý chiến dịch (CRUD)
- Xem chi tiết chiến dịch với biểu đồ
- So sánh chiến dịch
- Đề xuất AI với Google Gemini
- Màn hình cài đặt với theme/ngôn ngữ
- MongoDB database với Mongoose
- JWT authentication
- Hỗ trợ PWA
- Giao diện Brutalist design
- Responsive mobile-first
- Bottom navigation cho mobile
- Deploy lên Vercel (frontend) và Railway (backend)

### 🔧 Kỹ Thuật
- React 19 với TypeScript
- Vite build tool
- Node.js 20 + Express
- MongoDB Atlas
- Facebook Graph API v24.0
- Google Gemini AI API
- Tailwind CSS
- Lucide Icons

### 🐛 Sửa Lỗi
- JWT token signing type errors
- Facebook SDK initialization
- MongoDB connection handling
- CORS configuration
- TypeScript compilation errors

## [0.1.0] - 2025-12-20

### ✨ Khởi Tạo
- Setup project với React 19
- Cấu hình TypeScript
- Cấu hình Vite
- Tailwind CSS với brutalist theme
- Component structure cơ bản
- Mock data cho development
- Service Worker cho offline support
- PWA manifest
