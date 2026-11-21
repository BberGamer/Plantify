# Plantify

Ứng dụng chăm sóc cây gồm mobile React Native/Expo và REST API Node.js/Express, lưu dữ liệu bằng MongoDB. Có ba vai trò `customer`, `manager`, `admin`; khu vực quản trị nằm trong ứng dụng mobile, chưa có web CMS riêng.

README được đối chiếu với source ngày **31/10/2026**. Trạng thái dưới đây mô tả phần đã triển khai trong mã nguồn, không đồng nghĩa đã kiểm thử tích hợp hoặc sẵn sàng production.

### AI diagnosis (2026-11-17)

Đã bỏ màn hình/API Admin cấu hình AI. Backend đọc metadata đúng checkpoint và
mapping ObjectId theo run/hash/class trong collection `diagnosis_mappings`.
Không còn cơ chế policy hoặc truy vấn collection `diagnosis_models`.

Ngưỡng lấy từ `backend/.env`: `DIAGNOSIS_MIN_CONFIDENCE`, `DIAGNOSIS_MIN_MARGIN`,
`DIAGNOSIS_UNRECOGNIZED_BELOW`. Thiếu, rỗng hoặc sai phạm vi thì trả 503;
không dùng ngưỡng fallback. URL và timeout dùng `DIAGNOSIS_INFERENCE_URL`, `DIAGNOSIS_TIMEOUT_MS`.
Mobile chỉ hiển thị quyết định backend, không tính lại confidence/margin.

Hai tính năng dùng chung model và camera nhưng có quyết định riêng:

- Homepage **Nhận diện cây** mở `/customer/identification`, gọi API `/identification`.
  Python trả đủ `class_scores` theo thứ tự checkpoint; backend gom toàn bộ điểm theo
  `plant_id` từ mapping DB rồi so cây đứng đầu với cây thứ hai. Response có
  `result_kind=plant`, tên cây từ DB; không kết luận bệnh/healthy, không tạo lịch sử bệnh.
- **Chẩn đoán bệnh** mở `/customer/diagnosis`, gọi API `/diagnosis`; vẫn xét từng nhãn
  cây–bệnh, giữ điều kiện lưu lịch sử và tạo phác đồ hiện có.
- Nút **Camera** ở navbar mở hộp chọn hai tính năng. Màn camera cũng có nút chuyển
  chế độ; chuyển chế độ bắt đầu lượt chụp mới và bị khóa trong lúc đang xử lý.

Ngưỡng nhận diện cây bắt buộc đặt riêng trong `backend/.env`:
`IDENTIFICATION_MIN_CONFIDENCE`, `IDENTIFICATION_MIN_MARGIN`, `IDENTIFICATION_UNRECOGNIZED_BELOW`.
Không lấy ngưỡng chẩn đoán bệnh để thay thế khi thiếu. Giá trị mẫu cũng chỉ là ngưỡng
ban đầu, cần đánh giá riêng; tổng điểm theo cây chưa phải xác suất nhận diện đúng.
Mapping pending bệnh vẫn dùng được cho nhận diện cây nếu `plant_id` đã xác định;
thiếu mapping cây hoặc metadata sai phải báo lỗi dữ liệu, không tự đoán tên từ nhãn.
Sau cập nhật phải khởi động lại Python để có đủ điểm class, và backend để nạp ngưỡng mới.

Customer xem **Lịch sử chẩn đoán** từ Tài khoản hoặc biểu tượng lịch sử ở màn
Chẩn đoán bệnh. API `GET /api/diagnosis/history?page=1&limit=20` yêu cầu đăng nhập
và tài khoản customer còn hoạt động, không yêu cầu VIP còn hạn. Backend luôn lọc
theo user trong JWT, sắp xếp mới nhất trước, phân trang tối đa 100 bản ghi/lần.
Danh sách dùng dữ liệu `disease_diagnoses` hiện có; tên cây/bệnh lấy từ DB.
Giữ bản ghi nếu danh mục bị xóa/ẩn và hiển thị thông tin không còn khả dụng.
Card bấm mở chi tiết, ảnh của lần chẩn đoán nằm bên phải card và xem lớn trong chi tiết.
Chẩn đoán bệnh accepted mới lưu một bản ảnh JPEG đã bỏ EXIF, tối đa 1600×1600;
bytes dùng inference không thay đổi. `DIAGNOSIS_PHOTO_STORAGE=cloudinary` lưu asset
ở chế độ authenticated, upload ký SHA-256 bằng credential backend. DB chỉ lưu
`image.storage`, `image.public_id`, `image.asset_id`; không lưu khóa bí mật hoặc URL ký số.
Nếu ghi DB thất bại thì xóa đúng asset vừa upload. Cloudinary lỗi không tự chuyển sang local.
Chế độ `local` lưu trong `backend/uploads/diagnoses`, DB lưu `image.filename`.
Không đặt provider giữ local để tương thích cấu hình cũ; giá trị provider sai trả lỗi cấu hình.
Ảnh đã lưu được đọc theo provider trong bản ghi, nên đổi sang cloud không làm mất ảnh local cũ.
`GET /api/diagnosis/history/:id` trả chi tiết; `GET /api/diagnosis/history/:id/image`
trả ảnh sau khi kiểm tra chủ tài khoản, không có URL ảnh công khai và không cần PUBLIC_BASE_URL.
Native gửi Authorization trong nguồn ảnh; web tải blob qua Axios chung và giải phóng object URL.
Bản ghi cũ không có ảnh hiện “Không có ảnh lưu”; ảnh mất/hỏng hiện không còn khả dụng,
không lấy ảnh danh mục làm ảnh của lần chẩn đoán. Không tự cập nhật dữ liệu cũ.
Ảnh cloud được backend tải bằng request ký số sau khi kiểm tra chủ tài khoản, rồi trả
JPEG qua cùng API ảnh; frontend không nhận URL có chữ ký hoặc credential Cloudinary.
Khi dùng local cần giữ thư mục uploads trên ổ lưu trữ bền vững. Healthy, nhận diện cây
và lần bị từ chối vẫn không tạo lịch sử bệnh hoặc ảnh lưu.
Màn hình hỗ trợ trạng thái tải/rỗng/lỗi, thử lại, kéo để tải lại và chuyển trang;
tận dụng `usePaginatedList` để loại phản hồi cũ khi đổi trang, rời màn hoặc đổi phiên.

