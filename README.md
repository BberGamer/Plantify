# Plantify

Plantify là ứng dụng hỗ trợ chăm sóc cây trồng, giúp người dùng quản lý vườn cây, nhận diện cây và chẩn đoán bệnh qua ảnh bằng AI. Dự án gồm ứng dụng điện thoại, website quản trị và backend dùng chung.

## Chức năng chính

- Nhận diện cây và gợi ý bệnh từ ảnh chụp hoặc ảnh trong thư viện.
- Tra cứu thông tin cây, bệnh và hướng dẫn chăm sóc.
- Quản lý cây cá nhân, lịch chăm sóc và thông báo nhắc việc.
- Tạo phác đồ, lịch điều trị và theo dõi quá trình điều trị.
- Trò chuyện với AI để tìm hiểu cách chăm sóc cây.
- Quản lý tài khoản, ví và gói VIP.
- Gửi phản hồi về kết quả chẩn đoán.

## Vai trò người dùng

- **Customer:** sử dụng các chức năng chăm sóc cây trên ứng dụng.
- **Manager:** quản lý danh mục cây, bệnh, nhãn AI, phác đồ và phản hồi.
- **Admin:** quản lý tài khoản và các nghiệp vụ tài chính.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Ứng dụng điện thoại | React Native, Expo |
| Website quản trị | React, Vite |
| Backend | Node.js, Express, Mongoose |
| Cơ sở dữ liệu | MongoDB |
| AI nhận diện và chẩn đoán | Python, FastAPI, PyTorch, Ultralytics YOLO |

## Cấu trúc dự án

```text
Plantify/
├── mobile/       Ứng dụng điện thoại
├── web/          Website quản trị
├── backend/      REST API và xử lý nghiệp vụ
└── inference/    Dịch vụ AI xử lý ảnh
```

## Luồng AI

Người dùng chụp/chọn ảnh → ứng dụng gửi ảnh lên backend → dịch vụ Python chạy model → backend đối chiếu danh mục cây/bệnh trong MongoDB → ứng dụng hiển thị kết quả.

Model hiện tại là **YOLO26m classification**, gồm **60 nhãn**, sử dụng ảnh đầu vào **384 × 384**. Kết quả chưa đủ chắc chắn sẽ yêu cầu người dùng chụp lại. Kết quả AI mang tính gợi ý, cần đối chiếu với tình trạng thực tế của cây.

File model nằm trong `inference/model/`. Model, thông tin cấu hình `.env` và dữ liệu upload được lưu riêng, không đưa lên Git.
