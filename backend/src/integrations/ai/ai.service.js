const AppError = require("../../utils/app-error");

// Đọc cấu hình khi gọi để không ảnh hưởng các module khác khi chưa cấu hình AI.
const complete = async (messages) => {
  const key = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  const base = process.env.AI_BASE_URL?.trim() || "https://platform.beeknoee.com/api/v1";
  const timeout = Number(process.env.AI_TIMEOUT_MS || 30000);
  let url;
  try {
    url = new URL(`${base.replace(/\/$/, "")}/chat/completions`);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
      throw new Error();
  } catch {
    throw new AppError("AI_NOT_CONFIGURED", 503, "Trợ lý AI chưa được cấu hình.");
  }
  if (!key || !model || model === "MODEL_ID_CUA_BAN" ||
      !Number.isInteger(timeout) || timeout < 1000 || timeout > 45000)
    throw new AppError("AI_NOT_CONFIGURED", 503, "Trợ lý AI chưa được cấu hình.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: "POST",
      redirect: "error",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 1200, stream: false }),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429)
        throw new AppError("AI_BUSY", 503, "Trợ lý AI đang bận. Vui lòng thử lại sau.");
      throw new AppError("AI_UNAVAILABLE", 502, "Không thể kết nối trợ lý AI.");
    }
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim() || reply.length > 12000)
      throw new AppError("AI_INVALID_RESPONSE", 502, "Trợ lý AI trả về dữ liệu không hợp lệ.");
    return reply.trim();
  } catch (error) {
    if (controller.signal.aborted)
      throw new AppError("AI_TIMEOUT", 504, "AI trả lời quá lâu. Vui lòng thử lại.");
    if (error instanceof AppError) throw error;
    // Không chuyển message/body của nhà cung cấp vào response hoặc log.
    throw new AppError("AI_UNAVAILABLE", 502, "Không thể kết nối trợ lý AI.");
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { complete };
