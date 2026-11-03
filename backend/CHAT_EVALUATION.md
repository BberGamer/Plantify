# Lịch sử và đánh giá CCC tự động

## Dùng trên app

Restart backend và Expo, đăng nhập rồi mở Trợ lý AI. App tải 20 lượt gần nhất của
hội thoại mới nhất. Hỏi “Khi nào tôi nên tưới cây trầu bà?”; answer hiện trước,
sau đó app gửi request chấm CCC riêng. Kết quả gồm ba điểm 1–5, trọng số, CCC /5,
nhận xét, trích dẫn, vấn đề, tối đa 3 đề xuất và kết luận.

“Cuộc trò chuyện mới” bắt đầu ngữ cảnh mới, không xóa DB. “Tải lịch sử” lấy lại
hội thoại gần nhất. API có cursor cho các trang cũ; màn hình hiển thị phần gần nhất.
Hội thoại từ trước tính năng này không thể khôi phục nếu chưa từng được lưu.

## Cấu hình

```dotenv
AI_EVALUATION_ENABLED=true
AI_EVALUATOR_MODEL=
AI_EVALUATION_TIMEOUT_MS=60000
```

Nếu không đặt enabled: bật ở development/test, tắt ở production. Đặt false để tắt
ở mọi môi trường; restart khi đổi env. Judge dùng AI_EVALUATOR_MODEL hoặc AI_MODEL
nếu bỏ trống. Mỗi câu có mẫu thường thêm một request trả phí; đọc kết quả đã chấm
không gọi lại AI. Cùng model tự chấm có thể thiên lệch; cần người kiểm tra kết quả.

Judge có timeout riêng mặc định 60 giây, cấu hình từ 1000 đến 90000ms. Chat vẫn
giữ AI_TIMEOUT_MS như cũ. Giao diện chờ judge riêng, không giữ nút gửi ở trạng thái
đang trả lời trong suốt thời gian chấm.

Không thay key, không tự import hoặc duyệt FAQ. Chat vẫn dùng prompt/FAQ cũ.
Metadata đánh giá không đưa vào lịch sử hội thoại gửi model.

## Reference và rubric

- `data/chat-evaluation-references.json`: bản sao 50 câu chuẩn hóa người dùng cung cấp.
- `data/chat-ccc-framework.json`: rubric 1–5, Correctness 40%, Completeness 40%, Communication 20%.
- Tìm question/aliases trong JSON trước, sau đó Mongo `chat_faqs`. Chuẩn hóa hoa/thường,
  khoảng trắng, dấu câu cuối; chưa hỗ trợ câu khác nghĩa hoặc tìm ngữ nghĩa.
- Draft dùng để so sánh nghiên cứu với `provisional=true`; không coi là ground truth.
- Approved có nguồn chỉ là xác minh theo hồ sơ duyệt, không tự kiểm tra nguồn trên Internet.
- Không khớp: `no_reference`, không có điểm và không gọi judge.
- Restart khi sửa JSON. Bản JSON không tự cập nhật collection FAQ sản phẩm.
- Trả lời lấy thẳng FAQ được ghi rõ: điểm không đo khả năng sinh câu mới của model.

## MongoDB và API

Collection mới `chat_turns` lưu user_id, conversation_id, câu hỏi, câu trả lời, nguồn
FAQ/model, model, prompt version, thời gian và evaluation. Không lưu JWT/API key.
Reference được snapshot cùng hash khi chấm; không ghi điểm vào knowledge collection.

Mọi endpoint yêu cầu JWT, tài khoản active và đúng chủ sở hữu. Prefix `/api` hoặc `/api/v1`:

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | /chat | Body message, history, conversation_id tùy chọn; data giữ reply, thêm message_id/conversation_id/saved/evaluation_enabled/evaluation |
| GET | /chat/history | conversation_id tùy chọn; limit mặc định 20/tối đa 50; before là cursor ID; mặc định hội thoại mới nhất |
| POST | /chat/:id/evaluation | Chấm answer đã lưu của chính user; không nhận điểm từ client |
| GET | /chat/:id/evaluation | Đọc kết quả, không gọi judge |

History trả lượt cũ đến mới và next_cursor. ID không thuộc user trả 404.
Không có migration xóa dữ liệu hoặc tự import; collection mới được Mongoose tạo khi sử dụng.
Để trợ lý IDE đọc lại, yêu cầu rõ tài khoản/hội thoại cần xem, không truy vấn chat người khác.

## Lỗi và giới hạn

- Answer hiển thị trước, judge lỗi không làm mất answer. Mỗi lượt claim nguyên tử,
  lease 180 giây, tối đa 3 lần thử. Completed dùng lại, không phát sinh thêm chi phí.
- Một process chấm một lượt/user cùng lúc; nhiều replica cần rate limiter dùng chung.
- Restart giữa khi chấm: sau khi hết lease có thể retry. Không tạo điểm cho lượt dang dở.
- Judge trả JSON sai, điểm ngoài 1–5, dẫn chứng không có trong answer, hoặc hơn 3 đề xuất:
  failed, không tự sửa điểm. Retry chỉ chấm lại, không hỏi AI lại.
- Backend tự tính 0.4C + 0.4F + 0.2M; không dùng composite do judge tự tạo.
- Markdown UI ghi riêng; Native Text không chạy HTML/JavaScript từ model.
- DB lưu lỗi: vẫn trả answer, saved=false và cảnh báo chưa lưu/chưa chấm; không báo lưu giả.
- Đổi user/rời màn hình/hội thoại mới: response cũ không ghi đè UI. Server có thể
  hoàn tất lưu cho user cũ. Kết quả chấm vẫn thuộc đúng owner.

Không phải benchmark trước/sau đã hoàn thành. Không có điểm cho câu chưa hỏi thực
tế. Điểm provisional không chứng minh độ chính xác khoa học.

## Kiểm tra

Từ backend:

```powershell
node node_modules/jest/bin/jest.js tests/chat.test.js tests/chatFaq.test.js tests/chatEvaluation.test.js --runInBand
```

Từ mobile:

```powershell
node --test tests/useChat.test.cjs tests/chatEvaluationFlow.test.cjs
```

Tests dùng provider/DB mô phỏng. Cần kiểm tra thêm API thật và Android/iOS khi triển khai.
