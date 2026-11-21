const mammoth = require("mammoth");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/app-error");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const ai = require("../integrations/ai/ai.service");
const v = require("../validators/common");

const TEMPLATE_DIRECTORY = path.resolve(__dirname, "../../data/treatment-templates");
const pendingBundledGenerations = new Map();

const PROMPT = `Bạn tạo phác đồ điều trị cây bằng tiếng Việt. Ưu tiên tuyệt đối dữ liệu trong các đoạn DOCX được cung cấp. Khi tài liệu thiếu chi tiết, được dùng kiến thức chăm sóc cây phổ biến nhưng không bịa tên thuốc thương mại, hóa chất nguy hiểm hoặc khẳng định chắc chắn hiệu quả. Trả duy nhất JSON, không Markdown: {"protocol_name":"...","description":"...","duration_days":7,"tasks":[{"day":1,"time":"05:45","title":"...","instruction":"...","safety_note":"..."},{"day":2,"time":"09:30","title":"...","instruction":"...","safety_note":"..."}],"safety_guidelines":["..."]}. duration_days từ 1 đến 60. tasks phải có đúng một công việc cho từng ngày từ 1 đến duration_days, sắp xếp theo ngày. Các giờ trong ví dụ chỉ minh họa; nếu DOCX cung cấp lịch thì phải giữ nguyên giờ của từng ngày, không được quy tất cả về một giờ. time là HH:mm theo giờ Việt Nam. Nội dung phải cụ thể, ngắn gọn và an toàn.`;

const fail = (code, status, message) => { throw new AppError(code, status, message); };
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
  try { return JSON.parse(reply.slice(first, last + 1)); }
  catch { return fail("AI_INVALID_RESPONSE", 502, "AI không trả về phác đồ JSON hợp lệ."); }
};
const tokens = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().match(/[a-z0-9]{2,}/g) || [];
const chunkDocument = (content, size = 1400, overlap = 200) => {
  const paragraphs = content.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
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
  return chunkDocument(content).map((chunk, index) => {
    const words = tokens(chunk);
    const matches = words.reduce((sum, word) => sum + (queryTokens.has(word) ? 1 : 0), 0);
    return { chunk, index, score: matches / Math.sqrt(Math.max(words.length, 1)) };
  }).sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit).map((item, index) => `[DOCX ${index + 1}]\n${item.chunk}`).join("\n\n");
};
const relevantDiseaseSection = (content, query) => {
  const sections = content.split(/(?=Bệnh:\s*)/i).filter((item) => /^Bệnh:\s*/i.test(item.trim()));
  if (!sections.length) return content;
  const queryTokens = new Set(tokens(query));
  return sections.map((section, index) => ({
    section, index,
    score: tokens(section.slice(0, 300)).reduce(
      (sum, word) => sum + (queryTokens.has(word) ? 1 : 0), 0),
  })).sort((left, right) => right.score - left.score || left.index - right.index)[0].section;
};
const documentSchedule = (content) => {
  const entries = [...content.matchAll(/Ngày\s+(\d{1,2})\s*[–—-]\s*((?:[01]\d|2[0-3]):[0-5]\d)/gi)]
    .map((match) => ({ day: Number(match[1]), time: match[2] }));
  if (!entries.length) return null;
  const unique = new Map(entries.map((entry) => [entry.day, entry.time]));
  const result = [...unique].sort((left, right) => left[0] - right[0])
    .map(([day, time]) => ({ day, time }));
  return result.every((entry, index) => entry.day === index + 1) ? result : null;
};
const parsePlantIds = (value) => {
  let values = value;
  if (typeof value === "string") {
    try { values = JSON.parse(value); }
    catch { values = value.split(","); }
  }
  if (!Array.isArray(values) || !values.length)
    v.invalid("plant_ids", "Vui lòng chọn ít nhất một cây áp dụng.");
  return [...new Set(values.map((id) => v.id(String(id).trim(), "plant_ids")))];
};
const validateResult = (result) => {
  const duration = Number(result?.duration_days);
  if (!Number.isInteger(duration) || duration < 1 || duration > 60)
    fail("AI_INVALID_RESPONSE", 502, "Thời lượng phác đồ do AI trả về không hợp lệ.");
  if (!Array.isArray(result.tasks) || result.tasks.length !== duration)
    fail("AI_INVALID_RESPONSE", 502, "AI phải trả đúng một công việc cho mỗi ngày điều trị.");
  const stages = result.tasks.map((task, index) => {
    if (task?.day !== index + 1 || typeof task.time !== "string" ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(task.time))
      fail("AI_INVALID_RESPONSE", 502, "Ngày hoặc giờ thực hiện do AI trả về không hợp lệ.");
    const instruction = text(task.instruction, "Hướng dẫn", 2000);
    const safety = typeof task.safety_note === "string" ? task.safety_note.trim() : "";
    return { order: index + 1, title: text(task.title, "Tên công việc", 150), time: task.time,
      start_day: index + 1, end_day: index + 1, instructions: [instruction],
      dosage_note: "", important_note: safety };
  });
  const safetyGuidelines = Array.isArray(result.safety_guidelines)
    ? [...new Set(result.safety_guidelines.map((item) => text(item, "Hướng dẫn an toàn", 2000)))] : [];
  if (!safetyGuidelines.length) fail("AI_INVALID_RESPONSE", 502, "AI chưa trả hướng dẫn an toàn.");
  return { protocol_name: text(result.protocol_name, "Tên phác đồ", 200),
    description: text(result.description, "Mô tả", 5000), duration_days: duration,
    stages, safety_guidelines: safetyGuidelines };
};

