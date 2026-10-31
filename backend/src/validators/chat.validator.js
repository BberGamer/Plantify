const v = require("./common");

const chat = (input) => {
  v.object(input);
  const message = v.text(input.message, "message");
  if (message.length > 2000) v.invalid("message", "Tin nhắn không quá 2000 ký tự.");
  const history = input.history === undefined ? [] : input.history;
  if (!Array.isArray(history) || history.length > 20 || history.length % 2 !== 0)
    v.invalid("history", "Lịch sử hội thoại không hợp lệ.");
  let total = message.length;
  const normalized = history.map((item, index) => {
    v.object(item, "history");
    if (item.role !== (index % 2 === 0 ? "user" : "assistant"))
      v.invalid("history", "Thứ tự hội thoại không hợp lệ.");
    const content = v.text(item.content, "history");
    if (content.length > 12000) v.invalid("history");
    total += content.length;
    return { role: item.role, content };
  });
  if (total > 24000) v.invalid("history", "Hội thoại quá dài. Vui lòng bắt đầu lại.");
  return { message, history: normalized };
};

module.exports = { chat };
