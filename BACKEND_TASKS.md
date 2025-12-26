# BACKEND CONSTRUCTION TASKS
**Target AI:** Claude 3.5 Opus / Sonnet / GPT-4o
**Language:** Node.js (Express) OR Python (FastAPI) - *Recommended: Node.js + TypeScript*
**Database:** MongoDB (Flexible for Ad Data) OR PostgreSQL.

Hệ thống Frontend đã hoàn thiện (React/TS). Dưới đây là yêu cầu chi tiết để xây dựng Backend phục vụ Frontend đó.

---

## CONVENTIONS (Quy ước)
1.  **API Prefix:** `/api/v1`
2.  **Auth:** JWT (Json Web Token) trong Header `Authorization: Bearer <token>`.
3.  **Response Format:**
    ```json
    {
      "success": true,
      "data": { ... }, // hoặc []
      "message": "Optional message"
    }
    ```
4.  **Data formatting:** Frontend hiện hiển thị tiền tệ dạng string (ví dụ: "50,000,000 VND"). Backend nên lưu dạng Number (`50000000`) và trả về API dạng Number. Frontend sẽ format lại, HOẶC Backend trả về thêm trường `formatted_value` để map nhanh.

---

## TASK LIST

### TASK 1: Project Setup & Database Design
*   Khởi tạo dự án Node.js/Express + TypeScript.
*   Cài đặt: `express`, `mongoose` (hoặc `prisma` nếu dùng SQL), `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`.
*   **Database Schema (Core Entities):**
    *   `User`: id, email, password_hash, name, avatar_url, facebook_id (optional).
    *   `AdAccount`: id, user_id, name, status ('active' | 'paused').
    *   `Campaign`: id, account_id, title, status, objective, budget (daily/lifetime), spent, impressions, results, cost_per_result, start_date, end_date.
    *   `CampaignMetric`: campaign_id, date, spent, impressions, clicks, ctr, conversion. (Dùng để vẽ biểu đồ).
    *   `Settings`: user_id, alert_cost_threshold, alert_ctr_threshold, default_daily_budget.

### TASK 2: Authentication Module
*   **POST** `/auth/register`: Input (name, email, password). Hash password. Return JWT.
*   **POST** `/auth/login`: Input (email, password, remember_me). Return JWT.
    *   *Note:* Nếu `remember_me` = true, set token expiry dài hơn (ví dụ: 30 ngày).
*   **GET** `/auth/me`: Lấy thông tin user từ Token.

### TASK 3: Dashboard API (Phục vụ `DashboardScreen.tsx`)
*   **GET** `/dashboard/summary`: Trả về tổng quan (Total Budget, Impressions, Clicks, CTR, ROI) của user hiện tại.
*   **GET** `/dashboard/chart-data`: Trả về dữ liệu biểu đồ cột (Cost vs Profit) theo tháng.
    *   *Format:* `[{ m: 'Jan', c: 60, p: 20 }, ...]`
*   **GET** `/dashboard/ad-sets`: Trả về Top các nhóm quảng cáo hiệu quả (như component `AdSetCard`).

### TASK 4: Management API (Phục vụ `ManagementScreen.tsx`)
*   **GET** `/accounts`: Lấy danh sách tài khoản quảng cáo của user.
*   **PATCH** `/accounts/:id/toggle`: Bật/Tắt tài khoản.
*   **GET** `/campaigns`: Lấy danh sách chiến dịch.
    *   *Query Params:* `accountId` (filter theo acc), `search` (tìm theo tên), `status` (filter active/paused).
*   **PATCH** `/campaigns/:id/status`: Update status (`active` <-> `paused`).

### TASK 5: Campaign Detail API (Phục vụ `CampaignDetailScreen.tsx`)
*   **GET** `/campaigns/:id`: Lấy chi tiết chiến dịch.
*   **GET** `/campaigns/:id/stats`: Lấy metrics tổng quan (Spent, Impressions, Results...).
*   **GET** `/campaigns/:id/chart`: Lấy dữ liệu biểu đồ đường (Line chart) hiệu quả 7 ngày qua.
    *   *Format:* Cần trả về array points để Frontend vẽ SVG path hoặc array coordinates.
*   **GET** `/campaigns/:id/demographics`: Lấy dữ liệu phân bổ giới tính (Male/Female %).

### TASK 6: Comparison API (Phục vụ `ComparisonScreen.tsx`)
*   **GET** `/reports/compare`: Input (`campaignIdA`, `campaignIdB`).
    *   Trả về dữ liệu so sánh side-by-side cho các metrics: Chi tiêu, Hiển thị, Click, CTR, CPC, Chuyển đổi.
    *   Trả về dữ liệu biểu đồ so sánh 2 đường line.

### TASK 7: Settings & Recommendations
*   **GET** `/settings`: Lấy cấu hình user.
*   **PUT** `/settings`: Cập nhật cấu hình (Alerts, Budget limits).
*   **GET** `/recommendations`: Trả về danh sách đề xuất tối ưu (Mock logic hoặc rule-based đơn giản: ví dụ nếu CTR < 1% -> suggest đổi ảnh).

### TASK 8: Proxy AI (Optional but Recommended)
*   Chuyển logic gọi Gemini từ Client (`services/geminiService.ts`) sang Server để bảo mật API Key.
*   **POST** `/ai/chat`: Input (`message`, `context`). Server gọi Google GenAI và trả về text.

---

## HƯỚNG DẪN KIỂM THỬ (MOCK DATA SEEDING)
Để Frontend hoạt động giống như thiết kế, Backend cần tạo script **Seeding Data** (dữ liệu mẫu) khi khởi chạy lần đầu:
1.  Tạo 1 User mặc định: `admin@example.com` / `123456`.
2.  Tạo 2 Ad Accounts: "Ad Account A" (Active), "Ad Account B" (Paused).
3.  Tạo ít nhất 2 Campaigns cho mỗi Account với các chỉ số metrics khác nhau để test tính năng So sánh và Biểu đồ.

## OUTPUT MONG MUỐN
1.  Source code Backend đầy đủ.
2.  File `.env.example`.
3.  Hướng dẫn chạy (`npm run dev`).
4.  (Optional) Dockerfile.