const extractDocument = async (buffer) => {
  let extracted;
  try { extracted = await mammoth.extractRawText({ buffer }); }
  catch { return fail("INVALID_TREATMENT_DOCUMENT", 400, "Không đọc được nội dung file DOCX."); }
  const value = extracted.value.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (value.length < 50 || value.length > 250000)
    fail("INVALID_TREATMENT_DOCUMENT", 422, "Nội dung DOCX phải có từ 50 đến 250.000 ký tự.");
  return value;
};

const generate = async ({ userId = null, input, file = null, generationSource, persist = true }) => {
  if (userId) v.id(userId, "user_id");
  const diseaseId = v.id(input.disease_id, "disease_id");
  const plantIds = parsePlantIds(input.plant_ids);
  const documentText = file ? await extractDocument(file.buffer) : "";
  const [disease, plants] = await Promise.all([
    Disease.findById(diseaseId).select("disease_name scientific_name typical_symptoms environmental_cause status").lean(),
    Plant.find({ _id: { $in: plantIds } }).select("common_name scientific_name care_requirements common_disease_ids is_published").lean(),
  ]);
  if (!disease || plants.length !== plantIds.length)
    fail("RESOURCE_NOT_FOUND", 404, "Không tìm thấy cây hoặc bệnh.");
  if (disease.status !== "active" || plants.some((plant) => !plant.is_published))
    fail("PROTOCOL_REFERENCE_INACTIVE", 409, "Chỉ tạo phác đồ cho cây và bệnh đang công khai.");
  if (plants.some((plant) => !plant.common_disease_ids?.some((id) => String(id) === diseaseId)))
    fail("PROTOCOL_PLANT_DISEASE_MISMATCH", 400, "Cây và bệnh chưa được liên kết.");
  const query = [disease.disease_name, disease.scientific_name,
    ...plants.flatMap((plant) => [plant.common_name, plant.scientific_name]),
    "điều trị lịch thời gian liều lượng an toàn"].filter(Boolean).join(" ");
  const selectedDocument = documentText ? relevantDiseaseSection(documentText, query) : "";
  const expectedSchedule = selectedDocument ? documentSchedule(selectedDocument) : null;
  const context = selectedDocument ? retrieve(selectedDocument, query) : "Không có tài liệu DOCX tham chiếu.";
  const maxTokens = Number(process.env.AI_TREATMENT_MAX_TOKENS || 5000);
  if (!Number.isInteger(maxTokens) || maxTokens < 2000 || maxTokens > 6000)
    fail("AI_NOT_CONFIGURED", 503, "Cấu hình AI phác đồ không hợp lệ.");
  const reply = await ai.complete([
    { role: "system", content: PROMPT },
    { role: "user", content: `CÂY VÀ BỆNH:\n${JSON.stringify({ disease, plants })}\n\n${documentText ? "CÁC ĐOẠN DOCX ƯU TIÊN" : "TÀI LIỆU THAM CHIẾU"}:\n${context}${expectedSchedule ? `\n\nLỊCH NGÀY/GIỜ BẮT BUỘC, KHÔNG ĐƯỢC THAY ĐỔI:\n${JSON.stringify(expectedSchedule)}` : ""}` },
  ], { maxTokens, timeoutMs: 60000 });
  const rawGenerated = parseJson(reply);
  if (expectedSchedule && Array.isArray(rawGenerated.tasks) &&
      rawGenerated.tasks.length === expectedSchedule.length) {
    rawGenerated.duration_days = expectedSchedule.length;
    rawGenerated.tasks.forEach((task, index) => {
      task.day = expectedSchedule[index].day;
      task.time = expectedSchedule[index].time;
    });
  }
  const generated = validateResult(rawGenerated);
  const referenceStatus = documentText ? "document_assisted" : "ai_unverified";
  const referenceNotice = documentText
    ? "Phác đồ được AI tạo với dữ liệu ưu tiên từ tài liệu DOCX; thông tin chỉ mang tính tham khảo."
    : "Phác đồ chưa được kiểm chứng; thông tin chỉ mang tính tham khảo.";
  const sourceDocument = { name: file?.originalname || "", extracted_characters: documentText.length,
    sha256: file ? crypto.createHash("sha256").update(file.buffer).digest("hex") : "" };
  if (!persist) return { ...generated, disease_id: diseaseId, plant_ids: plantIds,
    approved_instructions: [], status: "approved",
    instruction_source: documentText ? "imported" : "ai_unverified",
    reference_status: referenceStatus, reference_notice: referenceNotice,
    source_document: sourceDocument, generation_source: generationSource,
    ai_generation: { model: process.env.AI_MODEL || "", generated_at: new Date() }, version: 1 };
  const latest = await TreatmentProtocol.findOne({ disease_id: diseaseId,
    protocol_name: generated.protocol_name }).sort({ version: -1 }).select("version").lean();
  return TreatmentProtocol.create({ ...generated, disease_id: diseaseId, plant_ids: plantIds,
    approved_instructions: [], status: "approved",
    instruction_source: documentText ? "imported" : "ai_unverified",
    reference_status: referenceStatus, reference_notice: referenceNotice,
    source_document: sourceDocument,
    ai_generation: { model: process.env.AI_MODEL || "", generated_at: new Date() },
    generation_source: generationSource,
    version: (latest?.version || 0) + 1, created_by: userId || null,
    approved_by: userId || null, approved_at: new Date() });
};

