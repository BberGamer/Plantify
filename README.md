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

Người dùng chụp/chọn ảnh → backend gửi ảnh đến dịch vụ Python → MobileCLIP2-S0 kiểm tra cây hoặc lá có phải chủ thể của ảnh → YOLO phân loại ảnh được chấp nhận → backend đối chiếu danh mục trong MongoDB.

Model hiện tại là **YOLO26m classification**, gồm **60 nhãn**, sử dụng ảnh đầu vào **384 × 384**. Kết quả chưa đủ chắc chắn sẽ yêu cầu người dùng chụp lại. Kết quả AI mang tính gợi ý, cần đối chiếu với tình trạng thực tế của cây.

YOLO dùng bundle trong `inference/model/`. MobileCLIP dùng `open_clip_model.safetensors` và `open_clip_config.json` trong `inference/input_guard_model/`, hoặc thư mục chỉ định bằng `PLANTIFY_GUARD_MODEL_DIR`. Hai tệp được kiểm SHA-256 khi khởi động. Model, cấu hình `.env` và dữ liệu upload được lưu riêng.

### Chạy dịch vụ AI

Cài dependency trong môi trường Python của dự án. Nếu máy chưa có bundle MobileCLIP, tải đúng phiên bản dưới đây một lần. Dịch vụ xử lý ảnh bằng các model cục bộ.

```powershell
.\inference\.venv\Scripts\python.exe -m pip install -r inference/requirements.txt
.\inference\.venv\Scripts\python.exe -c "from huggingface_hub import snapshot_download; snapshot_download('timm/MobileCLIP2-S0-OpenCLIP', revision='095906d28bf54d7584dc411e8ffe448f34289e05', allow_patterns=['open_clip_model.safetensors','open_clip_config.json'], local_dir='inference/input_guard_model')"
.\inference\.venv\Scripts\python.exe -m inference
```

`GET /health` trên cổng 8001 trả phiên bản và ngưỡng của bộ lọc. `POST /predict` trả `input_check` cùng dự đoán nếu ảnh được chấp nhận. Khi ảnh bị từ chối hoặc cần chụp lại, phản hồi có `prediction: null` và danh sách kết quả rỗng. Backend cần phiên bản Python có `input_check` để cả hai chế độ quét luôn qua bước kiểm tra ảnh.

### Kết quả đánh giá bộ lọc

Bộ ảnh đánh giá gồm 231 ảnh từ thư mục `test/` của [PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset/tree/5467f6012d78d1c446145d5f582da6096f852ae8/test) và 128 ảnh [COCO128](https://docs.ultralytics.com/datasets/detect/coco128/). Năm tên tệp PlantDoc chứa ký tự Windows không hỗ trợ được bỏ qua. Chia riêng ba nhóm ảnh cây trong danh mục, ảnh không có cây làm chủ thể và ảnh cây ngoài danh mục. Sắp mỗi nhóm theo SHA-256 nội dung ảnh và giữ mẫu ở các vị trí 1, 4, 7… để kiểm thử sau khi chọn ngưỡng trên phần còn lại.

| Nhóm kiểm thử giữ riêng | Kết quả |
| --- | --- |
| 43 ảnh không có cây làm chủ thể | 11 ảnh bị từ chối, 32 ảnh được yêu cầu chụp lại. Cả 43 ảnh dừng trước YOLO. Nếu chỉ dùng YOLO và ngưỡng phân loại mẫu, 22 ảnh đủ điều kiện trả gợi ý sai. |
| 69 ảnh cây thuộc danh mục | 66 ảnh qua bước kiểm tra đầu vào. 2 ảnh chưa rõ chủ thể theo MobileCLIP, 1 ảnh dưới ngưỡng kích thước. |
| 9 ảnh cây thật ngoài danh mục | 9 ảnh qua MobileCLIP. Với ngưỡng phân loại mẫu, 4 ảnh được YOLO gán vào một loài trong danh mục. |

Trên 75 ảnh qua bộ lọc, kiểm thử API FastAPI cho kết quả giống pipeline YOLO gốc ở toàn bộ vector 60 điểm và thứ tự top 5.

Với ngưỡng mẫu `0.70` cho điểm và `0.15` cho chênh lệch, nhận diện loài trả đúng 41, sai 12 và không đưa ra kết quả cho 16 trong 69 ảnh có loài thuộc danh mục. Trên 64 ảnh có nhãn bệnh hoặc khỏe tương ứng rõ ràng với danh mục, chẩn đoán trả đúng 33, sai 16 và không đưa ra kết quả cho 15. Kết quả phản ánh các tập ảnh công khai nêu trên. Hiệu quả thực tế còn phụ thuộc ảnh chụp tại vườn, loài và bối cảnh.
