const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const ai = require("../integrations/ai/ai.service");
const v = require("../validators/common");
const { isTime } = require("./careRecurrence");
const { assertTreatmentCandidate, validateCandidateRank } = require("./diagnosis.service");

const pendingBundledGenerations = new Map();
const bundledTimes = new Map();
const TIMING_TIMEOUT_MS = 8000;

const PROMPT = `Bạn tạo phác đồ điều trị cây bằng tiếng Việt. Ưu tiên tuyệt đối dữ liệu trong các đoạn DOCX được cung cấp và thông tin cây, bệnh đi kèm. Khi tài liệu thiếu chi tiết, chỉ được bổ sung kiến thức chăm sóc cây phổ biến, an toàn; không bịa tên thuốc thương mại, hoạt chất, nồng độ, liều hóa chất, lượng nước hoặc khẳng định chắc chắn hiệu quả.

Trả duy nhất JSON hợp lệ, không Markdown, theo đúng cấu trúc: {"protocol_name":"...","description":"...","duration_days":1,"tasks":[{"day":1,"time":"HH:mm","title":"...","instruction":"Bước 1: ...\\nBước 2: ...\\nTưới nước: 0ml\\nPhân bón: 0g\\nKết quả cần đạt: ...","dosage_note":"","safety_note":"..."}],"safety_guidelines":["..."]}.

duration_days từ 1 đến 60. tasks có đúng một công việc cho từng ngày từ 1 đến duration_days, sắp theo ngày. Mỗi công việc có ít nhất hai bước khác nhau, đánh số liên tiếp. Viết mỗi mục trên một dòng riêng bằng ký tự xuống dòng \\n trong JSON. Trình bày theo thứ tự: "Chuẩn bị:" nếu cần, "Bước 1:", "Bước 2:" và các bước tiếp theo nếu cần, "Tưới nước:", "Phân bón:", "Dụng cụ:" nếu cần, "Kết quả cần đạt:". Mỗi bước là một hành động ngắn. Kết quả cần đạt là một câu ngắn mô tả dấu hiệu quan sát hoặc đo được. safety_note là lưu ý riêng cho ngày đó, tối đa một câu ngắn. Đặt hướng dẫn an toàn đầy đủ trong safety_guidelines.

Tưới nước: Ghi đúng "0ml" nếu công việc không cần tưới. Nếu DOCX có liều, chỉ ghi lượng và đơn vị sát số, kèm phạm vi áp dụng nếu cần. Giữ mẫu số như /chậu/lần hoặc /m²/tuần. Nếu cần kiểm tra trước khi tưới và tài liệu không có số, ghi "Theo độ ẩm đất" và đưa cách kiểm tra vào các bước. Khi lượng phụ thuộc điều kiện, có thể ghi điều kiện ngắn trong ngoặc, ví dụ "0ml (đất đủ ẩm)".

Phân bón: Ghi "0g" nếu không bón. Nếu có chỉ định trong DOCX, ghi ngắn loại phân và liều kèm đơn vị sát số. Nếu chỉ có loại phân, ghi "theo nhãn" kèm loại. Đưa điều kiện bón hoặc tránh bón vào bước thực hiện khi cần. Không thêm phân để thay thế biện pháp xử lý bệnh.

Khi cắt tỉa, vệ sinh, cách ly, thay đất hoặc xử lý lá, ghi bộ phận, dụng cụ và cách khử khuẩn, thu gom phù hợp. Với công việc có dùng thuốc, chép nguyên liều pha và nồng độ từ DOCX vào dosage_note. Nếu tài liệu chưa cung cấp, dùng theo nhãn và không tự tạo con số. Để trống dosage_note ở các ngày không dùng thuốc.

Giữ nguyên tần suất, khoảng cách giữa các lần xử lý, liều lượng và thời lượng được nêu trong DOCX. Nếu ngày đó chưa đến kỳ xử lý, chỉ đặt công việc kiểm tra hoặc ghi nhận. Tự chọn giờ thực hiện phù hợp cho từng công việc theo giờ Việt Nam, dạng HH:mm. Chỉ dùng giờ đồng hồ trong trường time và bỏ qua giờ cụ thể trong tài liệu cũ. Nội dung cần cụ thể, ngắn gọn, an toàn và không mâu thuẫn giữa các ngày.`;

const {
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
} = require("./treatment-ai-content.service");

