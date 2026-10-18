# Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục – Plantify

## 1. Tổng quan Kiến trúc

Hệ thống **Plantify** được xây dựng theo mô hình phân tầng chuẩn mực, tách biệt giữa tầng dịch vụ Backend (Node.js/Express) và ứng dụng di động (React Native/Expo).

- **Backend:** Kiến trúc phân tầng **Layered Architecture (N-tier)** gồm `routes` -> `controllers` -> `services` -> `models`, kết hợp với tầng tích hợp bên thứ ba (`integrations/`) và tác vụ nền định kỳ (`jobs/`).
- **Mobile:** Sử dụng **Expo Router** (File-based Routing), phân định rõ giữa các màn hình (`app/`), component tái sử dụng (`components/`), tầng gọi API (`services/`) và quản lý state (`stores/`).

---

## 2. Cây cấu trúc thư mục chi tiết (Project Structure)

```text
plantify/
├── backend/                            # Node.js + Express + JavaScript (CommonJS)
│   ├── src/
│   │   ├── config/                     # Cấu hình môi trường & kết nối
│   │   │   ├── database.js             # Mongoose connection
│   │   │   ├── env.js                  # Biến môi trường tập trung
│   │   │   └── cors.js                 # Cấu hình CORS
│   │   │
│   │   ├── models/                     # MongoDB / Mongoose Schemas
│   │   │   ├── user.model.js
│   │   │   ├── role.model.js
│   │   │   ├── plant.model.js          # Dữ liệu bách khoa toàn thư thực vật
│   │   │   ├── disease.model.js        # Bệnh hại & triệu chứng
│   │   │   ├── user-plant.model.js     # Cây trồng của từng user trong vườn
│   │   │   ├── identification.model.js # Lịch sử AI nhận diện loài cây
│   │   │   ├── diagnosis.model.js      # Lịch sử AI chẩn đoán bệnh
│   │   │   ├── care-schedule.model.js  # Mẫu lịch chăm sóc theo loài
│   │   │   ├── care-reminder.model.js  # Lịch nhắc tưới/bón của từng user
│   │   │   ├── treatment.model.js      # Phác đồ điều trị chuẩn
│   │   │   ├── treatment-schedule.model.js # Tiến trình điều trị 14 ngày thực tế
│   │   │   ├── subscription.model.js   # Gói dịch vụ (Free/Pro)
│   │   │   ├── wallet.model.js         # Số dư ví & lịch sử giao dịch
│   │   │   ├── payment.model.js        # Bản ghi giao dịch cổng thanh toán
│   │   │   ├── notification.model.js   # Thông báo in-app / push log
│   │   │   ├── chat-message.model.js   # Lịch sử chat tư vấn / chatbot
│   │   │   └── feedback.model.js       # Đánh giá độ chính xác AI & góp ý
│   │   │
│   │   ├── routes/                     # Định nghĩa API endpoints
│   │   │   ├── index.js                # Tổng hợp tất cả router với prefix /api/v1
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── plant.routes.js
│   │   │   ├── garden.routes.js
│   │   │   ├── identification.routes.js
│   │   │   ├── diagnosis.routes.js
│   │   │   ├── care.routes.js
│   │   │   ├── treatment.routes.js
│   │   │   ├── subscription.routes.js
│   │   │   ├── wallet.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── feedback.routes.js
│   │   │   └── dashboard.routes.js     # Thống kê tổng quan (Admin/Manager)
│   │   │
│   │   ├── controllers/                # Xử lý HTTP Request / Response
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── plant.controller.js
│   │   │   ├── garden.controller.js
│   │   │   ├── identification.controller.js
│   │   │   ├── diagnosis.controller.js
│   │   │   ├── care.controller.js
│   │   │   ├── treatment.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   ├── wallet.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── feedback.controller.js
│   │   │   └── dashboard.controller.js
│   │   │
│   │   ├── services/                   # Business Logic & Database Queries
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── plant.service.js
│   │   │   ├── garden.service.js
│   │   │   ├── identification.service.js
│   │   │   ├── diagnosis.service.js
│   │   │   ├── care.service.js
│   │   │   ├── treatment.service.js
│   │   │   ├── subscription.service.js
│   │   │   ├── wallet.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── notification.service.js
│   │   │   ├── chat.service.js
│   │   │   ├── feedback.service.js
│   │   │   └── dashboard.service.js
│   │   │
│   │   ├── middlewares/                # Custom Middlewares
│   │   │   ├── auth.middleware.js      # Xác thực JWT Access Token
│   │   │   ├── authorize.middleware.js # Phân quyền theo Role (RBAC)
│   │   │   ├── validate.middleware.js  # Validate dữ liệu request với Zod
│   │   │   ├── upload.middleware.js    # Multer xử lý upload ảnh cây/bệnh
│   │   │   ├── rate-limiter.middleware.js # Giới hạn request (chống spam AI & Auth)
│   │   │   ├── not-found.middleware.js # 404 Handler
│   │   │   └── error.middleware.js     # Global Error Handler
│   │   │
│   │   ├── validators/                 # Zod validation schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── user.validator.js
│   │   │   ├── plant.validator.js
│   │   │   ├── garden.validator.js
│   │   │   ├── diagnosis.validator.js
│   │   │   ├── treatment.validator.js
│   │   │   ├── subscription.validator.js
│   │   │   ├── wallet.validator.js
│   │   │   ├── payment.validator.js
│   │   │   └── feedback.validator.js
│   │   │
│   │   ├── integrations/               # Kết nối dịch vụ bên thứ ba (External Services)
│   │   │   ├── ai/
│   │   │   │   ├── gemini.client.js    # SDK / Client kết nối Gemini
│   │   │   │   └── plant-ai.service.js # Logic prompt nhận diện và chẩn đoán
│   │   │   ├── storage/
│   │   │   │   └── storage.service.js  # Upload ảnh lên Cloudinary / S3
│   │   │   ├── email/
│   │   │   │   └── email.service.js    # Gửi mail OTP, thông báo (Nodemailer)
│   │   │   ├── payment/
│   │   │   │   └── payment-provider.js # Tích hợp SePay/VNPay Webhook & HMAC
│   │   │   ├── weather/
│   │   │   │   └── weather.service.js  # Lấy thời tiết OpenWeatherMap (hoãn tưới khi mưa)
│   │   │   └── push-notification/
│   │   │       └── fcm.service.js      # Firebase Cloud Messaging đẩy thông báo về app
│   │   │
│   │   ├── jobs/                       # Background Jobs / Cron Jobs
│   │   │   ├── care-reminder.job.js    # Kiểm tra thời tiết & gửi nhắc nhở tưới cây
│   │   │   ├── treatment-reminder.job.js # Nhắc thực hiện phác đồ điều trị 14 ngày
│   │   │   └── subscription-expiry.job.js # Kiểm tra và gia hạn/hết hạn gói Pro
│   │   │
│   │   ├── scripts/                    # Scripts hỗ trợ & Seeding
│   │   │   ├── seed.js                 # Script nạp dữ liệu mẫu ban đầu
│   │   │   ├── plants-seed.json        # Dữ liệu bách khoa thực vật
│   │   │   └── diseases-seed.json      # Dữ liệu bệnh cây mẫu
│   │   │
│   │   ├── utils/                      # Helper Functions
│   │   │   ├── api-error.js            # Custom Error Class
│   │   │   ├── api-response.js         # Chuẩn hóa payload trả về ({success, message, data})
│   │   │   ├── async-handler.js        # Wrapper try-catch cho async controller
│   │   │   ├── pagination.js           # Xử lý phân trang chuẩn (page, limit, skip)
│   │   │   └── crypto.js               # Tạo mã OTP, mã hóa hash HMAC SePay
│   │   │
│   │   ├── constants/                  # Hằng số ứng dụng
│   │   │   ├── roles.js                # Phân quyền (ADMIN, PRO_USER, FREE_USER)
│   │   │   ├── errors.js               # Mã lỗi chuẩn
│   │   │   └── plant.js                # Enum độ ẩm, ánh sáng, nhóm cây
│   │   │
│   │   ├── app.js                      # Khởi tạo Express & đăng ký middleware
│   │   └── server.js                   # Kết nối MongoDB, nạp Cron jobs & listen port
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── mobile/                             # React Native + Expo + TypeScript
│   ├── app/                            # Expo Router (File-based Routing)
│   │   ├── _layout.tsx                 # Root layout (Theme, Providers, Fonts)
│   │   ├── index.tsx                   # Splash / Auth state redirect
│   │   │
│   │   ├── (auth)/                     # Luồng đăng nhập / đăng ký
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── otp-verification.tsx    # Nhập mã xác thực OTP
│   │   │   ├── forgot-password.tsx     # Nhập email nhận OTP khôi phục
│   │   │   └── reset-password.tsx      # Nhập mật khẩu mới sau khi xác thực OTP
│   │   │
│   │   ├── (tabs)/                     # Tab bar chính của ứng dụng
│   │   │   ├── _layout.tsx             # Cấu hình thanh Tab Navigation
│   │   │   ├── index.tsx               # Home (Khám phá, thời tiết hôm nay, tips)
│   │   │   ├── garden.tsx              # Vườn của tôi (Danh sách cây trồng cá nhân)
│   │   │   ├── scan.tsx                # Chụp ảnh / Quét nhận diện & Chẩn đoán bệnh
│   │   │   ├── schedule.tsx            # Lịch trình chăm sóc & điều trị hôm nay
│   │   │   └── profile.tsx             # Trang cá nhân & trạng thái gói tài khoản
│   │   │
│   │   ├── plant/                      # Tra cứu bách khoa thực vật
│   │   │   ├── [id].tsx                # Chi tiết thông tin loài cây
│   │   │   └── search.tsx              # Tìm kiếm & lọc cây theo điều kiện
│   │   │
│   │   ├── garden/                     # Quản lý cây trong vườn của tôi
│   │   │   ├── [id].tsx                # Chi tiết cây cụ thể trong vườn (lịch sử chăm sóc)
│   │   │   ├── add.tsx                 # Thêm cây mới vào vườn
│   │   │   └── edit-[id].tsx           # Chỉnh sửa tên gợi nhớ / vị trí cây
│   │   │
│   │   ├── diagnosis/                  # Chẩn đoán bệnh cây
│   │   │   ├── [id].tsx                # Xem kết quả chi tiết chẩn đoán bệnh
│   │   │   └── history.tsx             # Lịch sử các lần chẩn đoán trước đó
│   │   │
│   │   ├── treatment/                  # Theo dõi phác đồ điều trị bệnh
│   │   │   └── [id].tsx                # Chi tiết phác đồ 14 ngày & checklist hàng ngày
│   │   │
│   │   ├── subscription/               # Quản lý gói Pro
│   │   │   ├── index.tsx               # Bảng so sánh tính năng Free vs Pro
│   │   │   └── checkout.tsx            # Màn hình thanh toán chuyển khoản SePay
│   │   │
│   │   ├── wallet/                     # Quản lý ví Plantify
│   │   │   └── index.tsx               # Số dư & nạp tiền
│   │   │
│   │   ├── notifications.tsx           # Danh sách thông báo
│   │   ├── chat.tsx                    # Chatbot AI / Trợ lý chuyên gia cây trồng
│   │   ├── feedback.tsx                # Góp ý & đánh giá kết quả AI
│   │   └── settings.tsx                # Cài đặt ứng dụng
│   │
│   ├── components/                     # Tái sử dụng giao diện (Dumb/Presentational UI)
│   │   ├── common/
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   ├── LoadingView.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── AppModal.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── plant/
│   │   │   ├── PlantCard.tsx
│   │   │   ├── PlantImage.tsx
│   │   │   └── PlantFilterBar.tsx
│   │   ├── garden/
│   │   │   ├── UserPlantCard.tsx
│   │   │   ├── CareTaskCard.tsx
│   │   │   └── WateringProgressBar.tsx
│   │   ├── diagnosis/
│   │   │   ├── DiagnosisCard.tsx
│   │   │   ├── DiseaseResult.tsx
│   │   │   └── DisclaimerBanner.tsx   # Banner khuyến cáo AI bắt buộc
│   │   └── treatment/
│   │       ├── TreatmentTimeline.tsx   # Dòng thời gian 14 ngày điều trị
│   │       └── DailyTaskChecklist.tsx  # Danh sách việc cần làm trong ngày
│   │
│   ├── services/                       # Tầng giao tiếp HTTP với Backend
│   │   ├── api-client.ts               # Axios instance (gắn token JWT, handle refresh)
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── plant.service.ts
│   │   ├── garden.service.ts
│   │   ├── identification.service.ts
│   │   ├── diagnosis.service.ts
│   │   ├── care.service.ts
│   │   ├── treatment.service.ts
│   │   ├── subscription.service.ts
│   │   ├── wallet.service.ts
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   ├── chat.service.ts
│   │   └── feedback.service.ts
│   │
│   ├── stores/                         # Quản lý State toàn cục (Zustand)
│   │   ├── auth.store.ts               # User info, token, quyền Pro
│   │   ├── app.store.ts                # Network status, app theme
│   │   ├── garden.store.ts             # Cache danh sách cây & task hôm nay
│   │   └── notification.store.ts       # Số lượng thông báo chưa đọc
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useGarden.ts
│   │   ├── useDiagnosis.ts
│   │   ├── useCareSchedule.ts
│   │   └── useDebounce.ts
│   │
│   ├── types/                          # TypeScript Interfaces & Types
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── plant.types.ts
│   │   ├── garden.types.ts
│   │   ├── diagnosis.types.ts
│   │   ├── treatment.types.ts
│   │   ├── payment.types.ts
│   │   └── notification.types.ts
│   │
│   ├── schemas/                        # Zod schemas xác thực form trên app
│   │   ├── auth.schema.ts
│   │   └── garden.schema.ts
│   │
│   ├── providers/                      # App Context & Providers
│   │   └── AppProviders.tsx            # Bọc React Native Paper, SafeArea, Toast
│   │
│   ├── theme/                          # Design System
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── routes.ts                   # Định danh tên các route
│   │   └── app.constants.ts            # Hằng số (max upload size, limits)
│   │
│   ├── utils/
│   │   ├── format-date.ts
│   │   ├── format-currency.ts
│   │   ├── storage.ts                  # Helper đọc/ghi AsyncStorage an toàn
│   │   └── error-message.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── config/
│   │   └── env.ts                      # Đọc biến môi trường EXPO_PUBLIC_API_URL
│   ├── app.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── docs/                               # Tài liệu dự án
│   ├── architecture.md                 # Kiến trúc hệ thống tổng thể
│   ├── api-specification.md            # Đặc tả API endpoints
│   ├── database-design.md              # Thiết kế Database MongoDB (Collections & Indexes)
│   └── business-rules.md               # Quy tắc nghiệp vụ (giới hạn gói Free, hoãn lịch do mưa, phác đồ 14 ngày)
├── .gitignore
└── README.md
```

