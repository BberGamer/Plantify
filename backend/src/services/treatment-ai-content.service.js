const mammoth = require("mammoth");
const fs = require("node:fs/promises");
const path = require("node:path");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const {
  dailySteps,
  formatTreatmentInstruction,
  presentTreatmentInstruction,
  compactTreatmentNote,
} = require("./treatment-instructions");

const fail = (code, status, message) => {
  throw new AppError(code, status, message);
};
const text = (value, field, max) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    fail("AI_INVALID_RESPONSE", 502, `${field} do AI trả về không hợp lệ.`);
  return value.trim();
};
const parseJson = (reply, label = "phác đồ") => {
  const first = reply.indexOf("{");
  const last = reply.lastIndexOf("}");
  if (first < 0 || last <= first)
    fail("AI_INVALID_RESPONSE", 502, `AI không trả về ${label} JSON hợp lệ.`);
  try {
    return JSON.parse(reply.slice(first, last + 1));
  } catch {
    return fail(
      "AI_INVALID_RESPONSE",
      502,
      `AI không trả về ${label} JSON hợp lệ.`,
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
const withoutScheduleTimes = (content) =>
  content.replace(
    /^([ \t]*Ngày[ \t]+\d{1,2})[ \t]*[–—-][ \t]*(?:[01]?\d|2[0-3]):[0-5]\d[ \t]*([–—-][ \t]*|$)/gim,
    (_, day, separator) => day + (separator ? " – " : ""),
  );
const documentDuration = (content) => {
  const duration = Number(content.match(/^Thời lượng mẫu:\s*(\d{1,2})\s*ngày/im)?.[1]);
  return duration >= 1 && duration <= 60 ? duration : null;
};

const nameKey = (name) => tokens(name.replace(/đ/giu, "d")).join(" ");

const diseaseNames = (value, plants) => String(value || "")
  .split("/")
  .flatMap((name) => {
    const alias = name.match(/^(.+?)\s*\(([^()]+)\)\s*$/);
    return alias ? [name, alias[1], alias[2]] : [name];
  })
  .map((name) => {
    const byPlant = name.match(/^(.+?)\s+ở\s+(.+)$/iu);
    const withoutPlant = byPlant && plants.has(nameKey(byPlant[2])) ? byPlant[1] : name;
    return nameKey(withoutPlant
      .replace(/^\s*bệnh\s+/iu, "")
      .replace(/\s+do\s+virus\s*$/iu, ""));
  })
  .filter(Boolean);

function findBundledDiseaseSection(content, names, plantName = "") {
  const sections = content.split(/(?=^Bệnh:[ \t]*)/im);
  const matches = sections.filter((section) => {
    const name = section.match(/^Bệnh:[ \t]*(.+)$/im)?.[1];
    if (!name) return false;
    const plants = new Set([plantName, documentField(section, "Cây áp dụng")].map(nameKey));
    const target = new Set(names.flatMap((value) => diseaseNames(value, plants)));
    return diseaseNames(name, plants).some((label) => target.has(label));
  });
  return matches.length === 1 ? matches[0] : "";
}

function documentField(section, name) {
  const prefix = name + ":";
  const line = section.split("\n").find((value) => value.startsWith(prefix));
  return line?.slice(prefix.length).trim() || "";
}

function readBundledPlan(section, diseaseName) {
  const duration = documentDuration(section);
  const content = withoutScheduleTimes(section);
  const headings = [...content.matchAll(/^Ngày[ \t]+(\d{1,2})(?:[ \t]*[–—-][ \t]*(.+?))?[ \t]*$/gim)];
  if (!duration || headings.length !== duration ||
      headings.some((heading, index) => Number(heading[1]) !== index + 1)) return null;

  const tasks = headings.map((heading, index) => {
    const day = Number(heading[1]);
    const block = content.slice(heading.index + heading[0].length, headings[index + 1]?.index);
    const method = documentField(block, "Cách thực hiện") || documentField(block, "Công việc");
    const outcome = documentField(block, "Kết quả cần đạt") || documentField(block, "Kết quả cần ghi nhận");
    const safety = documentField(block, "Lưu ý") || documentField(block, "An toàn");
    const preparation = documentField(block, "Chuẩn bị");
    const tools = documentField(block, "Dụng cụ");
    if (!method || !safety) return null;
    const watering = /(?:^|[.;]\s*)tưới\b/iu.test(method);
    const water = documentField(block, "Tưới nước") || documentField(block, "Lượng nước") ||
      (watering ? "Theo độ ẩm đất" : "0ml");
    const fertilizer = documentField(block, "Phân bón") || (/(?:^|[.;]\s*)bón\b/iu.test(method)
      ? "Theo nhãn (khi có chỉ định)"
      : "0g");
    const action = watering && water === "Theo độ ẩm đất"
      ? "Kiểm tra độ ẩm đất trước khi tưới; " + method
      : method;
    return {
      day,
      title: (heading[2]?.trim() || method).slice(0, 150),
      method,
      instruction: presentTreatmentInstruction([
        preparation && "Chuẩn bị: " + preparation,
        "Bước 1: " + action,
        "Tưới nước: " + water,
        "Phân bón: " + fertilizer,
        tools && "Dụng cụ: " + tools,
        outcome && "Kết quả cần đạt: " + outcome,
      ].filter(Boolean).join("\n")),
      dosage_note: documentField(block, "Liều lượng"),
      safety_note: safety,
    };
  });
  if (tasks.some((task) => !task)) return null;

  const overview = content.slice(0, headings[0].index);
  return {
    protocol_name: ("Phác đồ " + diseaseName).slice(0, 200),
    description: [
      documentField(overview, "Mục tiêu"),
      documentField(overview, "Tần suất"),
    ].filter(Boolean).join("\n") || "Thực hiện công việc theo từng ngày trong tài liệu tham khảo.",
    duration_days: duration,
    tasks,
    timing_guidance: documentField(overview, "Nguyên tắc thời gian"),
    safety_guidelines: [
      documentField(overview, "Liều lượng"),
      ...new Set(tasks.map((task) => task.safety_note)),
    ].filter(Boolean),
  };
}
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
const validateResult = (result, expectedDuration) => {
  const duration = Number(result?.duration_days);
  if (!Number.isInteger(duration) || duration < 1 || duration > 60)
    fail(
      "AI_INVALID_RESPONSE",
      502,
      "Thời lượng phác đồ do AI trả về không hợp lệ.",
    );
  if (expectedDuration && duration !== expectedDuration)
    fail("AI_INVALID_RESPONSE", 502, "Thời lượng phác đồ không khớp tài liệu tham chiếu.");
  if (!Array.isArray(result.tasks) || result.tasks.length !== duration)
    fail(
      "AI_INVALID_RESPONSE",
      502,
      "AI phải trả đúng một công việc cho mỗi ngày điều trị.",
    );
  const safetyGuidelines = Array.isArray(result.safety_guidelines)
    ? [...new Set(result.safety_guidelines.map((item) => text(item, "Hướng dẫn an toàn", 2000)))]
    : [];
  if (!safetyGuidelines.length)
    fail("AI_INVALID_RESPONSE", 502, "AI chưa trả hướng dẫn an toàn.");
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
    const instruction = formatTreatmentInstruction(text(task.instruction, "Hướng dẫn", 2000));
    const steps = dailySteps(instruction);
    if (steps.length < 2 || steps.some(([, number], index) => Number(number) !== index + 1))
      fail("AI_INVALID_RESPONSE", 502, "Mỗi ngày điều trị cần ít nhất hai bước theo thứ tự.");
    if (
      !/^Tưới nước:[ \t]*\S/im.test(instruction) ||
      !/^Phân bón:[ \t]*\S/im.test(instruction) ||
      !/^Kết quả cần đạt:[ \t]*\S/im.test(instruction)
    )
      fail(
        "AI_INVALID_RESPONSE",
        502,
        "Công việc điều trị thiếu thông tin tưới nước, phân bón hoặc kết quả cần đạt.",
      );
    const safety =
      typeof task.safety_note === "string" ? task.safety_note.trim() : "";
    const dosage =
      task.dosage_note == null || task.dosage_note === ""
        ? ""
        : text(task.dosage_note, "Liều lượng", 2000);
    return {
      order: index + 1,
      title: text(task.title, "Tên công việc", 150),
      time: task.time,
      start_day: index + 1,
      end_day: index + 1,
      instructions: [instruction],
      dosage_note: dosage,
      important_note: compactTreatmentNote(safety, safetyGuidelines),
    };
  });
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

const slugifyVietnamese = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const readPlantDocument = async (plantName) => {
  const slug = slugifyVietnamese(plantName);
  const filename = (slug === "cherry" ? "anh-dao" : slug) + ".docx";
  try {
    const buffer = await fs.readFile(
      path.resolve(__dirname, "../../data/treatment-templates", filename),
    );
    return { buffer, originalname: filename };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
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
  withoutScheduleTimes,
  documentDuration,
  findBundledDiseaseSection,
  readBundledPlan,
  slugifyVietnamese,
  readPlantDocument,
};
