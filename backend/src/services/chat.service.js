const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const ai = require("../integrations/ai/ai.service");
const v = require("../validators/common");

const SYSTEM_PROMPT = "Bạn là trợ lý chăm sóc cây của Plantify. Trả lời bằng tiếng Việt, " +
  "ngắn gọn, dễ hiểu và tập trung vào cây trồng. Khi thiếu thông tin, hỏi thêm về loại cây, " +
  "ánh sáng, độ ẩm đất và triệu chứng. Không khẳng định bệnh khi chưa đủ dữ liệu. " +
  "Không tự nhận đã xem database, ảnh hoặc thực hiện thao tác trong app. " +
  "Không yêu cầu mật khẩu, OTP hoặc API key. Bạn chỉ hỗ trợ hội thoại văn bản.";

// Chặn gửi trùng trên cùng tài khoản trong một process, kể cả nhiều màn hình/thiết bị.
const pending = new Set();
const send = async (userId, { message, history }) => {
  v.id(userId);
  const user = await User.findById(userId).select("status").lean();
  if (!user) throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
  if (!user.status) throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
  if (pending.has(userId))
    throw new AppError("REQUEST_IN_PROGRESS", 409, "Thao tác đang được xử lý.");
  pending.add(userId);
  try {
    const reply = await ai.complete([
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ]);
    return { reply };
  } finally {
    pending.delete(userId);
  }
};

module.exports = { send };
