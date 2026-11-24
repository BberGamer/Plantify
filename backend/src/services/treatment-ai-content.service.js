const mammoth = require("mammoth");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const fail = (code, status, message) => {
  throw new AppError(code, status, message);
};
const text = (value, field, max) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    fail("AI_INVALID_RESPONSE", 502, `${field} do AI trả về không hợp lệ.`);
  return value.trim();
};
const parseJson = (reply) => {
  const first = reply.indexOf("{");
  const last = reply.lastIndexOf("}");
  if (first < 0 || last <= first)
    fail("AI_INVALID_RESPONSE", 502, "AI không trả về phác đồ JSON hợp lệ.");
  try {
    return JSON.parse(reply.slice(first, last + 1));
  } catch {
    return fail(
      "AI_INVALID_RESPONSE",
      502,
      "AI không trả về phác đồ JSON hợp lệ.",
    );
  }
};
const tokens = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]{2,}/g) || [];
const chunkDocument = (content, size = 1400, overlap = 200) => {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const chunks = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 1 > size) {
      chunks.push(current);
      current = `${current.slice(-overlap)}\n${paragraph}`;
    } else current = current ? `${current}\n${paragraph}` : paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
};
const retrieve = (content, query, limit = 10) => {
  const queryTokens = new Set(tokens(query));
  return chunkDocument(content)
    .map((chunk, index) => {
      const words = tokens(chunk);
      const matches = words.reduce(
        (sum, word) => sum + (queryTokens.has(word) ? 1 : 0),
        0,
      );
      return {
        chunk,
        index,
        score: matches / Math.sqrt(Math.max(words.length, 1)),
      };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((item, index) => `[DOCX ${index + 1}]\n${item.chunk}`)
    .join("\n\n");
};
const relevantDiseaseSection = (content, query) => {
  const sections = content
    .split(/(?=Bệnh:\s*)/i)
    .filter((item) => /^Bệnh:\s*/i.test(item.trim()));
  if (!sections.length) return content;
  const queryTokens = new Set(tokens(query));
  return sections
    .map((section, index) => ({
      section,
      index,
      score: tokens(section.slice(0, 300)).reduce(
        (sum, word) => sum + (queryTokens.has(word) ? 1 : 0),
        0,
      ),
    }))
    .sort(
      (left, right) => right.score - left.score || left.index - right.index,
    )[0].section;
};
const documentSchedule = (content) => {
  const entries = [
    ...content.matchAll(
      /Ngày\s+(\d{1,2})\s*[–—-]\s*((?:[01]\d|2[0-3]):[0-5]\d)/gi,
    ),
  ].map((match) => ({ day: Number(match[1]), time: match[2] }));
  if (!entries.length) return null;
  const unique = new Map(entries.map((entry) => [entry.day, entry.time]));
  const result = [...unique]
    .sort((left, right) => left[0] - right[0])
    .map(([day, time]) => ({ day, time }));
  return result.every((entry, index) => entry.day === index + 1)
    ? result
    : null;
};
const parsePlantIds = (value) => {
  let values = value;
  if (typeof value === "string") {
    try {
      values = JSON.parse(value);
    } catch {
      values = value.split(",");
    }
  }
  if (!Array.isArray(values) || !values.length)
    v.invalid("plant_ids", "Vui lòng chọn ít nhất một cây áp dụng.");
  return [...new Set(values.map((id) => v.id(String(id).trim(), "plant_ids")))];
};
const validateResult = (result) => {
  const duration = Number(result?.duration_days);
  if (!Number.isInteger(duration) || duration < 1 || duration > 60)
    fail(
      "AI_INVALID_RESPONSE",
      502,
      "Thời lượng phác đồ do AI trả về không hợp lệ.",
    );
  if (!Array.isArray(result.tasks) || result.tasks.length !== duration)
    fail(
      "AI_INVALID_RESPONSE",
      502,
      "AI phải trả đúng một công việc cho mỗi ngày điều trị.",
    );
  const stages = result.tasks.map((task, index) => {
    if (
      task?.day !== index + 1 ||
      typeof task.time !== "string" ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(task.time)
    )
      fail(
        "AI_INVALID_RESPONSE",
        502,
        "Ngày hoặc giờ thực hiện do AI trả về không hợp lệ.",
      );
    const instruction = text(task.instruction, "Hướng dẫn", 2000);
    const safety =
      typeof task.safety_note === "string" ? task.safety_note.trim() : "";
    return {
      order: index + 1,
      title: text(task.title, "Tên công việc", 150),
      time: task.time,
      start_day: index + 1,
      end_day: index + 1,
      instructions: [instruction],
      dosage_note: "",
      important_note: safety,
    };
  });
  const safetyGuidelines = Array.isArray(result.safety_guidelines)
    ? [
        ...new Set(
          result.safety_guidelines.map((item) =>
            text(item, "Hướng dẫn an toàn", 2000),
          ),
        ),
      ]
    : [];
  if (!safetyGuidelines.length)
    fail("AI_INVALID_RESPONSE", 502, "AI chưa trả hướng dẫn an toàn.");
  return {
    protocol_name: text(result.protocol_name, "Tên phác đồ", 200),
    description: text(result.description, "Mô tả", 5000),
    duration_days: duration,
    stages,
    safety_guidelines: safetyGuidelines,
  };
};

const extractDocument = async (buffer) => {
  let extracted;
  try {
    extracted = await mammoth.extractRawText({ buffer });
  } catch {
    return fail(
      "INVALID_TREATMENT_DOCUMENT",
      400,
      "Không đọc được nội dung file DOCX.",
    );
  }
  const value = extracted.value
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (value.length < 50 || value.length > 250000)
    fail(
      "INVALID_TREATMENT_DOCUMENT",
      422,
      "Nội dung DOCX phải có từ 50 đến 250.000 ký tự.",
    );
  return value;
};

module.exports = {
  fail,
  chunkDocument,
  retrieve,
  parseJson,
  validateResult,
  parsePlantIds,
  extractDocument,
  relevantDiseaseSection,
  documentSchedule,
};
