# Plantify

Ứng dụng chăm sóc cây gồm mobile React Native/Expo và REST API Node.js/Express, lưu dữ liệu bằng MongoDB. Có ba vai trò `customer`, `manager`, `admin`; khu vực quản trị nằm trong ứng dụng mobile, chưa có web CMS riêng.

README được đối chiếu với source ngày **31/10/2026**. Trạng thái dưới đây mô tả phần đã triển khai trong mã nguồn, không đồng nghĩa đã kiểm thử tích hợp hoặc sẵn sàng production.

Chat lưu câu hỏi–trả lời theo tài khoản/hội thoại trong `chat_turns`, tải lại lịch sử
gần nhất và hiển thị thời gian phản hồi. Đã bỏ tự chấm và bảng CCC khỏi màn chat;
API chấm CCC đã được gỡ; chat không đọc file kiến thức hoặc rubric từ backend/data.
Bộ [30 test case, đo thời gian và xuất CSV](backend/CHAT_TEST_REPORT.md)
hỗ trợ báo cáo thủ công trước/sau.

Chat hiện có thêm tra cứu bộ câu hỏi–đáp chuẩn trong MongoDB collection `chat_faqs`.
Chỉ bản ghi `approved`, ngôn ngữ `vi` được sử dụng; câu khớp chính xác hoặc alias
trả nguyên đáp án, câu khác gọi AI như trước.

### Cây yêu thích của customer

Trong danh mục hoặc chi tiết cây, customer bấm trái tim để lưu/bỏ yêu thích. Tại **Tài khoản → Cây yêu thích của tôi**, có tổng số cây, chỉnh sửa danh sách, xem chi tiết, thêm vào vườn qua form hiện có và khám phá thêm cây. Dữ liệu lưu theo tài khoản trong `favorite_plants`; cây bị ẩn/xóa không hiển thị trong danh sách.

Theo BR-25 trong Report 3, tài khoản Free lưu tối đa 5 cây. Hiện chưa có hệ thống xác thực gói Pro nên backend áp dụng hạn mức Free cho mọi customer. Unique index theo tài khoản/slot bảo vệ các yêu cầu thêm đồng thời; dữ liệu cũ vẫn được tính vào hạn mức. Backend cần quyền tạo index MongoDB. Chưa triển khai mua/nâng cấp Pro.

API customer đang hoạt động: `GET /api/favorites/plants` (page/limit), `GET /api/favorites/plants/status?ids=...`, `PUT /api/favorites/plants/:plantId`, `DELETE /api/favorites/plants/:plantId`. PUT/DELETE có thể gọi lại an toàn; vượt hạn mức trả 409 với code `FAVORITE_LIMIT_REACHED`.

Kiểm tra: tại `backend/`, chạy `node --test src/services/__tests__/favorite.test.cjs`; tại `mobile/`, chạy `node --test src/hooks/favoriteDetail.test.cjs`. Test dùng mock, cần kiểm thử bổ sung với MongoDB và thiết bị thật.

### Thêm cây vào vườn

Customer có thể chọn **Thêm cây** trong My Garden hoặc **Thêm vào vườn cây** từ chi tiết cây thư viện. Form lưu biệt danh, loài, vị trí, chậu và ngày nhận cây; ảnh JPG/PNG tối đa 10 MB là tùy chọn. Ngày nhận cây chọn bằng lịch, hiển thị DD/MM/YYYY, có thể để trống/xóa và không được sau hôm nay (theo múi giờ Việt Nam). Cây nhập tay không cần danh mục; cây thư viện giữ danh mục có sẵn. Chưa tạo lịch chăm sóc trong luồng này.

Backend cần biến môi trường `PUBLIC_BASE_URL` là địa chỉ gốc công khai, ví dụ `http://192.168.1.10:5000` (không thêm `/api`). Mobile dùng `EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api`. Khi dùng thiết bị thật, thay IP bằng địa chỉ máy chạy backend mà điện thoại truy cập được. Thiếu `PUBLIC_BASE_URL` vẫn lưu cây không ảnh, nhưng upload trả lỗi 503.

File ảnh nằm trong `backend/uploads/plants`, được phục vụ tại `/uploads/plants/...`; MongoDB chỉ lưu URL. Cần volume bền vững và sao lưu thư mục này khi triển khai. URL ảnh công khai; backend tự đặt tên ngẫu nhiên và loại metadata ảnh. `POST /api/garden/plants` hỗ trợ JSON như trước và multipart với một trường file `photo`.