function timeBundledPlan(plan) {
  const input = JSON.stringify({
    name: plan.protocol_name,
    guidance: plan.timing_guidance,
    tasks: plan.tasks.map(({ day, title, method }) => ({ day, title, method })),
  });
  const cached = bundledTimes.get(input);
  if (cached && cached.expiresAt > Date.now()) return cached.request;
  if (cached) bundledTimes.delete(input);
  if (bundledTimes.size >= 64) bundledTimes.delete(bundledTimes.keys().next().value);

  const entry = { expiresAt: Infinity };
  entry.request = (async () => {
    try {
      const reply = await ai.complete([
        {
          role: "system",
          content: 'Chọn giờ Việt Nam phù hợp cho mỗi công việc theo thứ tự. Tuân thủ buổi được nêu trong hướng dẫn. Chỉ trả JSON {"times":["HH:mm"]}, đúng một giờ mỗi ngày.',
        },
        { role: "user", content: input },
      ], { maxTokens: 60 + plan.duration_days * 12, timeoutMs: TIMING_TIMEOUT_MS });
      const { times } = parseJson(reply, "khung giờ điều trị");
      if (Array.isArray(times) && times.length === plan.duration_days && times.every(isTime)) {
        entry.expiresAt = Date.now() + 5 * 60 * 1000;
        return { times, usedAi: true };
      }
    } catch (error) {
      if (![
        "AI_TIMEOUT", "AI_NOT_CONFIGURED", "AI_BUSY", "AI_UNAVAILABLE",
        "AI_INVALID_RESPONSE", "AI_INCOMPLETE_RESPONSE",
      ].includes(error.code)) throw error;
    }
    const times = plan.tasks.map(({ method }) => {
      if (/chiều mát|buổi chiều/iu.test(method)) return "16:30";
      if (/sáng sớm|buổi sáng/iu.test(method)) return "07:00";
      return "08:00";
    });
    entry.expiresAt = Date.now() + 60 * 1000;
    return { times, usedAi: false };
  })().catch((error) => {
    if (bundledTimes.get(input) === entry) bundledTimes.delete(input);
    throw error;
  });
  bundledTimes.set(input, entry);
  return entry.request;
}

