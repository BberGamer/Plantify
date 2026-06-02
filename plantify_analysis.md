# 🌿 Plantify — Phân tích Toàn diện Dự án

## 1. Tổng quan

Plantify là nền tảng tri thức cây cảnh thông minh kết hợp AI & Neo4j. Đây là dự án **monorepo** môn học kỳ 9, bao gồm:
- **BE**: REST API (Express 5 + Mongoose + MongoDB)
- **FE**: SPA (React 18 + Vite 6 + Tailwind CSS v4 + Shadcn/UI)

---

## 2. Cấu trúc Thư mục

```
Plantify/
├── .cursor/rules/           # 7 file quy tắc cho AI (alwaysApply)
├── guidelines/
│   └── Guidelines.md        # Tài liệu quy tắc chính (345 dòng)
├── BE/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js        # Entry point (Express, CORS, MongoDB)
│       ├── config/db.js     # Kết nối Mongoose
│       ├── middlewares/
│       │   ├── auth.js      # JWT (chỉ có header comment — CHƯA IMPLEMENT)
│       │   ├── errorHandler.js  # (CHƯA IMPLEMENT)
│       │   └── index.js
│       ├── utils/
│       │   ├── apiResponse.js   # (CHƯA IMPLEMENT — chỉ header)
│       │   └── constants.js     # (CHƯA IMPLEMENT — chỉ header)
│       └── features/
│           ├── auth/        # 4 file — TẤT CẢ TRỐNG (chỉ header)
│           ├── plants/      # 4 file — TẤT CẢ TRỐNG
│           ├── products/    # 4 file — TẤT CẢ TRỐNG
│           ├── orders/      # 4 file — TẤT CẢ TRỐNG
│           └── cart/        # 3 file — TẤT CẢ TRỐNG (thiếu cart.model.js!)
└── FE/
    ├── index.html
    ├── vite.config.js       # Alias @/, proxy /api → :5000, Tailwind plugin
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx         # Mount React + RouterProvider + AppProviders
        ├── app/
        │   ├── router.jsx   # createBrowserRouter từ routeTree
        │   ├── routes.jsx   # 3 layout: Public / App / Auth + tất cả routes
        │   └── providers.jsx # ThemeProvider + TooltipProvider + Toaster
        ├── components/
        │   ├── common/      # PlantCard, ThemeToggle, FloatingAIButton, ...
        │   ├── layout/      # Header, PublicLayout, AppLayout, AppSidebar, AuthLayout
        │   └── ui/          # 47 Shadcn/UI primitives
        ├── features/        # 5 domain (auth/cart/orders/plants/products)
        │   └── [domain]/
        │       ├── api.js   # TẤT CẢ TRỐNG
        │       └── hooks/   # TẤT CẢ TRỐNG
        ├── pages/
        │   ├── guest/       # 12 trang: Home, Browse, PlantDetail, Shop, ...
        │   ├── customer/    # Cart, Profile, Settings
        │   ├── sales/       # MyShop, AddProduct
        │   ├── manager/     # Dashboard, Team
        │   └── admin/       # AdminDashboard, AdminUsers
        ├── lib/
        │   ├── api.js       # Axios instance (baseURL từ VITE_API_URL)
        │   ├── roles.js     # USER_ROLES, ROLE_RANK, hasMinimumRole()
        │   ├── constants.js # ROUTES, PUBLIC_NAV, ROLE_SIDEBAR_NAV
        │   ├── utils.js
        │   ├── mock-data.js # MOCK_AI_DIAGNOSIS (dùng tạm cho AI Doctor)
        │   └── ui-preview.js # UI_PREVIEW_USER, uiSidebarRoleFromPath()
        └── styles/
            ├── index.css    # Import chain
            ├── theme.css    # CSS variables (light + dark)
            ├── globals.css
            ├── tailwind.css
            └── fonts.css
```

---

## 3. Rules (.cursor/rules) — 7 File

| File | Nội dung chính |
|------|----------------|
| `plantify-project.mdc` | **Quy tắc ưu tiên nhất.** Cấu trúc BE (4 file/feature), FE (api.js + hooks/ + components/), comment đầu file, workflow từng lát nhỏ, commit Conventional Commits |
| `core-behavior.mdc` | Đọc file trước khi trả lời, hành động thay vì gợi ý, dùng XML tags |
| `code-quality.mdc` | Không over-engineer, tối giản, không helper thừa, chỉ validate ở boundary |
| `agentic-coding.mdc` | Làm từng bước nhỏ, theo dõi tiến trình, an toàn reversible actions |
| `tool-usage.mdc` | Parallel tool calls, không đoán — đọc file, tìm kiếm trước khi kết luận |
| `thinking-reasoning.mdc` | Effort tương xứng độ phức tạp, tránh overthink, tự kiểm tra trước khi xong |
| `output-format.mdc` | Ngắn gọn, trực tiếp, tránh preambles, markdown khi cần thiết |

> 📌 `plantify-project.mdc` được **ưu tiên tuyệt đối** khi xung đột với rules chung.

---

## 4. Stack Công nghệ

### Backend
| Thành phần | Chi tiết |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express **v5** (mới nhất) |
| Database | MongoDB + Mongoose v9 |
| Auth | JWT (chưa implement) |
| Dev | Nodemon |
| Port | 5000 |