const previewSecret = () => process.env.JWT_SECRET || "plantify_secret_key";

const createCustomerPreview = async (userId, input) => {
  v.id(userId, "user_id");
  const diseaseId = v.id(input.disease_id, "disease_id");
  const plantId = v.id(input.plant_id, "plant_id");
  const diagnosisId = input.diagnosis_id ? v.id(input.diagnosis_id, "diagnosis_id") : null;
  const plant = await Plant.findById(plantId).select("common_name is_published").lean();
  if (!plant?.is_published || !plant.common_name)
    fail("RESOURCE_NOT_FOUND", 404, "Không tìm thấy cây đang công khai.");
  const filename = `${slugifyVietnamese(plant.common_name)}.docx`;
  let file = null;
  try { file = { buffer: await fs.readFile(path.join(TEMPLATE_DIRECTORY, filename)), originalname: filename }; }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const protocol = await generate({ input: { disease_id: diseaseId, plant_ids: [plantId] }, file,
    generationSource: file ? "bundled_document" : "ai_only", persist: false });
  const token = jwt.sign({ type: "treatment_preview", user_id: userId, disease_id: diseaseId,
    plant_id: plantId, diagnosis_id: diagnosisId, protocol }, previewSecret(), { expiresIn: "30m" });
  return { protocol: { ...protocol, _id: "preview" }, preview_token: token, expires_in_seconds: 1800 };
};

