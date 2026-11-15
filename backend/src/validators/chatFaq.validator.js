const v = require("./common");

const payload = (input) => {
  v.object(input);
  const bounded = (value, field, max, required = true) => {
    const result = v.text(value, field, required);
    if (result.length > max) v.invalid(field, `Nội dung tối đa ${max} ký tự.`);
    return result;
  };
  const question = bounded(input.question, "question", 1000);
  const answer = bounded(input.answer, "answer", 12000);
  const topic = bounded(input.topic ?? "", "topic", 150, false);
  if (!Array.isArray(input.aliases) || input.aliases.length > 30)
    v.invalid("aliases", "Nhập tối đa 30 câu hỏi tương đương.");
  const aliases = input.aliases.map(value => bounded(value, "aliases", 1000));
  if (input.language !== undefined && input.language !== "vi")
    v.invalid("language", "Hiện chỉ quản lý FAQ tiếng Việt.");
  return { question, answer, topic, aliases, language: "vi" };
};

const revision = (input) => {
  v.object(input);
  if (!Number.isSafeInteger(input.version) || input.version < 1)
    v.invalid("version", "Phiên bản FAQ không hợp lệ. Vui lòng tải lại.");
  return input.version;
};

module.exports = { payload, revision };
