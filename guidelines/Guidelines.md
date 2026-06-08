# Plantify - Project Guidelines

Hướng dẫn tổ chức code và quy tắc phát triển để dự án **gọn gàng, clean, dễ maintain và dễ review**.

## 1. Mục tiêu của Guidelines

- Code dễ hiểu, ai nhìn vào cũng biết file nào làm gì.
- Giữ tính nhất quán giữa các thành viên và AI hỗ trợ.
- Dễ mở rộng tính năng mới.
- Phù hợp cho dự án môn học và demo.

---

## 2. Cấu trúc Dự án

### Backend (`BE/src/`)

```bash
src/
├── config/              # Kết nối DB, env, config
│   └── db.js
│
├── middlewares/         # Auth, Error, Validate...
│   ├── auth.js
│   ├── errorHandler.js
│   └── index.js
│
├── features/            # ← TẤT CẢ TÍNH NĂNG
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   └── auth.service.js
│   ├── plants/
│   │   ├── plant.model.js
│   │   ├── plant.routes.js
│   │   ├── plant.controller.js
│   │   └── plant.service.js
│   ├── products/
│   ├── orders/
│   └── cart/
│
├── utils/
│   ├── apiResponse.js   # Format response thống nhất
│   └── constants.js
│
└── server.js            # Entry point
```

### Frontend (`FE/src/`)

```bash
src/
├── components/
│   ├── common/          # Component dùng chung (PlantCard, ThemeToggle...)
│   ├── layout/          # AppLayout, Header, Sidebar...
│   └── ui/              # Shadcn/UI primitives
│
├── features/            # Logic theo domain (song song với BE)
│   ├── auth/
│   │   ├── api.ts
│   │   ├── hooks/
│   │   └── components/  # (chỉ component đặc thù)
│   ├── plants/
│   ├── products/
│   ├── orders/
│   └── cart/
│
├── pages/               # Trang theo role (giữ nguyên)
│   ├── guest/
│   ├── customer/
│   ├── sales/
│   ├── manager/
│   └── admin/
│
├── lib/
│   ├── api.ts           # Axios instance
│   ├── utils.ts
│   ├── roles.js         # Định nghĩa vai trò & quyền (thay thế src/types/)
│   └── constants.js
│
└── styles/
```

> **Lưu ý:** Dự án đã chuyển hoàn toàn từ TypeScript sang JavaScript. Toàn bộ file trong `FE/src/` sử dụng đuôi `.js` / `.jsx`. Không còn file `.ts` / `.tsx` trong FE.

---

## 3. Quy tắc Code Chung (Quan trọng)

### Tên file & Thư mục

| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Folder | `kebab-case` | `plant-detail` |
| File | `camelCase` | `plant.controller.js`, `plantDetail.jsx` |

- Tên file phải **rõ chức năng**: `auth.routes.js`, `plant.service.js`.
- Frontend: `.jsx` cho component có JSX, `.js` cho logic thuần túy.

### Comment bắt buộc

Mỗi file phải có comment mô tả ở **đầu file**:

```javascript
// auth.routes.js
// Định nghĩa các route liên quan đến Authentication
```

Frontend component:

```jsx
// plantDetail.jsx
// Hiển thị chi tiết một loại cây
```

### Response Format (Backend)

Luôn trả về theo format thống nhất:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": { }
}
```

---

## 4. Quy tắc Backend

- Mỗi feature chỉ có **tối đa 4 file**: `routes`, `controller`, `service`, `model`.
- **`routes.js`**: Chỉ định nghĩa route + middleware.
- **`controller.js`**: Nhận request, gọi service, trả response.
- **`service.js`**: Chứa toàn bộ business logic.
- **Không** để logic database trực tiếp trong controller.

---

## 5. Quy tắc Frontend

| Thư mục | Trách nhiệm |
|---------|-------------|
| `pages/` | Chỉ compose UI và gọi hook từ `features/` |
| `features/[domain]/api.ts` | Các hàm gọi API |
| `features/[domain]/hooks/` | Custom hooks (`useLogin`, `usePlants`, ...) |
| `features/[domain]/components/` | Chỉ component **đặc thù** của domain |
| `components/common/` | Component dùng chung toàn app |

- Logic state, fetch data → **ưu tiên tách thành Custom Hooks**.
- Dự án dùng **JavaScript thuần** (`.js` / `.jsx`), không có TypeScript.
- Dùng `@/` alias trong code (đã cấu hình trong `jsconfig.json` và `vite.config.js`).
- Không dùng generic, type annotation, interface — chỉ plain JS objects.

---

## 6. Best Practices

- Không hardcode URL API → dùng `lib/api.ts`.
- Component phải nhỏ, chỉ làm **một trách nhiệm**.
- Luôn dùng `async/await` + `try/catch`.
- Đặt tên biến/hàm rõ ràng, có ý nghĩa.
- Trước khi thêm tính năng mới → tạo folder trong `features/` trước.
- Luôn cập nhật `Guidelines.md` khi thay đổi cấu trúc lớn.
- Vite là bundler, `npm run build` chạy bình thường với `.jsx` và JSX runtime (`jsx()`, `jsxs()`) — đây là cú pháp JSX hợp lệ, không phải TypeScript.

---

## 7. Cách Thêm Tính Năng Mới

1. Tạo folder tương ứng trong `BE/src/features/` và `FE/src/features/`.
2. Thêm route vào `server.js`.
3. Cập nhật `Guidelines.md` nếu cần.

### Cấu hình Build (Vite + Tailwind)

| File | Vai trò |
|------|---------|
| `vite.config.js` | Alias `@/` → `src/`, plugin Tailwind, proxy API |
| `tailwind.config.js` | Content paths, theme (có thể chứa function config) |
| `jsconfig.json` | Alias `@/` cho IDE autocomplete |
| `index.html` | Entry point, `<script type="module" src="/src/main.jsx">` |

> **Lưu ý:** Backend vẫn dùng **CommonJS** (`module.exports`, `require`). Frontend dùng **ESM** (Vite tự resolve).

---

## 8. Quy tắc Commit (Conventional Commits)

Chúng ta sử dụng **Conventional Commits** để commit message rõ ràng, dễ theo dõi lịch sử thay đổi.

### Định dạng Commit

```bash
<type>(<scope>): <mô tả ngắn gọn>

