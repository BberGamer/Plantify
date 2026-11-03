# FAQ cho chat Plantify

System prompt trong `src/services/chat.service.js` có 8 quy tắc sử dụng dữ liệu
tham chiếu: ưu tiên thông tin đã xác minh, không tự đặt con số/chẩn đoán, giữ điều
kiện áp dụng, trả lời trực tiếp, hỏi thêm tối đa 1–2 câu khi cần và dùng tiếng Việt
ngắn gọn, tránh Markdown/emoji không cần thiết. Quy tắc được gửi ở role system
trong mỗi lần gọi model, không phải bộ chấm điểm tự động.

Nhánh FAQ khớp vẫn trả nguyên answer, không gọi model nên không được prompt viết
lại. Luồng hiện tại chưa gửi FAQ như ngữ cảnh tham khảo cho model. Thêm quy tắc
không tự bật RAG, không tự duyệt draft và không sửa nội dung MongoDB.

Đã bổ sung [lưu lịch sử và đánh giá CCC tự động](CHAT_EVALUATION.md).
Trả lời FAQ/model giữ luồng cũ; phần đánh giá dùng request riêng và lưu vào
`chat_turns`, không ghi điểm vào collection FAQ.

Chat đọc collection `chat_faqs` trong cùng database backend. Chỉ dùng bản ghi có
`status: "approved"`, `language: "vi"` và đáp án không rỗng. File
`data/chat-evaluation-references.json` là bộ mẫu dùng riêng cho đánh giá, không tự import vào MongoDB.
Các bản ghi `draft` cần được kiểm chứng nguồn trước khi duyệt. Backend không tự
import hoặc tự duyệt dữ liệu.

Câu hỏi khớp `question` hoặc một chuỗi trong `aliases` sẽ trả nguyên `answer`,
không gọi model. So khớp bỏ khác biệt hoa/thường, khoảng trắng và dấu chấm/hỏi/cảm
ở cuối, giữ nguyên dấu tiếng Việt và từ phủ định. Chưa có tìm theo ý nghĩa.
Không khớp hoặc có nhiều đáp án khác nhau cho cùng câu thì dùng AI như trước.
Dữ liệu mẫu chỉ phục vụ câu hỏi chung, không dùng cho kết luận cá nhân hóa theo
tình trạng cây. Không có cache nên sửa FAQ có hiệu lực ở request tiếp theo.

## Đánh giá trước/sau

Đặt `AI_FAQ_ENABLED=false` để tắt FAQ; `true` hoặc không đặt để bật.
Khởi động lại backend khi đổi biến môi trường. Kết quả trả trực tiếp FAQ đo
khả năng khớp bộ mẫu, không chứng minh model đã được huấn luyện.

## Kiểm tra

Từ backend chạy:

```powershell
node node_modules/jest/bin/jest.js tests/chat.test.js tests/chatFaq.test.js --runInBand
```

Test dùng database/provider mock, không thay cho kiểm tra MongoDB thật.
