const AppError = require("../utils/app-error");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const ai = require("../integrations/ai/ai.service");
const validate = require("../validators/treatment.validator");

const PROMPT = `Chỉ dùng SOURCE để tạo phác đồ điều trị đúng 14 ngày. Không dùng kiến thức ngoài SOURCE và không tự tạo giờ, số lượng, đơn vị, dụng cụ, thuốc hay tần suất. Trả JSON thật ngắn, không Markdown. Nếu thiếu dữ liệu trả {"missing_information":["..."]}. Dùng patterns để không lặp nội dung: {"protocol_name":"...","description":"...","patterns":[{"days":[1,2,3],"title":"...","tasks":[{"time":"07:00","amount":250,"unit":"ml","instruction":"...","tools":["ca đong"],"source_quote":"đoạn nguyên văn trong SOURCE"}]}],"safety_guidelines":[{"text":"...","source_quote":"đoạn nguyên văn"}],"missing_information":[]}. patterns phải bao phủ mỗi ngày 1–14 đúng một lần. Mỗi source_quote phải chứa trực tiếp giờ, số lượng, đơn vị và dụng cụ tương ứng.`;
const normalize = (value) => String(value).normalize("NFC").replace(/\s+/g, " ").trim();
const grounded = (source, quote) => normalize(quote).length >= 3 && normalize(source).includes(normalize(quote));
const numbersGrounded = (value, quote) => {
  const allowed = new Set(normalize(quote).match(/\d+(?:[.,]\d+)?/g) || []);
  return (normalize(value).match(/\d+(?:[.,]\d+)?/g) || []).every((number) => allowed.has(number));
};
const fail = (code, status, message) => { throw new AppError(code, status, message); };
const requiredText = (value, name, max = 2000) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    fail("AI_INVALID_RESPONSE", 502, `${name} do AI trả về không hợp lệ.`);
  return value.trim();
};
const parse = (reply) => {
  const raw = reply.trim();
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first < 0 || last <= first)
    return fail("AI_INVALID_RESPONSE", 502, "AI trả về phác đồ không đúng JSON.");
  try { return JSON.parse(raw.slice(first, last + 1)); }
  catch { return fail("AI_INVALID_RESPONSE", 502, "AI trả về phác đồ không đúng JSON."); }
};

