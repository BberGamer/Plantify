# Plantify - Full-stack Mobile & Backend Ecosystem

Hệ sinh thái ứng dụng mua sắm & chăm sóc cây cảnh **Plantify** được xây dựng bằng:
- **Mobile App**: React Native (Expo SDK 51/52, Expo Router v3, JavaScript, Zustand, Axios)
- **Backend API**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT Auth, Bcrypt.js

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