Kiểm tra chức năng: chạy `node --test tests/garden-create.test.cjs` trong `backend/` và `node --test tests/addGardenPlant.test.cjs` trong `mobile/`. Test backend mock truy vấn database; không thay thế kiểm thử MongoDB và thiết bị thật.

## Chẩn đoán ảnh thật (cập nhật 10/11/2026)

Luồng đã nối: **chụp/chọn ảnh → mobile → `POST /api/diagnosis` → Python YOLO → kết quả**.
Backend xác thực customer đang hoạt động trước khi nhận ảnh. Ảnh JPEG/PNG/WebP tĩnh,
tối đa 10 MiB và 25 megapixel, được chuyển nguyên bytes/EXIF sang Python; không lưu
ảnh hoặc kết quả chẩn đoán vào database. Model nạp một lần từ
`inference/model/weights/best_macro_f1.pt`, đúng 78 class và pad 384×384 của notebook.
Bộ model hiện tại là run `PlantWild78_YOLO26m_20261111T094602654958Z_2b02c35f`,
train 95 epoch; checkpoint được chọn theo validation Macro F1 tại epoch 63.
Mapping gồm 78 class (ID 0–77), đã đồng bộ với taxonomy tiếng Việt của backend.

App hiển thị kết quả thật bằng tiếng Việt, trạng thái phân tích và lỗi/thử lại. Kết quả
yếu hoặc phân vân **không được trình bày như kết luận bệnh**; ảnh quá nhỏ, gần như
trống hoặc quá tối/sáng yêu cầu chụp lại. Chỉ khi kết quả vượt ngưỡng mới hiển thị
gợi ý nhận diện. Các ngưỡng mặc định là quy tắc tạm thời, chưa được hiệu chỉnh:
top-1 từ 0.70, chênh top-1/top-2 từ 0.15; dưới 0.35 chuyển sang chưa nhận diện được.
Điểm mô hình không phải độ chính xác hay xác suất đã hiệu chỉnh. Classifier chỉ có
78 class, vẫn có thể tự tin với ảnh không phải cây; đây không phải bộ phát hiện OOD.

Tên cây/bệnh lấy từ taxonomy kiểm tra theo mapping model. Thông tin triệu chứng/chăm
sóc chỉ lấy từ danh mục database khi khớp duy nhất theo alias chính xác, bệnh còn
active và liên kết với cây qua `common_disease_ids`. Không có mapping thì vẫn hiển
thị gợi ý model nhưng không bịa nội dung bệnh/phác đồ hay MongoDB ID. Không tự áp
dụng lịch điều trị từ ảnh; luồng chọn cây/phác đồ và xác nhận điều trị vẫn riêng biệt.

Cần chạy cả Python, Express và Expo. Tại root repo, mở terminal Python:

```powershell
inference/.venv/Scripts/python.exe -m inference
```

Terminal khác chạy backend như thường lệ (`cd backend; npm run dev`), rồi mobile
(`cd mobile; npm start`). Backend mặc định gọi `http://127.0.0.1:8001`; khi tách máy/
container, đặt `DIAGNOSIS_INFERENCE_URL`. Mobile vẫn chỉ dùng `EXPO_PUBLIC_API_URL`
trỏ vào Express, không gọi thẳng Python. Chi tiết API, cấu hình và kiểm thử:
[backend/DIAGNOSIS_API.md](backend/DIAGNOSIS_API.md), [inference/README.md](inference/README.md).

## Tiến độ hiện tại

Màn **Chẩn đoán bệnh** tại `/customer/diagnosis` mở từ Home hoặc camera trên Navbar.
Nút **Phân tích ảnh** gửi ảnh đã chọn đến backend và hiển thị dữ liệu model thật;
đã bỏ kết quả mẫu. Có chụp ảnh, chọn lại, xem ảnh, retry lỗi, thông báo kết quả
không chắc chắn và hướng dẫn chụp lại. Ảnh chỉ giữ tạm trong màn hình và request,
không tự lưu album hoặc lịch sử chẩn đoán. Web hỗ trợ chọn ảnh; quyền camera bị
từ chối vẫn cho phép chọn album. Camera/album và hiển thị cần kiểm thử thiết bị thật.