const validateResult = (result, source) => {
  if (Array.isArray(result?.missing_information) && result.missing_information.length)
    fail("AI_REFERENCE_INCOMPLETE", 422, "Dữ liệu nguồn chưa đủ để tạo phác đồ.");
  if (!Array.isArray(result?.days) && Array.isArray(result?.patterns)) {
    result.days = result.patterns.flatMap((pattern) =>
      Array.isArray(pattern?.days)
        ? pattern.days.map((day) => ({ day, title: pattern.title, tasks: pattern.tasks }))
        : [],
    ).sort((left, right) => left.day - right.day);
  }
  if (!Array.isArray(result?.days) || result.days.length !== 14)
    fail("AI_INVALID_RESPONSE", 502, "AI phải trả đủ đúng 14 ngày.");
  const stages = result.days.map((day, index) => {
    if (day?.day !== index + 1 || !Array.isArray(day.tasks) || !day.tasks.length)
      fail("AI_INVALID_RESPONSE", 502, "Ngày hoặc công việc không đầy đủ.");
    const instructions = day.tasks.map((task) => {
      const time = requiredText(task?.time, "Giờ", 5);
      const quote = requiredText(task?.source_quote, "Nguồn");
      const instruction = requiredText(task?.instruction, "Hướng dẫn");
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !grounded(source, quote) || !normalize(quote).includes(time) || !numbersGrounded(instruction, quote))
        fail("AI_UNGROUNDED_RESPONSE", 422, "AI đã tạo giờ hoặc số liệu ngoài nguồn.");
      let measure = "";
      if (task.amount !== null || task.unit !== null) {
        if (typeof task.amount !== "number" || !Number.isFinite(task.amount) || task.amount <= 0)
          fail("AI_INVALID_RESPONSE", 502, "Định lượng không hợp lệ.");
        const unit = requiredText(task.unit, "Đơn vị", 30);
        if (!normalize(quote).includes(String(task.amount)) || !normalize(quote).toLowerCase().includes(unit.toLowerCase()))
          fail("AI_UNGROUNDED_RESPONSE", 422, "Định lượng không có trong nguồn.");
        measure = ` — ${task.amount} ${unit}`;
      }
      const tools = Array.isArray(task.tools) ? task.tools.map((tool) => requiredText(tool, "Dụng cụ", 100)) : [];
      if (tools.some((tool) => !normalize(quote).toLowerCase().includes(tool.toLowerCase())))
        fail("AI_UNGROUNDED_RESPONSE", 422, "Dụng cụ không có trong nguồn.");
      return `${time}${measure}: ${instruction}${tools.length ? ` Dụng cụ: ${tools.join(", ")}.` : ""}`;
    });
    return { order: index + 1, title: requiredText(day.title, "Tiêu đề", 150), start_day: index + 1,
      end_day: index + 1, instructions, dosage_note: "", important_note: "" };
  });
  const safety = (result.safety_guidelines || []).map((item) => {
    const quote = requiredText(item?.source_quote, "Nguồn an toàn");
    const value = requiredText(item?.text, "Hướng dẫn an toàn");
    if (!grounded(source, quote) || !numbersGrounded(value, quote))
      fail("AI_UNGROUNDED_RESPONSE", 422, "Hướng dẫn an toàn ngoài nguồn.");
    return value;
  });
  if (!safety.length) fail("AI_REFERENCE_INCOMPLETE", 422, "Nguồn thiếu hướng dẫn an toàn.");
  return { protocol_name: requiredText(result.protocol_name, "Tên", 200), description: requiredText(result.description, "Mô tả", 5000), duration_days: 14, stages, safety_guidelines: [...new Set(safety)] };
};

const generateDraft = async (userId, input) => {
  const data = validate.aiDraft(input);
  const [disease, plants] = await Promise.all([
    Disease.findById(data.disease_id).select("disease_name scientific_name typical_symptoms environmental_cause treatment_protocol status").lean(),
    Plant.find({ _id: { $in: data.plant_ids } }).select("common_name scientific_name care_requirements common_disease_ids is_published").lean(),
  ]);
  if (!disease || plants.length !== data.plant_ids.length) fail("RESOURCE_NOT_FOUND", 404, "Không tìm thấy cây hoặc bệnh.");
  if (plants.some((plant) => !plant.common_disease_ids?.some((id) => String(id) === String(disease._id))))
    fail("PROTOCOL_PLANT_DISEASE_MISMATCH", 400, "Cây và bệnh chưa được liên kết.");
  const source = `DỮ LIỆU MANAGER:\n${data.reference_material}\nDỮ LIỆU DANH MỤC:\n${JSON.stringify({ disease, plants })}`;
  const maxTokens = Number(process.env.AI_TREATMENT_MAX_TOKENS || 5000);
  if (!Number.isInteger(maxTokens) || maxTokens < 2000 || maxTokens > 6000) fail("AI_NOT_CONFIGURED", 503, "Cấu hình AI phác đồ không hợp lệ.");
  const reply = await ai.complete([{ role: "system", content: PROMPT }, { role: "user", content: `SOURCE BEGIN\n${source}\nSOURCE END` }], { maxTokens, timeoutMs: 60000 });
  const generated = validateResult(parse(reply), source);
  const latest = await TreatmentProtocol.findOne({ disease_id: data.disease_id, protocol_name: generated.protocol_name }).sort({ version: -1 }).select("version").lean();
  return TreatmentProtocol.create({ ...generated, disease_id: data.disease_id, plant_ids: data.plant_ids,
    approved_instructions: [], status: "draft", instruction_source: "ai_unverified",
    reference_material: data.reference_material, ai_generation: { model: process.env.AI_MODEL || "", generated_at: new Date() },
    version: (latest?.version || 0) + 1, created_by: userId });
};

module.exports = { generateDraft, _private: { parse, validateResult, grounded, numbersGrounded } };