### Frontend
| Thành phần | Chi tiết |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS **v4** (plugin `@tailwindcss/vite`) |
| UI Library | Radix UI primitives + Shadcn/UI (47 components) |
| Icons | Lucide React |
| HTTP | Axios (instance tại `lib/api.js`) |
| Routing | React Router v7 |
| Theme | `next-themes` (light/dark) |
| Animation | `motion` (Framer Motion) + `tw-animate-css` |
| Charts | Recharts |
| Toast | Sonner |
| Forms | React Hook Form |
| Language | **JavaScript thuần** (`.js` / `.jsx`) — không TypeScript |
| Port | 5173 |

---

## 5. Kiến trúc & Luồng dữ liệu

### Backend: Routes → Controller → Service → Model
```
Request → routes.js → controller.js → service.js → Mongoose Model → MongoDB
                               ↓
                          apiResponse.js (format thống nhất)
```

### Frontend: Pages chỉ compose UI
```
main.jsx → AppProviders → RouterProvider
                              ↓
        PublicLayout / AppLayout / AuthLayout
                              ↓
               Page (guest/customer/sales/manager/admin)
                              ↓
          features/[domain]/hooks/ → features/[domain]/api.js → lib/api.js → BE
```

### 3 Layout chính
| Layout | Route | Mô tả |
|---|---|---|
| `PublicLayout` | `/` | Header + Footer + FloatingAIButton, background nature image |
| `AppLayout` | `/my-shop`, `/dashboard`, `/admin` | Sidebar theo role (SidebarProvider) + Header |
| `AuthLayout` | `/login`, `/register`, `/forgot-password` | Form centered |

### Role-based Navigation
```
guest → PUBLIC_NAV (Trang chủ, Khám phá, Gian hàng, Bác sĩ AI, Đồ thị tri thức, Blog)
customer → cart, profile, settings
sales → my-shop, my-shop/add-product
manager → dashboard, dashboard/team
admin → admin, admin/users, dashboard
```
Sidebar role được suy ra từ pathname qua `uiSidebarRoleFromPath()` (**chưa có auth thực**).

---

## 6. Trạng thái Hiện tại (tháng 6/2026)

### ✅ Đã có
- **Scaffold toàn bộ**: Tất cả thư mục/file đều được tạo đúng quy tắc
- **FE UI**: 12 trang guest, 3 customer, 2 sales, 2 manager, 2 admin — có UI mock data
- **Routing**: Hoàn chỉnh (3 layout + tất cả routes)
- **Design system**: Theme CSS (light/dark), Tailwind v4, 47 Shadcn components
- **lib/**: `api.js`, `roles.js`, `constants.js`, `mock-data.js`, `ui-preview.js`
- **Layout**: Header responsive, AppSidebar, PublicLayout có footer
- **BE structure**: `server.js` chạy được, `config/db.js` kết nối MongoDB

### ❌ Chưa implement
- **Toàn bộ BE features**: `auth`, `plants`, `products`, `orders`, `cart` — chỉ có header comment
- **`apiResponse.js`** và **`constants.js`** ở BE — trống
- **`auth.js`** (JWT middleware) và **`errorHandler.js`** — trống
- **Tất cả `features/[domain]/api.js`** ở FE — trống
- **Tất cả hooks** ở FE — trống
- **`cart.model.js`** — không tồn tại (feature cart thiếu model!)
- **Auth thực**: Header dùng `UI_PREVIEW_USER` hardcode, role từ pathname
- **Routes đăng ký trong server.js**: Chưa có route nào ngoài test `/`

---

## 7. Vấn đề & Điểm cần lưu ý

> [!WARNING]
> **`cart` feature thiếu `cart.model.js`** — vi phạm quy tắc "4 file mỗi feature". Cần tạo thêm.

> [!WARNING]
> **`server.js` chưa mount bất kỳ feature route nào.** Khi implement xong các controller/service cần `app.use('/api/auth', authRoutes)` v.v.

> [!NOTE]
> **Auth là mock UI**: `UI_PREVIEW_USER` hardcode, `uiSidebarRoleFromPath` đoán role từ URL — cần replace bằng auth context thực sau khi implement BE auth.

> [!NOTE]
> **`MONGO_URI` vs `MONGODB_URI`**: `.env.example` dùng `MONGODB_URI`, nhưng `db.js` đọc `process.env.MONGO_URI` — cần đồng bộ tên biến.

> [!NOTE]
> **`bcryptjs` và `jsonwebtoken` chưa có trong `BE/package.json`** — cần `npm install` khi implement auth.

---

## 8. Thứ tự Implement Được Khuyến nghị (theo Guidelines)

```
Mỗi feature: model → service → controller → routes → đăng ký server.js
             → FE api.js → FE hooks → FE pages kết nối thật
```

**Ưu tiên:**
1. `BE utils/apiResponse.js` + `utils/constants.js`
2. `BE middlewares/auth.js` + `middlewares/errorHandler.js`
3. `BE features/auth/` (model User → service → controller → routes)
4. `BE features/plants/` (model → service → controller → routes)
5. `BE features/products/` + `cart/` (tạo thêm `cart.model.js`) + `orders/`
6. `FE features/auth/api.js` + hooks → connect Login/Register pages
7. `FE features/plants/api.js` + hooks → connect Browse/PlantDetail
8. Tiếp tục các domain còn lại

---

## 9. Commit Convention (nhắc nhở)

```bash
# Format
<type>(<scope>): <mô tả tiếng Việt, thì hiện tại>

# Ví dụ từng lát
feat(auth): thêm User model (Mongoose schema)
feat(auth): thêm auth service (login, register)
feat(auth): thêm auth controller và routes
feat(auth): đăng ký auth routes trong server.js
feat(auth): thêm FE api.js cho auth
feat(auth): thêm useAuth hook
feat(auth): kết nối Login page với auth hook
```
