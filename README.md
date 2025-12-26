# Quản Lý Ads FB - Brutalist Design System

## 1. Tổng quan
Đây là ứng dụng Web App (PWA) quản lý quảng cáo Facebook với phong cách thiết kế **Neo-Brutalism**. Ứng dụng tập trung vào hiệu suất, trải nghiệm người dùng trên mobile và tích hợp trợ lý ảo AI (Gemini).

## 2. Công nghệ Frontend (Hiện có)
*   **Core:** React 19, TypeScript.
*   **Styling:** Tailwind CSS (Custom config cho Brutalist style: shadow cứng, border dày, màu tương phản cao).
*   **Icons:** Lucide React.
*   **AI Integration:** Google Gemini API (Client-side implementation).
*   **PWA:** Service Worker, Manifest hỗ trợ cài đặt trên mobile.
*   **State Management:** React Local State (Cần chuyển sang gọi API).

## 3. Cấu trúc thư mục
```
.
├── index.html          # Entry point, cấu hình PWA & Font
├── index.tsx           # Mount App, đăng ký Service Worker
├── App.tsx             # Main Layout (App Shell), Routing logic, Global State
├── types.ts            # Định nghĩa Interface (Account, Campaign, User...)
├── manifest.json       # Cấu hình PWA
├── sw.js               # Service Worker (Offline caching)
├── components/         # Các màn hình và UI components
│   ├── BrutalistComponents.tsx # Button, Card, Input, Header...
│   ├── DashboardScreen.tsx
│   ├── ManagementScreen.tsx
│   ├── CampaignDetailScreen.tsx
│   ├── ...
└── services/
    └── geminiService.ts # Kết nối Google Gemini
```

## 4. Luồng người dùng (User Flow)
1.  **Auth:** Login/Register (Email hoặc Facebook Mock) -> Lưu Token & Trạng thái "Ghi nhớ".
2.  **Dashboard:** Xem tổng quan ngân sách, biểu đồ chi phí/lợi nhuận, hiệu suất nhóm quảng cáo.
3.  **Management:** 
    *   Danh sách Tài khoản quảng cáo (Active/Paused).
    *   Danh sách Chiến dịch theo tài khoản (Search & Filter).
    *   Bật/Tắt chiến dịch nhanh.
4.  **Campaign Detail:** Xem chi tiết metrics, biểu đồ line chart, phân bổ giới tính.
5.  **Comparison:** So sánh hiệu quả giữa 2 chiến dịch (A/B Testing).
6.  **Recommendations:** Các đề xuất tối ưu từ hệ thống (Tăng ngân sách, mở rộng tệp...).
7.  **AI Assistant:** Chat bot hỗ trợ giải đáp (Floating button luôn hiển thị).

---
**Lưu ý cho Backend Developer:**
Frontend hiện tại đang sử dụng Mock Data (dữ liệu giả) được hardcode trong `App.tsx` và các components. Nhiệm vụ của bạn là xây dựng API để thay thế các dữ liệu này.