Cấu hình Cloudinary trong `backend/.env` (không commit):

```dotenv
DIAGNOSIS_PHOTO_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

Khởi động lại backend sau khi đổi cấu hình. Không đưa API Secret vào mobile.
Tích hợp dùng [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
và asset authenticated của Cloudinary, không thêm SDK/dependency. Đã thử upload,
đọc và xóa một ảnh mẫu thật; không tạo bản ghi DB thử hoặc chuyển ảnh cũ lên cloud.

Các ngưỡng trong `.env.example` chỉ là giá trị ban đầu, cần hiệu chỉnh bằng dữ liệu
đánh giá. `DIAGNOSIS_REQUIRE_INPUT_GUARD=true` bắt buộc bộ lọc đầu vào;
`false` hoặc chưa đặt thì không bật. Khi bật, phải đặt thêm
`DIAGNOSIS_GUARD_MIN_SIMILARITY` và `DIAGNOSIS_GUARD_MIN_MARGIN` trong `backend/.env`,
không có fallback. `.env.example` dùng lần lượt `0.23` và `0.025` làm điểm bắt đầu,
không phải ngưỡng đã được hiệu chỉnh. Giá trị sai hoặc thiếu trả lỗi cấu hình.

Danh mục và mapping được lưu trong DB. Runtime không dùng danh sách seed hoặc
đoán lại tên/alias để lấp mapping thiếu.

Ngày 17/11/2026 đã dùng lại 29 cây, thêm 45 bệnh unverified, 78 mapping (74 ready,
4 pending), 48 liên kết cây–bệnh. Chạy lại apply không tạo thêm bản ghi/liên kết.
Không tạo bệnh healthy, không tạo/phê duyệt phác đồ hoặc bịa triệu chứng/nguyên nhân.
Định danh mapping ready độc lập với việc nội dung điều trị đã được xác minh.

Thiếu/pending/sai mapping, bệnh inactive hoặc mất liên kết trả lỗi dữ liệu riêng;
không gom thành `uncertain`. Không đạt ngưỡng/chất lượng ảnh mới trả `uncertain`.
Các trường hợp bị từ chối không có evidence ID và không mở điều trị. Nhãn khỏe chỉ được chấp nhận khi
đúng nhãn model, vượt ngưỡng và có mapping cây hợp lệ; không tạo disease_id.
Màn kết quả chỉ hiện tên bệnh hoặc trạng thái chưa phát hiện bệnh; không hiển thị
điểm mô hình, triệu chứng hay nội dung chăm sóc. Chỉ mở điều trị khi có phác đồ
approved đầy đủ, qua kiểm tra schema ở cả danh sách và lúc tạo lịch.
Kết quả chưa xác định/ảnh không phù hợp hiển thị lý do ngay dưới tiêu đề trong khung
kết quả hiện có, kèm nút **Chụp lại**; không chuyển sang màn từ chối riêng.

Bộ lọc đầu vào dùng [MobileCLIP2-S0](https://huggingface.co/timm/MobileCLIP2-S0-OpenCLIP)
chạy cục bộ qua OpenCLIP. Revision, hash weights/config và mô tả ảnh nằm riêng trong
`inference/input_guard.json`; đây là cấu hình so khớp ảnh, không phải danh mục cây/bệnh.
Ảnh được so với nhóm mô tả lá cây thật, quả đang trên cây và nhóm ngoài phạm vi. Guard trả `passed`,
`unsupported` hoặc `uncertain`; hai trạng thái sau dừng trước model bệnh và không tạo lịch sử.
Chỉ `unsupported` đổi thành `unsupported_image`; phân vân giữ `uncertain`.
Nếu guard bắt buộc nhưng model thiếu, hỏng hoặc dịch vụ không chạy, backend không bỏ qua.
Khi không bật, response ghi rõ `input_check.status=disabled`.
Lỗi cấu hình, mapping thiếu/pending, danh mục không hợp lệ và lỗi lưu lịch sử có
mã lỗi riêng. Lịch sử giữ status identified và metadata model, không ghi policy.
Identification và kết quả healthy không tạo evidence như trước. Không sửa/xóa dữ liệu DB cũ.
Confidence/margin không bảo đảm từ chối mọi ảnh ngoài phạm vi; điểm mô hình không
phải xác suất nhận diện đúng. Metadata class giữ đúng thứ tự checkpoint.

Thiết lập guard từ thư mục gốc (weights khoảng 300 MB, không commit):

```powershell
# Trên Windows không có C++ Build Tools, dùng PyYAML thuần Python.
$env:PYYAML_FORCE_LIBYAML="0"
inference/.venv/Scripts/python.exe -m pip install -r inference/requirements.txt
inference/.venv/Scripts/python.exe -c "from huggingface_hub import snapshot_download; snapshot_download('timm/MobileCLIP2-S0-OpenCLIP', revision='095906d28bf54d7584dc411e8ffe448f34289e05', allow_patterns=['open_clip_model.safetensors','open_clip_config.json','README.md'], local_dir='inference/input_guard_model')"
```

Model/tokenizer dùng cách nạp [OpenCLIP chính thức của Apple](https://github.com/apple/ml-mobileclip#openclip-support).
Giữ model card và license `apple-amlr` của checkpoint. Runtime chỉ đọc file cục bộ,
kiểm SHA-256 rồi nạp model một lần; không tải model hoặc gọi API ngoài khi nhận ảnh.
Có thể đặt `PLANTIFY_GUARD_MODEL_DIR`, `PLANTIFY_GUARD_CONFIG` cho Python nếu đổi đường dẫn.
Khởi động lại Python inference và backend sau khi thiết lập.

Kiểm thử hồi quy (mock, không thay đánh giá model):

```powershell
node --test backend/src/integrations/ai/input-guard.test.cjs
node --test backend/src/integrations/cloudinary-photo.test.cjs
node --test backend/src/services/__tests__/identification.test.cjs
node --test backend/src/services/__tests__/diagnosis-history.test.cjs
node --test mobile/src/services/__tests__/recognition.test.cjs
# Dependency riêng cho FastAPI TestClient, không cần để phục vụ inference.
inference/.venv/Scripts/python.exe -m pip install httpx==0.28.1
inference/.venv/Scripts/python.exe -m unittest inference.test_input_guard -v
```

Smoke test ngày 17/11/2026 với model thật: lá khỏe/lá bệnh được guard cho qua;
anime bị từ chối; xe/người/đồ ăn trả uncertain và không chạy model bệnh; ảnh hỏng
trả INVALID_IMAGE. Đã kiểm tra mapping DB chỉ đọc, không tạo lịch sử. Bộ mẫu nhỏ này
không chứng minh độ chính xác: ảnh lá cà chua mẫu vẫn bị classifier bệnh đoán thành
khoai tây. Guard không xác minh loài/bệnh, không bảo đảm phát hiện mọi ảnh ngoài phạm vi.
Cần tập đánh giá riêng gồm ảnh thực địa, ảnh không liên quan và các trường hợp khó
để đo tỷ lệ ảnh sai lọt qua/ảnh hợp lệ bị chặn và hiệu chỉnh cả prompt lẫn ngưỡng.

Chat lưu câu hỏi–trả lời theo tài khoản/hội thoại trong `chat_turns`, tải lại lịch sử
gần nhất và hiển thị thời gian phản hồi. Đã bỏ tự chấm và bảng CCC khỏi màn chat;
API chấm CCC đã được gỡ; chat không đọc file kiến thức hoặc rubric từ backend/data.
Bộ [30 test case, đo thời gian và xuất CSV](backend/CHAT_TEST_REPORT.md)
hỗ trợ báo cáo thủ công trước/sau.

Chat sử dụng RAG + LLM: truy xuất kiến thức cây, bệnh và phác đồ từ MongoDB,
đưa trích đoạn vào prompt cho model trả lời. Xem phần Chat RAG bên dưới.

### Tài khoản VIP và Tài chính

Trong Profile, Customer có ba mục riêng: **Tài khoản VIP** để xem quyền lợi và mua
gói, **Ví tiền** để xem số dư và tạo đơn nạp, **Lịch sử giao dịch** để xem biến động
số dư, lọc giao dịch và tra cứu chi tiết đơn nạp. Lịch sử không hiển thị trong màn
VIP hoặc Ví tiền. Các gói gồm VIP1 (50.000 VND/30 ngày), VIP3 (120.000 VND/90 ngày),
VIP12 (499.000 VND/365 ngày).
Giá và thời hạn hiện cố định trong `backend/src/utils/vip.js`.
Ngày kích hoạt là ngày thứ nhất, hết hạn ở 00:00 ngày kế tiếp ngày cuối theo UTC+7.
Mua thêm nối tiếp kỳ VIP còn hạn; không tự gia hạn hoặc tự trừ ví khi hết hạn.
Free giới hạn 3 cây đang hoạt động trong vườn, 5 cây yêu thích, không được gọi AI
nhận diện/chẩn đoán. VIP mở các giới hạn này. Hết VIP giữ dữ liệu, áp dụng lại Free.
Profile VIP có nền xanh đậm, viền avatar vàng, tên gói và ngày hết hạn lấy từ API.

Nạp ví từ 10.000 đến 10.000.000 VND/lần; đơn pending có hạn chuyển khoản 15 phút.
Admin có tab **Tài chính** để lọc đơn/giao dịch, duyệt hoặc từ chối đơn pending,
và cộng ví thủ công cho Customer với lý do bắt buộc. Giao dịch lưu trong
`wallet_transactions`, đơn trong `topup_orders`, giao dịch ngân hàng trong `payment_events`.
Một đơn chỉ được cộng một lần kể cả Admin duyệt và webhook đến đồng thời.
Đơn success/rejected không có API sửa hoặc xóa. Các lần điều chỉnh là giao dịch mới.

API có prefix `/api/v1/commerce` (cũng hỗ trợ `/api/commerce`):
`GET /me`, `GET/POST /orders`, `GET /orders/:id`, `GET /transactions`,
`POST /vip/purchase`; Admin: `GET /admin/orders`, `GET /admin/transactions`,
`GET /admin/events`, `PATCH /admin/orders/:id`, `POST /admin/adjustments`.
Các thao tác POST dùng `request_key` để retry không cộng/trừ tiền lặp.

Webhook: `POST /api/v1/commerce/payment/webhook/sepay`, JSON và HMAC-SHA256 trên
`timestamp.raw_body`, header `X-SePay-Timestamp`/`X-SePay-Signature`, timestamp lệch
không quá 5 phút. Backend cần `SEPAY_WEBHOOK_SECRET`, `SEPAY_BANK_CODE`,
`SEPAY_ACCOUNT_NUMBER`, `SEPAY_ACCOUNT_NAME`. Mã ngân hàng phải khớp giá trị `gateway`
SePay gửi và được QR SePay hỗ trợ. Mã chuyển khoản là `PLANTIFY` + 16 ký tự hex.
Bank details được chụp lại khi tạo đơn; sau khi cấu hình cần tạo đơn mới.
Nếu dùng VA chính thức, giữ `SEPAY_ACCOUNT_NUMBER` là số tài khoản chính và thêm
`SEPAY_VIRTUAL_ACCOUNT` là số VA nhận tiền. QR và trường `receiving_account` trả
cho app dùng số VA; webhook phải đồng thời khớp `accountNumber` với tài khoản
chính và `subAccount` với VA đã lưu trong đơn. Không dùng biến này cho mã TKP
nội dung. Đơn cũ không tự đổi tài khoản nhận khi cập nhật `.env`.
Không có cấu hình ngân hàng vẫn tạo được đơn để Admin duyệt, nhưng không có QR.
Không có secret thì webhook từ chối xử lý. Không có khóa SePay nào đưa vào mobile.

Nút Gửi thử của SePay gửi payload mẫu có `id: 0`: sau khi xác minh HMAC và định
dạng, API trả `success: true`, `data.test: true`, `data.credited: false` và
`data.status: test_received`. Bản thử không ghi MongoDB hoặc cộng ví, kể cả nội
dung trùng mã đơn thật. Giao dịch thật cần ID số nguyên dương và phải khớp đầy đủ
đơn nạp; các trường hợp cần đối soát có lý do riêng để Admin kiểm tra.

Khi test local, dùng URL HTTPS ngrok trỏ tới backend port 5000 để SePay truy cập.
Chọn sự kiện tiền vào, HMAC-SHA256, JSON và bật retry khi HTTP ngoài 2xx.
Tiền sai, chuyển muộn, không có mã đơn hoặc đơn rejected được lưu để đối soát;
không tự cấp VIP/hoàn tiền. Admin đối chiếu và tạo điều chỉnh có lý do nếu cần.
Chưa có tự động gọi API SePay để bù webhook thất lạc; dùng gửi lại từ dashboard.

MongoDB phải hỗ trợ transaction (Atlas hoặc replica set). Giao dịch tiền dùng
transaction, cập nhật số dư có điều kiện, unique index và idempotency. Đảm bảo backend có quyền tạo
index; không tự sửa balance/isproaccount từ MongoDB Compass. User cũ thiếu các field
được hiểu là số dư 0 và Free; các field được lưu khi phát sinh giao dịch.
Không dùng bộ đếm revision trên user. Ví dùng `$inc` có điều kiện số dư/giới hạn số
nguyên an toàn; cộng đơn nạp chỉ sau khi nhận được trạng thái pending. Unique index
trên giao dịch của đơn là lớp chống cộng trùng bổ sung. Request tài chính chỉ nhận
các trường được phép, từ chối giá/số dư/trạng thái do client tự chèn vào sai endpoint.
Vườn Free sử dụng slot 0–2 (chỉ cây chưa lưu trữ), yêu thích Free dùng slot 0–4.
Bản ghi cũ hoặc được tạo khi VIP không có slot vẫn chiếm hạn mức khi về Free.
Slot được giữ bởi unique index, có retry khi hai request cùng chọn một slot;
không sửa dữ liệu cũ để đánh lại số slot hoặc xóa cây khi hết VIP.
Khởi động backend sẽ đồng bộ cờ VIP hết hạn mỗi phút; API luôn kiểm tra ngày hết hạn.

SePay/ngrok thực tế phải cấu hình và kiểm thử riêng trước khi nhận tiền thật.

### Cây yêu thích của customer

Trong danh mục hoặc chi tiết cây, customer bấm trái tim để lưu/bỏ yêu thích. Tại **Tài khoản → Cây yêu thích của tôi**, có tổng số cây, chỉnh sửa danh sách, xem chi tiết, thêm vào vườn qua form hiện có và khám phá thêm cây. Dữ liệu lưu theo tài khoản trong `favorite_plants`; cây bị ẩn/xóa không hiển thị trong danh sách.

Theo BR-25 trong Report 3, tài khoản Free lưu tối đa 5 cây; VIP còn hạn không giới hạn.
Backend kiểm tra gói từ database, dùng slot với unique index trong transaction để chống vượt hạn mức
khi thêm đồng thời; dữ liệu cũ vẫn được tính vào hạn mức. Backend cần quyền tạo index MongoDB.

API customer đang hoạt động: `GET /api/favorites/plants` (page/limit), `GET /api/favorites/plants/status?ids=...`, `PUT /api/favorites/plants/:plantId`, `DELETE /api/favorites/plants/:plantId`. PUT/DELETE có thể gọi lại an toàn; vượt hạn mức trả 409 với code `FAVORITE_LIMIT_REACHED`.

Kiểm tra: tại `backend/`, chạy `node --test src/services/__tests__/favorite.test.cjs`; tại `mobile/`, chạy `node --test src/hooks/favoriteDetail.test.cjs`. Test dùng mock, cần kiểm thử bổ sung với MongoDB và thiết bị thật.

### Thêm cây vào vườn

Customer có thể chọn **Thêm cây** trong My Garden hoặc **Thêm vào vườn cây** từ chi tiết cây thư viện. Form lưu biệt danh, loài, vị trí, chậu và ngày nhận cây; ảnh JPG/PNG tối đa 10 MB là tùy chọn. Ngày nhận cây chọn bằng lịch, hiển thị DD/MM/YYYY, có thể để trống/xóa và không được sau hôm nay (theo múi giờ Việt Nam). Cây nhập tay không cần danh mục; cây thư viện giữ danh mục có sẵn. Chưa tạo lịch chăm sóc trong luồng này.

Backend cần biến môi trường `PUBLIC_BASE_URL` là địa chỉ gốc công khai, ví dụ `http://192.168.1.10:5000` (không thêm `/api`). Mobile dùng `EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api`. Khi dùng thiết bị thật, thay IP bằng địa chỉ máy chạy backend mà điện thoại truy cập được. Thiếu `PUBLIC_BASE_URL` vẫn lưu cây không ảnh, nhưng upload trả lỗi 503.