<body> (tùy chọn)
```

### Các loại Type phổ biến

| Type | Ý nghĩa | Ví dụ |
|------|---------|-------|
| `feat` | Tính năng mới | `feat(plants): thêm chức năng tìm kiếm cây` |
| `fix` | Sửa lỗi | `fix(auth): sửa lỗi đăng nhập Google` |
| `refactor` | Tối ưu code, không sửa lỗi hay thêm tính năng | `refactor: tách logic plants service` |
| `style` | Chỉ sửa format, khoảng trắng, semicolon... | `style: format code theo guideline` |
| `docs` | Thay đổi tài liệu | `docs: cập nhật Guidelines.md` |
| `chore` | Công việc bảo trì, build, config | `chore: cập nhật dependencies` |
| `test` | Thêm hoặc sửa test | `test: thêm test cho auth service` |
| `perf` | Cải thiện hiệu năng | `perf: tối ưu query get all plants` |

### Quy tắc Commit

- Commit message phải bằng **tiếng Việt** hoặc **tiếng Anh** (ưu tiên tiếng Việt).
- Dòng đầu tiên **không quá 72 ký tự**.
- Viết ở **thì hiện tại** (`add`, `fix`, `update`...).
- **Scope** nên ghi tên feature (`auth`, `plants`, `products`, `orders`...).
- **Mỗi commit chỉ nên làm một việc.**

### Commit thường xuyên (khi dùng AI)

Tránh để AI code **cả feature / hàng trăm dòng** rồi mới commit một lần. Chia nhỏ theo lớp:

`model` → `service` → `routes/controller` → `api.ts` → `hooks` → `UI`

Sau mỗi bước xong (review hoặc chạy được): **commit ngay** với message Conventional Commits.

Project Rule `plantify-workflow.mdc` bắt AI **nhắc điểm dừng + gợi ý message** sau mỗi lát; AI **không** tự commit trừ khi bạn yêu cầu.

**Câu prompt gợi ý khi bắt đầu chat:**

```text
Làm từng bước nhỏ theo Guidelines. Sau mỗi bước dừng và nhắc tôi commit
(kèm message Conventional Commits). Chỉ làm bước 1: [mô tả cụ thể].
```

```text
feat(plants): [phần bạn muốn]. Xong bước này thì dừng, đừng làm tiếp FE.
```

### Ví dụ commit tốt

```bash
feat(plants): thêm API lấy danh sách cây theo danh mục

- Thêm endpoint GET /api/plants?category=...
- Cập nhật plant service
- Thêm validation query
```

```bash
fix(auth): sửa lỗi validate password khi đăng ký
```

```bash
refactor: di chuyển PlantCard vào components/common
```

---

## 9. Quy tắc Comment & Code Style (Bắt buộc)

### Khi viết code (Backend & Frontend)

**Mục tiêu:** Bất kỳ ai (giảng viên, bạn, AI) mở file lên cũng hiểu được code đang làm gì mà không cần hỏi.

#### Quy tắc Comment

- **Mỗi file** phải có comment mô tả ở đầu file (tên file + mục đích).
- **Mỗi hàm** quan trọng phải có comment giải thích:
  - Hàm làm gì?
  - Tham số đầu vào là gì?
  - Kết quả trả về là gì?
- **Các khối logic lớn** nên có comment phân chia (`// === PHẦN 1: Xử lý ... ===`).
- Comment bằng **tiếng Việt**, rõ ràng, ngắn gọn.
- Không comment thừa (ví dụ: comment `const x = 1` là không cần thiết).

#### Ví dụ comment tốt

```javascript
// auth.service.js
// Xử lý toàn bộ business logic liên quan đến Authentication

/**
 * Đăng nhập người dùng
 * @param {string} email
 * @param {string} password
 * @returns {Object} { token, user }
 */
async function login(email, password) {
  // 1. Tìm user theo email
  const user = await User.findOne({ email });
  if (!user) throw new Error('User không tồn tại');

  // 2. Kiểm tra mật khẩu
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Sai mật khẩu');

  // 3. Tạo token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

  return { token, user: { id: user._id, name: user.name, role: user.role } };
}
```

### Quy tắc Code Style

- Giữ code ngắn gọn, không dài dòng.
- Một hàm chỉ nên làm **một việc chính**.
- Sử dụng `async/await`, tránh callback hell.
- Xử lý lỗi bằng `try/catch`.
- Đặt tên biến/hàm rõ ràng, có ý nghĩa (ví dụ: `getAllPlants`, `calculateTotalPrice`).

> **Lưu ý cho AI (Cursor, Claude, Grok...):** Khi viết code cho dự án này, phải tuân thủ nghiêm ngặt quy tắc comment và style ở phần 9. Khi tạo commit, tuân thủ Conventional Commits ở phần 8.
---

**Mục tiêu cuối cùng:** Code phải sạch đến mức người mới mở project lên trong **5 phút** cũng hiểu được toàn bộ cấu trúc.