---

## 3. Quy ước và Trách nhiệm của các Tầng

### 3.1 Backend
- **`routes/`**: Chỉ khai báo endpoints, URL path và gắn middleware tương ứng (authenticate, authorize, validate). Không xử lý logic nghiệp vụ tại đây.
- **`controllers/`**: Nhận HTTP request, gọi xuống tầng `service`, sau đó dùng `utils/api-response.js` để trả về định dạng JSON thống nhất `{ success, message, data }`.
- **`services/`**: Chứa 100% logic nghiệp vụ (business rules) và truy vấn trực tiếp vào database qua Mongoose Models.
- **`models/`**: Khai báo Mongoose Schema, Virtuals, Indexes và Timestamps cho từng collection.
- **`integrations/`**: Đóng gói các SDK hoặc kết nối API bên thứ 3 (Google Gemini, Cloudinary, Nodemailer, SePay/VNPay, OpenWeatherMap, Firebase FCM).
- **`jobs/`**: Các tác vụ chạy ngầm định kỳ bằng `node-cron` (quét thời tiết hoãn tưới, nhắc lịch điều trị 14 ngày, quét hạn gói Pro).

### 3.2 Mobile
- **`app/`**: Tận dụng cơ chế File-based Routing của Expo Router. Màn hình chỉ chịu trách nhiệm compose UI và gọi custom hook hoặc service.
- **`components/`**: Chia theo domain (`plant`, `garden`, `diagnosis`, `treatment`) và `common` (UI dùng chung không mang logic nghiệp vụ).
- **`services/`**: Đóng gói các hàm gọi API thông qua Axios Client (tự động đính kèm JWT Bearer token và xử lý refresh token).
- **`stores/`**: Sử dụng Zustand để quản lý state toàn cục (Auth session, thông tin giỏ hàng/vườn cây, thông báo chưa đọc).