File ảnh nằm trong `backend/uploads/plants`, được phục vụ tại `/uploads/plants/...`; MongoDB chỉ lưu URL. Cần volume bền vững và sao lưu thư mục này khi triển khai. URL ảnh công khai; backend tự đặt tên ngẫu nhiên và loại metadata ảnh. `POST /api/garden/plants` hỗ trợ JSON như trước và multipart với một trường file `photo`.

Kiểm tra chức năng: chạy `node --test tests/garden-create.test.cjs` trong `backend/` và `node --test tests/addGardenPlant.test.cjs` trong `mobile/`. Test backend mock truy vấn database; không thay thế kiểm thử MongoDB và thiết bị thật.

## Chẩn đoán ảnh thật (cập nhật 10/11/2026)

Luồng đã nối: **chụp/chọn ảnh → mobile → `POST /api/diagnosis` → Python YOLO → kết quả**.
Backend xác thực customer đang hoạt động và VIP còn hạn trước khi nhận ảnh. Ảnh JPEG/PNG/WebP tĩnh,
tối đa 10 MiB và 25 megapixel, được chuyển nguyên bytes/EXIF sang Python; không lưu
ảnh. Chỉ kết quả accepted có mapping bệnh hợp lệ được lưu làm bằng chứng chẩn đoán. Model nạp một lần từ
`inference/model/weights/best_macro_f1.pt`, đúng 78 class và pad 384×384 của notebook.
Bộ model hiện tại là run `PlantWild78_YOLO26m_20261111T094602654958Z_2b02c35f`,
train 95 epoch; checkpoint được chọn theo validation Macro F1 tại epoch 63.
Mapping gồm 78 class (ID 0–77), đã đồng bộ với taxonomy tiếng Việt của backend.

