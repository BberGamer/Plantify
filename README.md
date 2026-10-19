# 🌿 Plantify - Full-stack Mobile & Backend Ecosystem

Hệ sinh thái ứng dụng chăm sóc cây cảnh thông minh **Plantify** được xây dựng bằng:

- **Mobile App**: React Native (Expo SDK 51, Expo Router v3, JavaScript, Zustand, Axios)
- **Backend API**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT Auth, Nodemailer, OpenWeather API, OpenRouter AI, SePay Payment, Firebase FCM

---

## 📁 Cấu Trúc Tổng Thể Dự Án

```
Plantify/
├── backend/                        # RESTful API Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Kết nối MongoDB Atlas
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Xử lý Đăng ký / Đăng nhập / Reset Password
│   │   │   └── user.controller.js  # Quản lý thông tin người dùng
│   │   ├── integrations/
│   │   │   └── email/
│   │   │       └── email.service.js  # Nodemailer – Gửi OTP & Email xác nhận
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # Xác thực JWT (accessToken)
│   │   │   └── error.middleware.js  # Global Error Handler
│   │   ├── models/
│   │   │   └── user.model.js        # Mongoose Schema: User
│   │   ├── routes/
│   │   │   ├── index.js             # Route aggregator (mount tất cả router)
│   │   │   ├── auth.routes.js       # POST /auth/login, /register, /forgot-password...
│   │   │   └── user.routes.js       # GET/PUT /users/profile, admin routes
│   │   ├── services/
│   │   │   ├── auth.service.js      # Business logic xác thực, OTP, JWT
│   │   │   └── user.service.js      # Business logic người dùng
│   │   ├── utils/
│   │   │   └── api-response.js      # Chuẩn hóa response trả về (success/error)
│   │   ├── app.js                   # Cấu hình Express, CORS, Middleware, Routes
│   │   └── server.js                # Khởi tạo HTTP Server & kết nối Database
│   ├── .env.example                 # Mẫu biến môi trường Backend
│   ├── .gitignore
│   └── package.json                 # Dependencies & Scripts
│
├── mobile/                          # React Native (Expo) Client App
│   ├── app/                         # Expo Router – File-based Routing
│   │   ├── _layout.js               # Root Layout (kiểm tra Auth, điều hướng)
│   │   ├── (auth)/                  # Luồng xác thực
│   │   │   ├── _layout.js
│   │   │   ├── login.js             # Màn hình Đăng nhập
│   │   │   ├── register.js          # Màn hình Đăng ký
│   │   │   └── reset-password.js    # Màn hình Quên mật khẩu / Đặt lại
│   │   ├── (tabs)/                  # Giao diện chính (Bottom Tab Navigation)
│   │   │   └── index.js             # Tab Home
│   │   └── admin/                   # Khu vực Admin
│   │       ├── index.js             # Trang chủ Admin
│   │       └── users.js             # Quản lý người dùng
│   ├── src/
│   │   ├── components/              # UI Components tái sử dụng theo tính năng
│   │   │   ├── home/
│   │   │   │   ├── FeatureGrid.js   # Lưới tính năng nhanh
│   │   │   │   ├── GardenSummary.js # Tóm tắt vườn cây
│   │   │   │   ├── HeroBanner.js    # Banner chào mừng
│   │   │   │   ├── HomeHeader.js    # Header trang chủ
│   │   │   │   ├── Navbar.js        # Navigation bar
│   │   │   │   ├── PlantList.js     # Danh sách cây
│   │   │   │   ├── TodayTasks.js    # Nhiệm vụ chăm sóc hôm nay
│   │   │   │   └── WeatherCard.js   # Thẻ thông tin thời tiết
│   │   │   └── Profile/
│   │   │       └── ProfileHeader.js # Header trang Profile
│   │   ├── services/                # API Client (Axios)
│   │   │   ├── api.js               # Axios instance, interceptors, token refresh
│   │   │   ├── authService.js       # Gọi API Auth (login, register, OTP...)
│   │   │   └── userService.js       # Gọi API User (profile, update...)
│   │   └── theme/
│   │       ├── colors.js            # Bảng màu hệ thống (lá cây, đất, nước)
│   │       └── index.js             # Export theme
│   ├── store/
│   │   └── authStore.js             # Zustand Store – Trạng thái xác thực toàn cục
│   ├── app.json                     # Cấu hình Expo Project
│   ├── babel.config.js
│   └── package.json                 # Dependencies & Scripts
│
├── docs/                            # Tài liệu bổ sung
├── .gitignore                       # Root Gitignore
└── README.md                        # Tài liệu hướng dẫn khởi chạy nhanh (file này)
```

