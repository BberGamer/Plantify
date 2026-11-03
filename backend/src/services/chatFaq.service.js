const ChatFaq = require("../models/chatFaq.model");

// Chỉ chuẩn hóa hình thức; giữ dấu và từ phủ định để không đổi nghĩa câu hỏi.
const normalize = (text) => text.normalize("NFC").toLocaleLowerCase("vi")
  .trim().replace(/\s+/gu, " ").replace(/[?!.。？！]+$/gu, "").trim();

const findAnswer = async (message) => {
  // Cho phép tắt FAQ để đo baseline với cùng model/prompt và bộ câu hỏi.
  if (process.env.AI_FAQ_ENABLED === "false") return null;
  const target = normalize(message);
  const faqs = await ChatFaq.find({ status: "approved", language: "vi" })
    .select("id question aliases answer status language version")
    .lean();
  const matches = faqs.filter((faq) => {
    if (faq.status !== "approved" || faq.language !== "vi" ||
        typeof faq.answer !== "string" || !faq.answer.trim() || faq.answer.length > 12000)
      return false;
    return [faq.question, ...(Array.isArray(faq.aliases) ? faq.aliases : [])]
      .some((question) => typeof question === "string" && normalize(question) === target);
  });
  if (!matches.length) return null;
  // Không tùy ý chọn một đáp án nếu dữ liệu có câu hỏi trùng nhưng trả lời khác.
  const answers = [...new Set(matches.map((faq) => faq.answer.trim()))];
  return answers.length === 1 ? answers[0] : null;
};

module.exports = { findAnswer };