App hiển thị kết quả thật bằng tiếng Việt, trạng thái phân tích và lỗi/thử lại. Kết quả
yếu hoặc phân vân **không được trình bày như kết luận bệnh**; ảnh quá nhỏ, gần như
trống hoặc quá tối/sáng yêu cầu chụp lại. Chỉ khi kết quả vượt ngưỡng mới hiển thị
gợi ý nhận diện. Ngưỡng lấy bắt buộc từ `backend/.env`, không có fallback
trong source. Thiếu cấu hình hợp lệ thì chưa cho chẩn đoán.
Điểm mô hình không phải độ chính xác hay xác suất đã hiệu chỉnh. Classifier chỉ có
78 class, vẫn có thể tự tin với ảnh không phải cây; đây không phải bộ phát hiện OOD.

Tên cây/bệnh, triệu chứng/chăm sóc lấy từ danh mục database qua mapping ObjectId
đúng phiên bản model; bệnh phải còn active và liên kết với cây qua
`common_disease_ids`. Không có mapping hợp lệ thì trả lỗi dữ liệu riêng, không hiển thị
bệnh từ tên nhãn kỹ thuật của model. Không tự áp
dụng lịch điều trị từ ảnh; luồng chọn cây/phác đồ và xác nhận điều trị vẫn riêng biệt.

