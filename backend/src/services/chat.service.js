const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const ai = require("../integrations/ai/ai.service");
const faq = require("./chatFaq.service");
const v = require("../validators/common");
const chatHistory = require("./chatHistory.service");
const benchmark = require("./chatBenchmark.service");
const { getChatSettings, selectHistory } = require("../config/chat");

const SYSTEM_PROMPT = "Bạn là trợ lý chăm sóc cây của Plantify. Trả lời bằng tiếng Việt, " +
  "ngắn gọn, dễ hiểu và tập trung vào cây trồng. Khi thiếu thông tin, hỏi thêm về loại cây, " +
  "ánh sáng, độ ẩm đất và triệu chứng. Không khẳng định bệnh khi chưa đủ dữ liệu. " +
  "Không tự nhận đã xem database, ảnh hoặc thực hiện thao tác trong app. " +
  "Không yêu cầu mật khẩu, OTP hoặc API key. Bạn chỉ hỗ trợ hội thoại văn bản.\n\n" +
  "QUY TẮC SỬ DỤNG DỮ LIỆU THAM CHIẾU PLANTIFY\n" +
  "1. Khi có dữ liệu tham chiếu phù hợp với câu hỏi, ưu tiên các thông tin đã được xác minh trong dữ liệu đó.\n" +
  "2. Không tự bổ sung con số, lịch tưới, liều lượng phân bón hoặc kết luận bệnh cây khi không có căn cứ phù hợp.\n" +
  "3. Nếu dữ liệu tham chiếu cho biết một hướng dẫn phụ thuộc điều kiện môi trường, không chuyển hướng dẫn đó thành một quy tắc cố định.\n" +
  "4. Trả lời trực tiếp câu hỏi trước, sau đó giải thích hoặc hướng dẫn thêm khi cần.\n" +
  "5. Nếu câu hỏi chưa đủ thông tin, nêu rõ giới hạn và hỏi thêm tối đa 1–2 câu liên quan.\n" +
  "6. Ưu tiên tính chính xác (Correctness), độ đầy đủ (Completeness) và chất lượng truyền đạt (Communication Quality).\n" +
  "7. Sử dụng tiếng Việt rõ ràng, ngắn gọn. Không tạo các tiêu đề, ký tự Markdown hoặc emoji không cần thiết.\n" +
  "8. Nếu dữ liệu tham chiếu chưa được xác minh hoặc không đủ để trả lời, không coi đó là bằng chứng chắc chắn. Không tự tạo nguồn tham khảo.\n" +
  "Chỉ coi nội dung thực sự được cung cấp là dữ liệu tham chiếu; lịch sử hội thoại không tự động là nguồn đã xác minh. " +
  "Nếu không được cung cấp dữ liệu tham chiếu, không tự nhận câu trả lời dựa trên dữ liệu hoặc tài liệu Plantify. " +
  "Thông thường chỉ trả lời 3–5 câu ngắn: kết luận trực tiếp, cách kiểm tra hoặc hành động cần thiết, " +
  "và tối đa 1–2 câu hỏi thêm nếu thật sự cần. Không liệt kê hàng loạt nguyên nhân/ngoại lệ ngoài câu hỏi. " +
  "Dùng văn bản thuần, không Markdown hoặc emoji. Ưu tiên hoàn tất câu trả lời ngắn trong giới hạn đầu ra.";

// Chặn gửi trùng trên cùng tài khoản trong một process, kể cả nhiều màn hình/thiết bị.
const pending = new Set();
const send = async (userId, { message, history, conversation_id }) => {
  const started = performance.now();
  v.id(userId);
  const user = await User.findById(userId).select("status").lean();
  if (!user) throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
  if (!user.status) throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
  if (pending.has(userId))
    throw new AppError("REQUEST_IN_PROGRESS", 409, "Thao tác đang được xử lý.");
  pending.add(userId);
  try {
    const conversationId = await chatHistory.assertConversation(userId, conversation_id);
    const answer = await faq.findAnswer(message);
    const settings = getChatSettings();
    const context = selectHistory(history, message, settings.historyPairs);
    const reply = answer !== null ? answer : await ai.complete([
      { role: "system", content: SYSTEM_PROMPT },
      ...context,
      { role: "user", content: message },
    ], { maxTokens: settings.maxTokens });
    try {
      const saved = await chatHistory.saveTurn({ user_id: userId, conversation_id: conversationId,
        ...benchmark.metadata(message, context, SYSTEM_PROMPT, settings.maxTokens),
        backend_answer_ms: Math.round(performance.now() - started),
        question: message, answer: reply, answer_source: answer !== null ? "faq" : "model",
        model: answer !== null ? null : process.env.AI_MODEL,
        prompt_version: "plantify-concise-v2", faq_enabled: process.env.AI_FAQ_ENABLED !== "false" });
      return { reply, message_id: saved.id, conversation_id: saved.conversation_id,
        backend_answer_ms: saved.backend_answer_ms, test_case_id: saved.test_case_id,
        experiment_id: saved.experiment_id, experiment_condition: saved.experiment_condition,
        saved: true, evaluation_enabled: saved.evaluation_enabled, evaluation: saved.evaluation };
    } catch {
      // Lỗi ghi lịch sử không làm mất câu trả lời đã tạo hoặc báo lưu thành công giả.
      return { reply, saved: false, message_id: null, evaluation_enabled: false,
        evaluation: { status: "unavailable", message: "Chưa lưu được lịch sử; chưa thể đánh giá câu trả lời này." } };
    }
  } finally {
    pending.delete(userId);
  }
};

module.exports = { send, SYSTEM_PROMPT };