---

## 🔧 Biến Môi Trường (Backend)

Sao chép `.env.example` trong thư mục `backend/` và điền đầy đủ thông tin:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
DB_NAME=plantify_db

# JWT
JWT_SECRET=replace-with-a-long-random-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES=30d

# Email (Nodemailer – Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# OpenWeather API
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
OPENWEATHER_API_KEY=your-openweathermap-api-key

# OpenRouter AI
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# SePay Payment
SEPAY_WEBHOOK_SECRET=your-sepay-hmac-secret

# Firebase FCM (Push Notification)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

---

## 🚀 Khởi Chạy Nhanh (Quick Start)

### 1. Backend (Node.js & MongoDB Atlas)

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu, sau đó điền thông tin vào
cp .env.example .env

# Khởi động server (development – tự reload với nodemon)
npm run dev
```

> ✅ API sẽ chạy tại `http://localhost:5000`

---

### 2. Mobile App (React Native Expo)

```bash
# Di chuyển vào thư mục mobile
cd mobile

# Cài đặt dependencies
npm install

# Khởi chạy Expo
npx expo start
```

Sau khi Expo khởi động, chọn thiết bị:

| Mục tiêu | Cách làm |
|---|---|
| Android Emulator | Nhấn phím `a` trong terminal |
| iOS Simulator (macOS) | Nhấn phím `i` trong terminal |
| Điện thoại thật | Dùng app **Expo Go** quét mã QR hiển thị trên terminal |

> ⚠️ Khi dùng điện thoại thật, điện thoại và máy tính phải **cùng mạng Wi-Fi**.

---

## 📡 API Endpoints Chính

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT | ❌ |
| `POST` | `/api/auth/forgot-password` | Gửi OTP về email | ❌ |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu bằng OTP | ❌ |
| `POST` | `/api/auth/refresh-token` | Làm mới Access Token | ❌ |
| `GET` | `/api/users/profile` | Lấy thông tin cá nhân | ✅ |
| `PUT` | `/api/users/profile` | Cập nhật thông tin cá nhân | ✅ |

> ✅ = Cần header `Authorization: Bearer <accessToken>`

---

## 🛠️ Tech Stack Chi Tiết

### Backend
| Thư viện | Phiên bản | Mục đích |
|----------|-----------|---------|
| Express.js | ^4.18 | Web framework |
| Mongoose | ^7.5 | MongoDB ODM |
| jsonwebtoken | ^9.0 | JWT Auth |
| bcryptjs | ^2.4 | Hash mật khẩu |
| Nodemailer | ^6.9 | Gửi email OTP |
| Morgan | ^1.10 | HTTP request logger |
| Nodemon | ^3.0 | Auto-reload (dev) |

### Mobile
| Thư viện | Phiên bản | Mục đích |
|----------|-----------|---------|
| Expo | ~51.0 | React Native runtime |
| Expo Router | ~3.5 | File-based navigation |
| Zustand | ^4.5 | Global state management |
| Axios | ^1.6 | HTTP client |
| React Native Paper | ^5.15 | UI components |
| AsyncStorage | 1.23.1 | Lưu trữ local (token) |

---

## 📁 Cấu Trúc Tổng Thể Dự Án