Sau khi lấy code mới, chạy `npm ci` trong `mobile/` và khởi động lại Expo. Với development build, cần build lại app để áp dụng module native và cấu hình quyền mới; camera cần kiểm thử trên điện thoại thật. Triển khai dựa trên [Expo Camera](https://docs.expo.dev/versions/v58.0.0/sdk/camera/) và [Expo ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/).

Kiểm tra luồng chẩn đoán theo [DIAGNOSIS_API.md](backend/DIAGNOSIS_API.md). Test hook/service dùng mock thiết bị và phiên; không thay kiểm thử camera/album thực tế.

| Phạm vi | Đã triển khai | Giới hạn / phần còn lại |
| --- | --- | --- |
| Tài khoản | Đăng ký OTP email, đăng nhập, reset password, hồ sơ và phiên trên thiết bị | Các lỗi vòng đời phiên nằm trong kế hoạch; chưa có refresh-token flow |
| Admin | Thêm người dùng, danh sách, tìm kiếm, phân trang, sửa user/role/status | Quản trị viên khác chỉ được xem; bản thân sửa tên/SĐT |
| Manager | CRUD cây và các tab khu vực quản lý | Màn bệnh cây/điều trị mới là placeholder |
| Tra cứu cây | Danh sách, bộ lọc và chi tiết từ API | Chưa có tải trang tiếp theo cho toàn bộ danh sách |
| Home/vườn/yêu thích | UI và một số dữ liệu minh họa | Một số nút chưa kết nối backend; thêm vào vườn chưa lưu thật |
| Dịch vụ ngoài | Email OTP qua SMTP/Nodemailer; chat văn bản qua API AI tương thích OpenAI | Weather API, payment/wallet, FCM, jobs và web CMS chưa triển khai |

Ưu tiên nối tiếp từ hiện trạng: kết nối mobile với API vườn, triển khai lịch chăm sóc/điều trị và các tích hợp còn thiếu, bổ sung bộ kiểm thử có thể chạy từ bản clone mới. Đây là phần còn lại quan sát từ source, không thay thế kế hoạch hay SRS được nhóm duyệt.

## Cấu trúc và công nghệ

```text
backend/
  src/
    config/              Kết nối MongoDB
    routes/              auth, users, plants, diseases, garden
    controllers/         Nhận request và trả response
    services/            Nghiệp vụ, truy vấn Mongoose
    validators/          Validation auth/user/plant/garden
    models/              User, Plant, PlantCategory, Disease, UserPlant
    middlewares/         JWT, phân quyền, quyền vườn, xử lý lỗi
    integrations/email/  Gửi OTP
    utils/               AppError và response helper
    app.js               Express app và mount route
    server.js            Nạp cấu hình, kết nối DB, mở server
mobile/
  app/                   Expo Router: auth, khách hàng, admin, manager, plants
  src/
    components/          UI theo từng khu vực
    hooks/               Form, danh sách, phân trang và vòng đời màn hình
    services/            Axios, API service, adapter danh sách, lưu phiên
    constants/           Vai trò và route auth
    theme/               Màu sắc, token, Paper theme
    utils/               Chuẩn hóa thông báo lỗi
  store/                 Auth store Zustand
```

- Backend: JavaScript CommonJS, Express 4, Mongoose 7, JWT, bcryptjs, Nodemailer.
- Mobile: JavaScript ES Modules, Expo `~58.0.21`, Expo Router `~58.0.28`, React Native `0.88.1`, React `19.3.0`, React Native Paper, Axios, Zustand.
- Luồng chính: screen → hook → mobile service → REST API → controller → service → Mongoose. Phiên dùng chung được quản lý qua auth store.

Phiên bản và scripts cụ thể nằm trong [backend/package.json](backend/package.json) và [mobile/package.json](mobile/package.json); mỗi package có lockfile riêng.

## Chuẩn bị môi trường

- Node.js và npm. `mobile/package.json` khai báo Node `>=22.13.0 <23 || >=24.3.0 <25 || >=26.0.0 <27`; repository chưa có `.nvmrc`.
- MongoDB có thể kết nối từ backend. Để thêm/sửa/xóa bệnh cây, dùng replica set hoặc cluster hỗ trợ transaction; MongoDB standalone không đáp ứng luồng ghi này.
- Tài khoản Gmail SMTP và mật khẩu ứng dụng phù hợp để gửi OTP.
- Client Expo tương thích SDK của repository hoặc môi trường chạy Android/iOS/web tương ứng. iOS simulator cần macOS.

## Chạy backend

Từ root, dùng PowerShell:

```powershell
cd backend
npm ci
Copy-Item -LiteralPath .env.example -Destination .env -NoClobber
```

Chỉ copy khi chưa có `.env`. Điền cấu hình trước khi khởi động:

| Biến được source sử dụng | Mục đích |
| --- | --- |
| PORT, NODE_ENV | Cổng và chế độ chạy |
| MONGO_URI, DB_NAME | Kết nối MongoDB và tên database |
| JWT_SECRET, JWT_EXPIRES_IN | Ký JWT và thời hạn; đặt secret riêng, không dựa vào fallback trong code |
| EMAIL_USER, EMAIL_PASS | Tài khoản SMTP gửi OTP |
| AI_API_KEY, AI_BASE_URL, AI_MODEL, AI_TIMEOUT_MS | Chat AI; URL mặc định https://platform.beeknoee.com/api/v1; model phải là ID thật; timeout 1000–45000ms, mặc định 30000ms |
| AI_CHAT_MAX_TOKENS, AI_CHAT_HISTORY_PAIRS | Ưu tiên câu trả lời ngắn: mặc định 800 token, 3 cặp gần nhất và ngân sách ngữ cảnh 6000 ký tự. Thay model/cấu hình cần đo lại chất lượng và tốc độ; không bảo đảm mọi request dưới 5 giây. |
| AI_EVALUATION_ENABLED, AI_EVALUATOR_MODEL | Bật/tắt chấm CCC tự động; judge mặc định dùng AI_MODEL; phát sinh thêm lượt gọi AI khi có đáp án tham chiếu |

```powershell
npm run dev
```

`npm start` chạy server bằng Node, không dùng nodemon. Backend chỉ mở cổng sau khi kết nối MongoDB thành công. Health check: `GET http://localhost:5000/health`; API prefix: `/api`.

Script `npm run seed` có khai báo nhưng `backend/src/scripts/seed.js` chưa tồn tại. Repository chưa có bước seed hoặc tạo Admin đầu tiên tự động; cần chuẩn bị tài khoản quản trị/dữ liệu ban đầu riêng. Đăng ký qua OTP tạo tài khoản Customer.

Các biến AI/weather/payment/FCM/refresh trong `.env.example` chưa chứng minh có tích hợp tương ứng.

## Chạy mobile

Mở terminal khác từ root:

```powershell
cd mobile
npm ci
npm start
```

Có thể dùng `npm run android`, `npm run ios` hoặc `npm run web`. Nếu PowerShell chặn `npm.ps1`, dùng `npm.cmd` thay cho `npm`.

Để cấu hình backend, tạo `mobile/.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=http://<IP-máy-chạy-backend>:5000/api
```

Nếu không đặt biến, Axios mặc định dùng `http://10.0.2.2:5000/api` trên Android và `http://localhost:5000/api` ở nền tảng khác. Điện thoại thật cần địa chỉ backend mà thiết bị truy cập được; `localhost` trên điện thoại không trỏ tới máy phát triển. Khởi động lại Expo sau khi đổi cấu hình.

Các màn chính:

Mobile mới dùng prefix `/api`. Backend cũng hỗ trợ alias `/api/v1` để các client còn cấu hình cũ tiếp tục hoạt động. Khởi động lại Expo sau khi đổi `EXPO_PUBLIC_API_URL`.

| Route mobile | Nội dung |
| --- | --- |
| `/auth/login`, `/auth/register`, `/auth/reset-password` | Xác thực tài khoản |
| `/customer` | Trang chủ |
| `/customer/garden`, `/customer/chat`, `/customer/profile` | Vườn, chat AI có lịch sử/đánh giá CCC, hồ sơ |
| `/plants`, `/plants/PlantList` | Danh mục và chi tiết cây (ID qua params) |
| `/admin/users`, `/admin/profile` | Quản lý người dùng và hồ sơ Admin |
| `/manager/plants`, `/manager/diseases` | Quản lý cây và bệnh cây |
| `/manager/treatments`, `/manager/profile` | Điều trị placeholder và hồ sơ Manager |

## API hiện có

Đường dẫn dưới đây nằm sau prefix `/api`. Request được bảo vệ dùng header `Authorization: Bearer <token>`.

| Method | Endpoint | Truy cập |
| --- | --- | --- |
| POST | `/auth/register/send-otp`, `/auth/register/verify-otp` | Public |
| POST | `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` | Public |
| POST | `/diagnosis` (multipart `photo`) | Customer đang hoạt động |
| POST | `/auth/logout` | JWT |
| GET, PATCH | `/auth/me` | JWT |
| GET, POST | `/users` | Admin |
| GET, PUT, PATCH | `/users/:id` | Admin |
| PATCH | `/users/:id/status`, `/users/:id/role` | Admin |
| GET | `/plants/categories`, `/plants`, `/plants/:id` | Public |
| GET, POST | `/plants/manager` | Admin hoặc Manager |
| PUT, DELETE | `/plants/manager/:id` | Admin hoặc Manager |
| GET | `/diseases`, `/diseases/:id` | Public, chỉ bệnh active |
| GET, POST | `/diseases/manager` | Admin hoặc Manager |
| GET, PUT, DELETE | `/diseases/manager/:id` | Admin hoặc Manager |
| GET, POST | `/garden/plants` | Customer đang hoạt động |
| GET, PATCH | `/garden/plants/:id` | Customer sở hữu cây |
| PATCH | `/garden/plants/:id/archive` | Customer sở hữu cây |

`/admin/users` là alias backend của `/users`, có cùng middleware. Admin tạo tài khoản bằng `POST /users`: tài khoản hoạt động ngay, không cần OTP; API không cấp token mới hoặc thay phiên của Admin.

API bệnh hỗ trợ tìm kiếm, phân trang, lọc theo `plant_id`; API quản lý thêm lọc `status`. Khi tạo/sửa bệnh phải chọn ít nhất một cây liên quan. Liên kết được lưu qua `Plant.common_disease_ids`; xóa bệnh đồng thời gỡ liên kết khỏi cây.

API vườn hỗ trợ `page`, `limit`, `search`, `health_status`, `category_id`, `archived`. Lưu trữ dùng `PATCH /:id/archive`, không xóa bản ghi; cây đã lưu trữ không được sửa. Middleware vườn xác nhận lại trạng thái/vai trò từ database; middleware Admin/Manager hiện dựa vào role trong JWT.

Response thường có `{ success, message, data }`; lỗi có thể kèm `code`, `errors`. Danh sách cây/bệnh/vườn trả dữ liệu cùng `total`, `page`, `limit`, `totalPages`; danh sách user dùng `users` và object `pagination`. Mobile có adapter để chuẩn hóa các dạng danh sách.

## Kiểm tra hiện tại

Hai package chưa khai báo scripts `test`, `lint`, `format` và repository chưa có workflow CI. Backend có dependency Jest/Supertest, nhưng chưa có bộ test backend được theo dõi trong Git. Mobile hiện chỉ theo dõi một số test helper; file test cục bộ nằm trong đường dẫn bị `.gitignore` bỏ qua. Vì vậy, bản clone mới chưa có bộ test hoàn chỉnh để chạy theo README.

Có thể kiểm tra tính tương thích dependency mobile sau khi cài đặt:

```powershell
cd mobile
npx.cmd expo install --check
```

Đây là kiểm tra dependency, không thay thế kiểm thử chức năng. Khi kiểm thử tích hợp, cần xác minh riêng OTP/email thật, quyền Admin/Manager/Customer, CRUD cây/bệnh (cả transaction), quyền sở hữu vườn và vòng đời phiên trên thiết bị. Việc cập nhật README này chỉ đối chiếu source và cấu hình, chưa xác nhận các luồng đó trên database hoặc Android/iOS.

## Tài liệu và quy ước làm việc

Hướng dẫn agent, quy ước code, kiến trúc, thiết kế và kế hoạch refactor được nhóm chia sẻ riêng; `docs/`, `rules/` và hướng dẫn agent không phân phối qua Git. README phải dùng được độc lập với các tài liệu nội bộ đó.

Khi thay đổi source, cập nhật tiến độ, API và hướng dẫn chạy tương ứng. Không commit `.env`, credential, OTP, token hoặc output build.