const verifyCustomerPreview = (token, userId) => {
  if (typeof token !== "string" || !token.trim())
    fail("TREATMENT_PREVIEW_REQUIRED", 400, "Cần tạo bản xem trước phác đồ trước khi tạo lịch.");
  let payload;
  try { payload = jwt.verify(token, previewSecret()); }
  catch { return fail("TREATMENT_PREVIEW_EXPIRED", 409, "Bản xem trước đã hết hạn; vui lòng tạo phác đồ mới."); }
  if (payload.type !== "treatment_preview" || String(payload.user_id) !== String(userId))
    fail("TREATMENT_PREVIEW_INVALID", 403, "Bản xem trước phác đồ không hợp lệ.");
  return payload;
};

const slugifyVietnamese = (value) => String(value).trim().toLowerCase()
  .replace(/đ/g, "d").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const generateFromDocument = async (userId, input, file) => {
  const plantIds = parsePlantIds(input.plant_ids);
  const created = await generate({ userId, input: { ...input, plant_ids: plantIds }, file,
    generationSource: file ? "manager_document" : "ai_only" });
  await TreatmentProtocol.updateMany({
    disease_id: created.disease_id,
    plant_ids: { $all: plantIds, $size: plantIds.length },
    status: "approved",
    _id: { $ne: created._id },
  }, { $set: { status: "deprecated" } });
  return created;
};

const generateFromBundledDocument = async (diseaseId, plantId) => {
  const key = `${diseaseId}:${plantId}`;
  if (pendingBundledGenerations.has(key)) return pendingBundledGenerations.get(key);
  const operation = (async () => {
    const plant = await Plant.findById(plantId).select("common_name is_published").lean();
    if (!plant?.is_published || !plant.common_name) return null;
    const filename = `${slugifyVietnamese(plant.common_name)}.docx`;
    let buffer;
    try { buffer = await fs.readFile(path.join(TEMPLATE_DIRECTORY, filename)); }
    catch (error) {
      if (error.code === "ENOENT") {
        const existing = await TreatmentProtocol.findOne({ disease_id: diseaseId,
          plant_ids: plantId, status: "approved" }).select("_id").lean();
        return existing || generate({ input: { disease_id: diseaseId, plant_ids: [plantId] },
          generationSource: "ai_only" });
      }
      throw error;
    }
    const fingerprint = crypto.createHash("sha256").update(buffer).digest("hex");
    const existing = await TreatmentProtocol.findOne({ disease_id: diseaseId,
      plant_ids: plantId, status: "approved" }).sort({ created_at: -1 })
      .select("_id source_document.sha256").lean();
    if (existing?.source_document?.sha256 === fingerprint) return existing;
    const created = await generate({ input: { disease_id: diseaseId, plant_ids: [plantId] },
      file: { buffer, originalname: filename }, generationSource: "bundled_document" });
    await TreatmentProtocol.updateMany({ disease_id: diseaseId, plant_ids: plantId,
      status: "approved", _id: { $ne: created._id } }, { $set: { status: "deprecated" } });
    return created;
  })().finally(() => pendingBundledGenerations.delete(key));
  pendingBundledGenerations.set(key, operation);
  return operation;
};

module.exports = { generateFromDocument, generateFromBundledDocument,
  createCustomerPreview, verifyCustomerPreview,
  _private: { chunkDocument, retrieve, parseJson, validateResult, parsePlantIds,
    slugifyVietnamese, extractDocument, relevantDiseaseSection, documentSchedule } };