### Phác đồ điều trị từ kết quả AI

Kết quả AI đủ chắc chắn và khớp duy nhất với cây/bệnh trong danh mục được lưu làm
bằng chứng chẩn đoán. Customer có thể chọn một cây cùng loài trong vườn, xem các
phác đồ đang hoạt động cho đúng cặp cây–bệnh, tạo lịch xem trước rồi xác nhận áp dụng.

Manager quản lý phác đồ tại tab **Điều trị**. Mỗi công việc có ngày và giờ Việt Nam
để tạo thông báo đúng thời điểm. Khi sửa phác đồ đã duyệt, backend tạo phiên bản mới
và ngừng phiên bản cũ; lịch đã tạo giữ snapshot nên không bị thay đổi ngược.

Manager chọn bệnh/cây và có thể tải một file DOCX tối đa 10 MB qua multipart field
`document` tới `POST /api/treatments/manager/ai-draft`; `plant_ids` là mảng JSON.
Backend dùng Mammoth trích xuất văn bản, chia đoạn và xếp hạng các đoạn liên quan
trước khi gọi chung Chat Completions API hiện có. AI ưu tiên tài liệu và có thể bổ
sung kiến thức chăm sóc phổ biến khi tài liệu thiếu. Kết quả hợp lệ được lưu ở trạng
thái `approved` và dùng ngay, không có bước Manager duyệt cuối. Nếu không có DOCX,
AI vẫn tạo từ dữ liệu danh mục và kiến thức model; phác đồ sẽ hiển thị cảnh báo chưa
được kiểm chứng và chỉ mang tính tham khảo. File gốc không được lưu; DB chỉ giữ tên
file và số ký tự đã trích xuất.