const generate = async ({
  userId = null,
  input,
  file = null,
  generationSource,
  persist = true,
}) => {
  if (userId) v.id(userId, "user_id");
  const diseaseId = v.id(input.disease_id, "disease_id");
  const plantIds = parsePlantIds(input.plant_ids);
  const documentText = file ? await extractDocument(file.buffer) : "";
  const [disease, plants] = await Promise.all([
    Disease.findById(diseaseId)
      .select(
        "disease_name scientific_name typical_symptoms environmental_cause status",
      )
      .lean(),
    Plant.find({ _id: { $in: plantIds } })
      .select(
        "common_name scientific_name care_requirements common_disease_ids is_published",
      )
      .lean(),
  ]);
  if (!disease || plants.length !== plantIds.length)
    fail("RESOURCE_NOT_FOUND", 404, "Không tìm thấy cây hoặc bệnh.");
  if (
    disease.status !== "active" ||
    plants.some((plant) => !plant.is_published)
  )
    fail(
      "PROTOCOL_REFERENCE_INACTIVE",
      409,
      "Chỉ tạo phác đồ cho cây và bệnh đang công khai.",
    );
  if (
    plants.some(
      (plant) =>
        !plant.common_disease_ids?.some((id) => String(id) === diseaseId),
    )
  )
    fail(
      "PROTOCOL_PLANT_DISEASE_MISMATCH",
      400,
      "Cây và bệnh chưa được liên kết.",
    );
  const query = [
    disease.disease_name,
    disease.scientific_name,
    ...plants.flatMap((plant) => [plant.common_name, plant.scientific_name]),
    "điều trị tần suất liều lượng an toàn",
  ]
    .filter(Boolean)
    .join(" ");
  const bundledPreview = !persist && generationSource === "bundled_document";
  const selectedDocument = bundledPreview
    ? findBundledDiseaseSection(
      documentText,
      [disease.disease_name, disease.scientific_name],
      plants[0].common_name,
    )
    : relevantDiseaseSection(documentText, query);
  const plan = bundledPreview && readBundledPlan(selectedDocument, disease.disease_name);
  const expectedDuration = documentDuration(selectedDocument);
  let generated;
  let usedAi = true;
  let referenceNotice;
  if (plan) {
    const timing = await timeBundledPlan(plan);
    usedAi = timing.usedAi;
    generated = validateResult({
      ...plan,
      tasks: plan.tasks.map((task, index) => ({ ...task, time: timing.times[index] })),
    }, expectedDuration);
    referenceNotice = usedAi
      ? "Phác đồ dựa trên tài liệu tham khảo từ hệ thống. AI đề xuất giờ thực hiện theo giờ Việt Nam."
      : "Phác đồ dựa trên tài liệu tham khảo từ hệ thống. Giờ thực hiện dùng khung giờ Việt Nam.";
  } else {
    const context = selectedDocument
      ? retrieve(withoutScheduleTimes(selectedDocument), query)
      : "Không có tài liệu DOCX tham chiếu.";
    const tokenLimit = Number(process.env.AI_TREATMENT_MAX_TOKENS || 5000);
    if (!Number.isInteger(tokenLimit) || tokenLimit < 2000 || tokenLimit > 6000)
      fail("AI_NOT_CONFIGURED", 503, "Cấu hình AI phác đồ không hợp lệ.");
    const shortPreview = !persist && !selectedDocument;
    const reply = await ai.complete(
      [
        {
          role: "system",
          content: shortPreview
            ? PROMPT + "\nVới bản xem trước thiếu tài liệu phù hợp, đề xuất 3 đến 7 ngày theo dõi ban đầu, đúng hai bước ngắn mỗi ngày."
            : PROMPT,
        },
        {
          role: "user",
          content: `CÂY VÀ BỆNH:\n${JSON.stringify({ disease, plants })}\n\n${selectedDocument ? "CÁC ĐOẠN DOCX ƯU TIÊN" : "TÀI LIỆU THAM CHIẾU"}:\n${context}${expectedDuration ? `\n\nTHỜI LƯỢNG TỪ DOCX: ${expectedDuration} ngày.` : ""}`,
        },
      ],
      { maxTokens: shortPreview ? Math.min(tokenLimit, 2400) : tokenLimit, timeoutMs: 60000 },
    );
    generated = validateResult(parseJson(reply), expectedDuration);
    referenceNotice = selectedDocument
      ? bundledPreview
        ? "AI tạo phác đồ dựa trên tài liệu tham khảo từ hệ thống."
        : "AI tạo phác đồ dựa trên tài liệu tham khảo đã tải lên."
      : "Phác đồ chưa được kiểm chứng; thông tin chỉ mang tính tham khảo.";
  }
  const referenceStatus = selectedDocument ? "document_assisted" : "ai_unverified";
  const sourceDocument = {
    name: selectedDocument ? file.originalname : "",
    extracted_characters: selectedDocument ? documentText.length : 0,
    sha256: selectedDocument
      ? crypto.createHash("sha256").update(file.buffer).digest("hex")
      : "",
  };
  if (!persist)
    return {
      ...generated,
      disease_id: diseaseId,
      plant_ids: plantIds,
      approved_instructions: [],
      status: "approved",
      instruction_source: selectedDocument ? "imported" : "ai_unverified",
      reference_status: referenceStatus,
      reference_notice: referenceNotice,
      source_document: sourceDocument,
      generation_source: selectedDocument ? generationSource : "ai_only",
      ai_generation: {
        model: usedAi ? process.env.AI_MODEL || "" : "",
        generated_at: usedAi ? new Date() : null,
      },
      version: 1,
    };
  const latest = await TreatmentProtocol.findOne({
    disease_id: diseaseId,
    protocol_name: generated.protocol_name,
  })
    .sort({ version: -1 })
    .select("version")
    .lean();
  return TreatmentProtocol.create({
    ...generated,
    disease_id: diseaseId,
    plant_ids: plantIds,
    approved_instructions: [],
    status: "approved",
    instruction_source: documentText ? "imported" : "ai_unverified",
    reference_status: referenceStatus,
    reference_notice: referenceNotice,
    source_document: sourceDocument,
    ai_generation: {
      model: process.env.AI_MODEL || "",
      generated_at: new Date(),
    },
    generation_source: generationSource,
    version: (latest?.version || 0) + 1,
    created_by: userId || null,
    approved_by: userId || null,
    approved_at: new Date(),
  });
};

const previewSecret = () => process.env.JWT_SECRET || "plantify_secret_key";