```
Plantify/
├── backend/                  # RESTful API Backend
│   ├── src/
│   │   ├── config/           # Cấu hình Database & Environment
│   │   ├── controllers/      # Bộ điều khiển Auth, Plants, Orders
│   │   ├── data/             # Dữ liệu mẫu (Seed Data)
│   │   ├── middleware/       # JWT Auth, Error Handler, Validation
│   │   ├── models/           # Mongoose Data Models (User, Plant, etc.)
│   │   ├── routes/           # API Endpoints Router
│   │   ├── scripts/          # Script Seed Database tự động
│   │   ├── utils/            # JWT Helper, Utilities
│   │   ├── app.js            # Cấu hình Express App, Middleware, CORS
│   │   └── server.js         # Khởi tạo Server & kết nối MongoDB Atlas
│   ├── .env.example          # Mẫu biến môi trường Backend
│   ├── .gitignore            # Git ignore cho Node.js
│   ├── package.json          # Dependencies & Scripts
│   └── README.md             # Hướng dẫn chi tiết Backend
│
├── mobile/                   # React Native (Expo) Client App
│   ├── app/                  # Expo Router File-based Routing
│   │   ├── _layout.js        # Root Navigation Layout (Auth check)
│   │   ├── (auth)/           # Luồng Xác thực (Login, Register)
│   │   ├── (tabs)/           # Giao diện chính 5 Tabs (Home, Explore, Favs, Cart, Profile)
│   │   └── plant/            # Màn hình chi tiết cây [id].js
│   ├── src/
│   │   ├── components/       # Các UI Component tái sử dụng
│   │   ├── screens/          # Logic các màn hình
│   │   ├── services/         # API Service (Axios Interceptors, JWT Handling)
│   │   ├── theme/            # Hệ màu lá cây, Typography, Spacing
│   │   ├── types/            # Constants & Schema
│   │   └── utils/            # Helper format tiền tệ, validator
│   ├── store/                # Zustand State Stores (Auth, Cart, Favorites)
│   ├── .env.example          # Mẫu biến môi trường Expo
│   ├── .gitignore            # Git ignore cho React Native / Expo
│   ├── app.json              # Cấu hình Expo Project
│   ├── babel.config.js       # Babel Configuration
│   ├── package.json          # Dependencies & Scripts
│   └── README.md             # Hướng dẫn chạy Android Emulator & Điện thoại thật
│
├── .gitignore                # Root Gitignore
└── README.md                 # Tài liệu hướng dẫn khởi chạy nhanh
```

---

## 🚀 Khởi Chạy Nhanh (Quick Start)

### 1. Chuẩn bị Backend (Node.js & MongoDB Atlas)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   npm install
   ```
2. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Cập nhật `MONGODB_URI` với chuỗi kết nối từ MongoDB Atlas của bạn.
3. Chạy script nạp dữ liệu mẫu (Seed Database):
   ```bash
   npm run seed
   ```
4. Khởi động server backend:
   ```bash
   npm run dev
   ```
   API sẽ chạy tại `http://localhost:5000` (hoặc `http://<IP_LAN_CUA_BAN>:5000`).

---

### 2. Chuẩn bị Mobile App (React Native Expo)
1. Di chuyển vào thư mục mobile:
   ```bash
   cd mobile
   npm install
   ```
2. Cấu hình file `.env`:
   ```bash
   cp .env.example .env
   ```
   - **Đối với Android Emulator**: đặt `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api`
   - **Đối với Điện thoại thật**: đặt `EXPO_PUBLIC_API_URL=http://<IP_LAN_CUA_BAN>:5000/api` (VD: `http://192.168.1.15:5000/api`)
3. Khởi chạy Expo:
   ```bash
   npx expo start
   ```
   - Nhấn `a` để mở trên Android Emulator.
   - Dùng app **Expo Go** trên điện thoại thật quét mã QR hiển thị trên Terminal.