Bộ 29 file DOCX tham khảo cho 54 nhóm cây/bệnh của model nằm tại
`backend/data/treatment-templates`. Mỗi file ghi nguồn Extension/IPM/APS tương ứng,
lịch mẫu an toàn và cảnh báo không thay thế chẩn đoán hoặc nhãn thuốc địa phương.
Chạy `node backend/scripts/generate-treatment-templates.js` từ root để tái tạo sau
khi cập nhật nguồn/nội dung trong script; không sửa file nhị phân bằng tay.

Khi Customer mở màn hình xem trước sau chẩn đoán, backend luôn đọc DOCX theo tên cây và
gọi AI để tạo một phác đồ mới; không truy vấn lại phác đồ cũ và chưa ghi phác đồ mới vào
MongoDB. Nội dung xem trước được đặt trong token ký xác thực, gắn với đúng tài khoản,
cây, bệnh và kết quả chẩn đoán trong 30 phút. Chỉ khi người dùng đã thêm/chọn cây trong
vườn và bấm tạo lịch, backend mới lưu phác đồ cùng lịch điều trị trong một transaction.
Nếu không có DOCX tương ứng, AI vẫn sinh từ dữ liệu danh mục và gắn cảnh báo chưa được
kiểm chứng. Luồng này không cần Manager tải file hoặc duyệt lại.

Mỗi cây chỉ có một lịch `in_progress`. Khi bắt đầu, backend tạm dừng lịch chăm sóc
thường, đánh dấu cây đang điều trị và tạo nhắc việc theo đúng ngày/giờ. Khi kết thúc,
lịch chăm sóc từng bị hệ thống tạm dừng được khôi phục; các lịch vốn đã tạm dừng thủ
công vẫn giữ nguyên. API customer nằm dưới `/api/treatments`; API Manager nằm dưới
`/api/treatments/manager`.

