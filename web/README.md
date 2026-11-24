# Plantify Management Web

Frontend riêng cho Admin và Manager, dùng chung API/MongoDB với ứng dụng điện thoại.
Giao diện dùng sidebar desktop có thu gọn và menu dạng ngăn kéo trên màn nhỏ.

## Chạy local

Yêu cầu Node.js 22.12 trở lên và npm. Backend chạy riêng ở cổng 5000.

```powershell
cd D:\FPT\ky9\project\Plantify\backend
npm install
npm run dev
```

Mở terminal khác:

```powershell
cd D:\FPT\ky9\project\Plantify\web
npm install
Copy-Item .env.example .env
npm run dev
```

Đặt `VITE_API_URL=http://localhost:5000/api/v1` trong `.env`. Nếu backend trên máy
khác, thay localhost bằng IP/domain backend. Sau khi sửa env, khởi động lại Vite.

- Đăng nhập: http://localhost:5173/web/login
- Admin: http://localhost:5173/web/admin
- Manager: http://localhost:5173/web/manager

Dùng tài khoản có role `admin` hoặc `manager` trong hệ thống. Customer bị chặn.
Phiên web dùng sessionStorage riêng theo tab, không dùng storage của Expo/mobile.
Web khôi phục phiên qua `/auth/me`; API backend vẫn chịu trách nhiệm phân quyền.

## Chức năng

- Admin: tài khoản người dùng, tạo/sửa/khóa/đổi role theo quyền backend; đơn nạp,
  lịch sử giao dịch, lọc theo user, đối soát SePay, cộng số dư có lý do.
- Manager: danh mục cây/bệnh, upload ảnh, chăm sóc cây, cây liên quan và nhãn AI;
  phác đồ thủ công, các giai đoạn, duyệt/ngừng sử dụng, tạo AI từ DOCX;
  feedback với bộ lọc, ảnh bảo vệ bằng token, lịch sử liên kết và lịch sử phản hồi.
- Hồ sơ: xem và cập nhật thông tin tài khoản.

Nhãn AI phải tải thành công trước khi mở form để không xóa liên kết do lỗi mạng.
API tạo phác đồ AI hiện lưu ngay phác đồ mới và thay phác đồ đã duyệt cùng cây/bệnh;
giao diện yêu cầu xác nhận trước thao tác này. Tạo AI cần cấu hình backend tương ứng.
Giao dịch thật cần backend và webhook SePay đang hoạt động như trước.

## Build và triển khai

```powershell
npm run build
npm run preview
```

Output ở `web/dist`. Cấu hình host phục vụ ứng dụng tại `/web/`, fallback tất cả
`/web/*` về file `index.html` của bản build để tải lại trang chi tiết không bị 404.
Prefix API vẫn là `/api/v1`, không thêm `/web` vào URL backend.
Không đưa khóa webhook, MongoDB, Firebase Admin hoặc khóa AI vào env Vite.

Chạy backend thật để nghiệm thu các ràng buộc nghiệp vụ, upload, AI và thanh toán
với tài khoản của nhóm.