const createCustomerPreview = async (userId, input) => {
  v.id(userId, "user_id");
  const diseaseId = v.id(input.disease_id, "disease_id");
  const plantId = v.id(input.plant_id, "plant_id");
  const diagnosisId = input.diagnosis_id
    ? v.id(input.diagnosis_id, "diagnosis_id")
    : null;
  const rank = validateCandidateRank(input.candidate_rank);
  if (rank !== undefined && !diagnosisId) v.invalid("diagnosis_id");
  await assertTreatmentCandidate(diagnosisId, userId, plantId, diseaseId, null, rank);
  const plant = await Plant.findById(plantId)
    .select("common_name is_published")
    .lean();
  if (!plant?.is_published || !plant.common_name)
    fail("RESOURCE_NOT_FOUND", 404, "Không tìm thấy cây đang công khai.");
  const file = await readPlantDocument(plant.common_name);
  const protocol = await generate({
    input: { disease_id: diseaseId, plant_ids: [plantId] },
    file,
    generationSource: file ? "bundled_document" : "ai_only",
    persist: false,
  });
  const token = jwt.sign(
    {
      type: "treatment_preview",
      user_id: userId,
      disease_id: diseaseId,
      plant_id: plantId,
      diagnosis_id: diagnosisId,
      candidate_rank: rank,
      protocol,
    },
    previewSecret(),
    { expiresIn: "30m" },
  );
  return {
    protocol: { ...protocol, _id: "preview" },
    preview_token: token,
    expires_in_seconds: 1800,
  };
};

const verifyCustomerPreview = (token, userId) => {
  if (typeof token !== "string" || !token.trim())
    fail(
      "TREATMENT_PREVIEW_REQUIRED",
      400,
      "Cần tạo bản xem trước phác đồ trước khi tạo lịch.",
    );
  let payload;
  try {
    payload = jwt.verify(token, previewSecret());
  } catch {
    return fail(
      "TREATMENT_PREVIEW_EXPIRED",
      409,
      "Bản xem trước đã hết hạn; vui lòng tạo phác đồ mới.",
    );
  }
  if (
    payload.type !== "treatment_preview" ||
    String(payload.user_id) !== String(userId)
  )
    fail(
      "TREATMENT_PREVIEW_INVALID",
      403,
      "Bản xem trước phác đồ không hợp lệ.",
    );
  return payload;
};

const generateFromDocument = async (userId, input, file) => {
  const plantIds = parsePlantIds(input.plant_ids);
  const created = await generate({
    userId,
    input: { ...input, plant_ids: plantIds },
    file,
    generationSource: file ? "manager_document" : "ai_only",
  });
  await TreatmentProtocol.updateMany(
    {
      disease_id: created.disease_id,
      plant_ids: { $all: plantIds, $size: plantIds.length },
      status: "approved",
      _id: { $ne: created._id },
    },
    { $set: { status: "deprecated" } },
  );
  return created;
};

const generateFromBundledDocument = async (diseaseId, plantId) => {
  const key = `${diseaseId}:${plantId}`;
  if (pendingBundledGenerations.has(key))
    return pendingBundledGenerations.get(key);
  const operation = (async () => {
    const plant = await Plant.findById(plantId)
      .select("common_name is_published")
      .lean();
    if (!plant?.is_published || !plant.common_name) return null;
    const file = await readPlantDocument(plant.common_name);
    if (!file) {
      const existing = await TreatmentProtocol.findOne({
        disease_id: diseaseId,
        plant_ids: plantId,
        status: "approved",
      })
        .select("_id")
        .lean();
      return (
        existing ||
        generate({
          input: { disease_id: diseaseId, plant_ids: [plantId] },
          generationSource: "ai_only",
        })
      );
    }
    const fingerprint = crypto
      .createHash("sha256")
      .update(file.buffer)
      .digest("hex");
    const existing = await TreatmentProtocol.findOne({
      disease_id: diseaseId,
      plant_ids: plantId,
      status: "approved",
    })
      .sort({ created_at: -1 })
      .select("_id source_document.sha256")
      .lean();
    if (existing?.source_document?.sha256 === fingerprint) return existing;
    const created = await generate({
      input: { disease_id: diseaseId, plant_ids: [plantId] },
      file,
      generationSource: "bundled_document",
    });
    await TreatmentProtocol.updateMany(
      {
        disease_id: diseaseId,
        plant_ids: plantId,
        status: "approved",
        _id: { $ne: created._id },
      },
      { $set: { status: "deprecated" } },
    );
    return created;
  })().finally(() => pendingBundledGenerations.delete(key));
  pendingBundledGenerations.set(key, operation);
  return operation;
};

module.exports = {
  generateFromDocument,
  generateFromBundledDocument,
  createCustomerPreview,
  verifyCustomerPreview,
  _private: {
    chunkDocument,
    retrieve,
    parseJson,
    validateResult,
    parsePlantIds,
    slugifyVietnamese,
    extractDocument,
    relevantDiseaseSection,
  },
};