Kiểm tra logic không cần database:

```powershell
node --test backend/src/services/__tests__/treatment-generation.test.cjs mobile/src/utils/__tests__/treatmentLogic.test.cjs
```

Kiểm tra integration đầy đủ cần `backend/.env` trỏ tới MongoDB hỗ trợ transaction.
Test tạo dữ liệu có hậu tố ngẫu nhiên và tự xóa đúng các bản ghi test sau khi chạy:

```powershell
cd backend
node --test src/services/__tests__/treatment-api.integration.test.cjs
```

Cần chạy cả Python, Express và Expo. Tại root repo, mở terminal Python:

```powershell
inference/.venv/Scripts/python.exe -m inference
```

Terminal khác chạy backend như thường lệ (`cd backend; npm run dev`), rồi mobile
(`cd mobile; npm start`). Backend mặc định gọi `http://127.0.0.1:8001`; khi tách máy/
container, đặt `DIAGNOSIS_INFERENCE_URL`. Mobile vẫn chỉ dùng `EXPO_PUBLIC_API_URL`
trỏ vào Express, không gọi thẳng Python. Cấu hình và giới hạn kiểm thử được ghi
trong phần luồng chẩn đoán của README này.

## Tiến độ hiện tại

### Chat RAG + LLM (19/11/2026)

Đã gỡ cơ chế/API/màn quản lý FAQ; không đọc `chat_faqs`, không dùng `AI_FAQ_ENABLED`.
Giữ lịch sử `chat_turns` cũ; enum `faq` chỉ để tương thích lịch sử.
Manager có tab **Chat** xem/tìm/phân trang chat người dùng qua
`GET /api/chat/manager/turns`, kiểm tra vai trò và trạng thái từ DB.
Kiến thức tiếp tục được quản lý ở các tab Cây trồng, Bệnh cây, Điều trị.

Luồng chat: xác thực → đọc danh mục hiện tại → chia đoạn → xếp hạng BM25 → đưa
tối đa 6 đoạn/12.000 ký tự vào prompt → gọi LLM hiện có. Đây là RAG từ khóa,
chuẩn hóa tiếng Việt không dấu; chưa có embedding/vector search hoặc reranker ngữ nghĩa.
Không thêm dependency, dịch vụ vector hoặc migration. Tên cây/tên khoa học/alias giới hạn
nguồn theo cây; câu nối tiếp ngắn có thể kế thừa chủ thể từ câu hỏi người dùng gần nhất.
Lịch sử AI không phải nguồn kiến thức đã xác minh.

Nguồn: `plants.is_published=true`; `plant_diseases.status=active` và
`content_status=verified`; phác đồ `approved`, không phải `ai_unverified`, qua validation
schema, thuộc bệnh đang active và còn liên kết với cây xuất bản. Việc duyệt phác đồ
độc lập với `content_status` của nội dung mô tả bệnh; mô tả bệnh chưa xác minh vẫn không
được đưa vào RAG. Câu hỏi về phác đồ/điều trị ưu tiên các đoạn phác đồ phù hợp. Không dùng trường
`disease.treatment_protocol` legacy làm nguồn thuốc/liều lượng. Không đọc dữ liệu cá nhân
của vườn/tài khoản/ví cho RAG. Đọc lại danh mục mỗi lượt để phản ánh thay đổi/gỡ duyệt.
Giới hạn 2.000 bản ghi mỗi loại và 20.000 đoạn; vượt giới hạn hoặc DB lỗi trả
`CHAT_RETRIEVAL_UNAVAILABLE` (503), không âm thầm gọi model khi truy xuất bị lỗi.

Câu hỏi liệt kê cây có phác đồ dùng tổng hợp toàn bộ danh mục hợp lệ, nhóm theo ID cây/bệnh,
không dùng top 6 đoạn và không lặp cây theo từng giai đoạn. Backend dựng danh sách trực tiếp
để LLM không bỏ sót tên do giới hạn đầu ra; lịch sử ghi retrieval `method=catalog`, không gọi model.
Câu hỏi chi tiết vẫn dùng BM25 + LLM. Danh sách chỉ bao gồm phác đồ đã duyệt hợp lệ;
bản nháp/ngừng dùng, cây ẩn, bệnh inactive và quan hệ sai vẫn bị loại.

Không có nguồn phù hợp: model phải nói thiếu dữ liệu Plantify, có thể giải thích chăm sóc
chung nhưng không tự tạo thuốc/liều lượng/phác đồ. Nguồn bệnh không phải chẩn đoán cho
người dùng. Chat không tạo hoặc áp dụng lịch điều trị. Prompt yêu cầu dẫn nguồn `[1]`,
`[2]`; server chặn số nguồn không tồn tại. Prompt không thay thế kiểm chứng chuyên môn.

