# Plantify

Backend My Garden: đã có API thêm/xem/sửa/lưu trữ, tìm kiếm, lọc và phân trang
tại `/api/v1/garden/plants`, yêu cầu Customer đang hoạt động. Xem
[hợp đồng API](backend/GARDEN_API.md). Frontend vườn vẫn dùng dữ liệu demo.

Ứng dụng chăm sóc cây gồm mobile React Native/Expo và REST API Node.js/Express. Repository hiện dùng JavaScript; khu vực Admin/Manager nằm trong ứng dụng mobile.

## Tài liệu nội bộ

Hướng dẫn agent, quy ước code, kiến trúc, thiết kế và kế hoạch refactor được nhóm gửi riêng, không phân phối qua Git. README chứa thông tin khởi chạy và hiện trạng cần thiết cho người nhận repository.

## Hiện trạng

| Phạm vi | Đã có trong source | Giới hạn |
| --- | --- | --- |
| Tài khoản | Đăng ký OTP email, đăng nhập, reset password, hồ sơ và phiên trên thiết bị | Các lỗi vòng đời phiên nằm trong kế hoạch; chưa có refresh-token flow |
| Admin | Thêm người dùng, danh sách, tìm kiếm, phân trang, sửa user/role/status | Quản trị viên khác chỉ được xem; bản thân sửa tên/SĐT |
| Manager | CRUD cây và các tab khu vực quản lý | Màn bệnh cây/điều trị mới là placeholder |
| Tra cứu cây | Danh sách, bộ lọc và chi tiết từ API | Chưa có tải trang tiếp theo cho toàn bộ danh sách |
| Home/vườn/yêu thích | UI và một số dữ liệu minh họa | Một số nút chưa kết nối backend; thêm vào vườn chưa lưu thật |
| Dịch vụ ngoài | Email OTP qua SMTP/Nodemailer | AI, weather API, payment/wallet, FCM, jobs và web CMS chưa triển khai trong source hiện tại |

Không suy ra tính năng đã hoạt động chỉ từ tên tab hoặc biến có trong .env.example.

Admin có thể thêm tài khoản tại `/admin/users` bằng họ tên, email, mật khẩu, vai trò
và số điện thoại tùy chọn. Tài khoản mới hoạt động ngay, không cần OTP. API
`POST /api/v1/users` yêu cầu quyền Admin, trả HTTP 201 cùng thông tin tài khoản,
không cấp token hoặc thay đổi phiên của Admin.

## Cấu trúc và stack

~~~text
backend/      Express, Mongoose, JWT, bcryptjs, Nodemailer; CommonJS
mobile/       Expo ~51, Router ~3.5, React Native ~0.74, Paper, Axios, Zustand; ES Modules
~~~

Phiên bản dependency lấy từ package.json/lockfile của từng package. Repository chưa chốt phiên bản Node bằng file cấu hình chung; không tự nâng stack khi thiết lập môi trường.

## Chạy backend

Từ root, dùng PowerShell:

~~~powershell
cd backend
npm ci
Copy-Item -LiteralPath .env.example -Destination .env -NoClobber
npm run dev
~~~

Điền cấu hình vào .env trước khi chạy server. Lệnh copy chỉ dùng khi chưa có file; -NoClobber tránh ghi đè cấu hình đã có.

Biến được source hiện tại sử dụng:

| Biến | Mục đích |
| --- | --- |
| PORT, NODE_ENV | Cổng và chế độ chạy |
| MONGO_URI, DB_NAME | Kết nối MongoDB và tên database |
| JWT_SECRET, JWT_EXPIRES_IN | Ký JWT và thời hạn; đặt secret riêng, không dựa vào fallback trong code |
| EMAIL_USER, EMAIL_PASS | Tài khoản SMTP gửi OTP |

Backend mặc định tại http://localhost:5000; health check GET /health, API prefix /api/v1. Các biến refresh/weather/AI/payment/FCM trong file mẫu chưa đồng nghĩa có implementation.

Script seed vẫn được khai báo nhưng backend/src/scripts/seed.js hiện chưa tồn tại; không dùng nó làm bước khởi động bắt buộc.

## Chạy mobile

Màn **Vườn cây của tôi** tại `/(tabs)/garden` có thể mở từ thanh điều hướng hoặc các nút xem vườn trên Home. Giao diện dùng 4 cây mẫu, hỗ trợ tìm theo tên và lọc trạng thái; chưa kết nối API hoặc lưu dữ liệu. Các nút thêm, menu và thao tác trên cây hiện chưa khả dụng.

Mở terminal khác từ root:

~~~powershell
cd mobile
npm ci
npm start
~~~

Các script hiện có: start, android, ios, web. Chạy iOS simulator cần môi trường macOS phù hợp; client chạy ứng dụng phải tương thích Expo SDK của repository.

API URL được cấu hình bằng EXPO_PUBLIC_API_URL. Có thể tạo mobile/.env.local với:

~~~dotenv
EXPO_PUBLIC_API_URL=http://<IP-máy-chạy-backend>:5000/api/v1
~~~

Khi không đặt biến, source dùng Android emulator 10.0.2.2 và localhost cho nền tảng khác. Điện thoại thật cần URL backend mà thiết bị truy cập được; localhost trên điện thoại không trỏ tới máy phát triển.

## Kiểm tra hiện tại

Hai package chưa có scripts test/lint/format chung. Sau khi cài dependency, có thể chạy bộ test đang có:

Backend, từ backend/:

~~~powershell
npm exec --no -- jest --runInBand
~~~

Mobile, từ mobile/:

~~~powershell
node --test tests/useManagerPlants.test.cjs tests/refactoredHooks.test.cjs tests/otpInput.test.cjs tests/localizedErrors.test.cjs
~~~

Mobile tests đang dùng Babel và shallow renderer; một số dependency cần được khai báo trực tiếp ở bước công cụ thay vì dựa vào dependency bắc cầu. Nếu checkout sạch chưa chạy được, ghi rõ lỗi; không mặc định lệnh trên chứng minh môi trường đã hoàn chỉnh.

Backend tests hiện mock auth service và có test.failing. Mobile helper mô phỏng một phần lifecycle. Các kiểm tra này không thay kiểm thử database/email thật hoặc thiết bị Android/iOS.

Quy trình bổ sung scripts/CI và các trường hợp kiểm tra được nhóm chia sẻ trong bộ tài liệu nội bộ.

## Cập nhật tài liệu

Khi source thay đổi, cập nhật thông tin khởi chạy và hiện trạng trong README. Cập nhật bộ tài liệu nội bộ tương ứng và gửi riêng cho nhóm; không thêm liên kết tới file nội bộ không được phân phối qua Git.