Response/lịch sử có `sources` (số nguồn, loại, ID, tiêu đề, phần trích, phiên bản/thời điểm,
hash nội dung); `answer_source=rag` khi có nguồn, `model` khi không có nguồn.
Mobile hiển thị tài liệu đã tra cứu dưới câu trả lời, kể cả tải lại lịch sử.
Phần hiển thị câu trả lời AI bỏ dấu in đậm Markdown `**` (kể cả dạng escape), áp dụng cả lịch sử cũ.
Đây là tài liệu truy xuất, không bảo đảm model dùng đúng từng đoạn.
CSV thêm nguồn/trạng thái retrieval; prompt hash bao gồm dữ liệu truy xuất.
Giữ cấu hình `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`, `AI_TIMEOUT_MS` hiện có.
Khởi động lại backend và tải lại Expo sau cập nhật.

Kiểm tra local (mock DB/provider, không chứng minh chất lượng model thực tế):

```powershell
cd backend
npx.cmd --no-install jest --runInBand src/services/__tests__/chat-rag-api.test.js src/services/__tests__/chat-rag-retrieval.test.js
```

Test RAG mới ở `src/services/__tests__/`, không thuộc ignore của `tests/` hiện có.
Cần kiểm thử thêm MongoDB thật, model thật và thiết bị trước triển khai.

### Trang chủ theo tài khoản (15/11/2026)

Các ô “Nhận diện cây”, “Vườn của tôi” và chuông thông báo đã có điều hướng.
Nhận diện cây mở `/customer/identification`, dùng chung camera và model 78 nhãn
cây/bệnh với chẩn đoán, chỉ gợi ý tên cây khi vượt các ngưỡng hiện có; chưa hỗ trợ
nhận diện mọi loài cây. `POST /api/identification` nhận multipart `photo`, bảo vệ
bằng phiên Customer đang hoạt động như chẩn đoán nhưng không lưu bằng chứng bệnh
để áp dụng điều trị. Kết quả có liên kết chi tiết khi khớp cây trong danh mục.

Chuông mở `/customer/notifications`: danh sách nhắc điều trị đã đến hạn của tài
khoản, phân trang, kéo làm mới, đánh dấu đã đọc và mở lịch điều trị. API gồm
`GET /api/notifications?page=1&limit=20` và `PATCH /api/notifications/:id/read`;
chỉ Customer đang hoạt động được truy cập, chỉ đọc/sửa thông báo của chính mình.
Thông báo tương lai hoặc đã hủy không hiển thị. Đây là hộp thông báo trong ứng dụng;
chưa có worker gửi push/FCM hoặc thông báo trên hệ điều hành. Nút “Xem lịch chăm sóc”
tiếp tục mở màn `/customer/care` đã có.

Trang chủ lấy tổng số cây và số cây khỏe mạnh từ API vườn theo phiên đăng nhập,
không tính cây đã lưu trữ. Số cây đang điều trị là phần còn lại theo hai trạng thái
hiện có (`healthy`, `treatment`); tỷ lệ sức khỏe là số cây khỏe mạnh / tổng số cây,
không phải đánh giá sức khỏe từ AI. Vườn rỗng hiển thị “Chưa có cây”.
Danh sách xem trước hiển thị tối đa 6 cây mới nhất với ảnh/tên/trạng thái thật;
bấm cây mở chi tiết, “Xem thêm” mở vườn. Công việc chăm sóc thường hôm nay tiếp tục
dùng API lịch chăm sóc theo ngày Việt Nam, hỗ trợ đánh dấu hoàn thành. Dữ liệu tải
lại khi quay về trang chủ hoặc kéo xuống làm mới; lỗi có nút thử lại.
Weather vẫn ghi rõ là dữ liệu minh họa.

Cần kiểm thử thêm với MongoDB và thiết bị thật.

Màn **Chẩn đoán bệnh** tại `/customer/diagnosis` mở từ Home hoặc camera trên Navbar.
Nút **Phân tích ảnh** gửi ảnh đã chọn đến backend và hiển thị dữ liệu model thật;
đã bỏ kết quả mẫu. Có chụp ảnh, chọn lại, xem ảnh, retry lỗi, thông báo kết quả
không chắc chắn và hướng dẫn chụp lại. Ảnh chỉ giữ tạm trong màn hình và request,
không tự lưu album hoặc lịch sử chẩn đoán. Web hỗ trợ chọn ảnh; quyền camera bị
từ chối vẫn cho phép chọn album. Camera/album và hiển thị cần kiểm thử thiết bị thật.

Sau khi lấy code mới, chạy `npm ci` trong `mobile/` và khởi động lại Expo. Với development build, cần build lại app để áp dụng module native và cấu hình quyền mới; camera cần kiểm thử trên điện thoại thật. Triển khai dựa trên [Expo Camera](https://docs.expo.dev/versions/v58.0.0/sdk/camera/) và [Expo ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/).

Test hook/service của luồng chẩn đoán dùng mock thiết bị và phiên; không thay kiểm thử camera/album thực tế.

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

Repository không cung cấp script seed hoặc tạo Admin đầu tiên tự động; cần chuẩn bị tài khoản quản trị/dữ liệu ban đầu riêng. Đăng ký qua OTP tạo tài khoản Customer.

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
