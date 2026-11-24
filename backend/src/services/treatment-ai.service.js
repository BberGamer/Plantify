const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const ai = require("../integrations/ai/ai.service");
const v = require("../validators/common");

const TEMPLATE_DIRECTORY = path.resolve(
  __dirname,
  "../../data/treatment-templates",
);
const pendingBundledGenerations = new Map();

const PROMPT = `Bạn tạo phác đồ điều trị cây bằng tiếng Việt. Ưu tiên tuyệt đối dữ liệu trong các đoạn DOCX được cung cấp và thông tin cây, bệnh đi kèm. Khi tài liệu thiếu chi tiết, chỉ được bổ sung kiến thức chăm sóc cây phổ biến, an toàn; không bịa tên thuốc thương mại, hoạt chất, nồng độ, liều hóa chất, lượng nước hoặc khẳng định chắc chắn hiệu quả.

Trả duy nhất JSON hợp lệ, không Markdown, theo đúng cấu trúc: {"protocol_name":"...","description":"...","duration_days":7,"tasks":[{"day":1,"time":"05:45","title":"...","instruction":"Chuẩn bị: ...\\nBước 1: ...\\nBước 2: ...\\nLượng nước: ...\\nDụng cụ: ...\\n=> Kết quả cần đạt: ...","safety_note":"..."},{"day":2,"time":"09:30","title":"...","instruction":"...","safety_note":"..."}],"safety_guidelines":["..."]}.

duration_days từ 1 đến 60. tasks phải có đúng một công việc cho từng ngày từ 1 đến duration_days và sắp xếp theo ngày. Mỗi instruction phải là hướng dẫn có thể thực hiện ngay trong ngày đó. Mỗi mục phải nằm trên một dòng riêng bằng ký tự xuống dòng \\n trong chuỗi JSON, không nối các bước bằng dấu chấm phẩy. Trình bày đúng thứ tự: "Chuẩn bị:", từng dòng "Bước 1:", "Bước 2:"..., "Lượng nước:", "Dụng cụ:", rồi kết thúc bằng "=> Kết quả cần đạt:". Nếu một mục không áp dụng, ghi ngắn gọn "Không cần" thay vì bỏ mục. Mỗi bước chỉ viết một hành động ngắn, trực tiếp, dễ thực hiện; ưu tiên động từ như kiểm tra, cắt, lau, tưới, cách ly hoặc thu gom. Dùng số cụ thể về ml, cm, phút, số lá hoặc số lần khi DOCX hay dữ liệu cây cung cấp đủ căn cứ. Không dùng câu chung chung như "chăm sóc cây", "tưới vừa đủ" hoặc "theo dõi thêm" nếu có thể mô tả thao tác cụ thể. Dòng "=> Kết quả cần đạt:" phải mô tả dấu hiệu người dùng có thể quan sát hoặc đo được ngay sau khi hoàn thành công việc.

Nếu công việc có tưới nước và dữ liệu cung cấp đủ căn cứ, phải ghi rõ lượng nước bằng ml cho mỗi cây hoặc mỗi chậu, cách tưới, vị trí tưới và dấu hiệu cần kiểm tra trước khi tưới. Nếu dữ liệu không đủ để xác định lượng nước an toàn, không tự đoán số ml; phải hướng dẫn kiểm tra độ ẩm đất và ghi rõ tiêu chí dừng tưới. Không mặc định ngày nào cũng tưới. Nếu ngày đó không cần tưới, ghi rõ "Không tưới nước" và lý do trong instruction.

Nếu cần cắt tỉa, vệ sinh, cách ly, thay đất hoặc xử lý bề mặt lá, phải ghi rõ bộ phận cần xử lý, dụng cụ, cách khử khuẩn và cách thu gom phần bệnh. Chỉ nêu liều pha, nồng độ hoặc hoạt chất khi có trong DOCX; nếu tài liệu không cung cấp thì yêu cầu tuân theo nhãn sản phẩm và không tự tạo con số. Dụng cụ phải được liệt kê ngay trong instruction theo dạng "Dụng cụ: ...".

Các giờ trong ví dụ chỉ minh họa. Nếu DOCX cung cấp lịch thì phải giữ nguyên ngày và giờ của từng ngày, không được quy tất cả về một giờ. time phải có dạng HH:mm theo giờ Việt Nam. Nội dung cần cụ thể, ngắn gọn, an toàn và không mâu thuẫn giữa các ngày.`;

const {
  fail,
  chunkDocument,
  retrieve,
  parseJson,
  validateResult,
  parsePlantIds,
  extractDocument,
  relevantDiseaseSection,
  documentSchedule,
} = require("./treatment-ai-content.service");

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
    "điều trị lịch thời gian liều lượng an toàn",
  ]
    .filter(Boolean)
    .join(" ");
  const selectedDocument = documentText
    ? relevantDiseaseSection(documentText, query)
    : "";
  const expectedSchedule = selectedDocument
    ? documentSchedule(selectedDocument)
    : null;
  const context = selectedDocument
    ? retrieve(selectedDocument, query)
    : "Không có tài liệu DOCX tham chiếu.";
  const maxTokens = Number(process.env.AI_TREATMENT_MAX_TOKENS || 5000);
  if (!Number.isInteger(maxTokens) || maxTokens < 2000 || maxTokens > 6000)
    fail("AI_NOT_CONFIGURED", 503, "Cấu hình AI phác đồ không hợp lệ.");
  const reply = await ai.complete(
    [
      { role: "system", content: PROMPT },
      {
        role: "user",
        content: `CÂY VÀ BỆNH:\n${JSON.stringify({ disease, plants })}\n\n${documentText ? "CÁC ĐOẠN DOCX ƯU TIÊN" : "TÀI LIỆU THAM CHIẾU"}:\n${context}${expectedSchedule ? `\n\nLỊCH NGÀY/GIỜ BẮT BUỘC, KHÔNG ĐƯỢC THAY ĐỔI:\n${JSON.stringify(expectedSchedule)}` : ""}`,
      },
    ],
    { maxTokens, timeoutMs: 60000 },
  );
  const rawGenerated = parseJson(reply);
  if (
    expectedSchedule &&
    Array.isArray(rawGenerated.tasks) &&
    rawGenerated.tasks.length === expectedSchedule.length
  ) {
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
  const sourceDocument = {
    name: file?.originalname || "",
    extracted_characters: documentText.length,
    sha256: file
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
      instruction_source: documentText ? "imported" : "ai_unverified",
      reference_status: referenceStatus,
      reference_notice: referenceNotice,
      source_document: sourceDocument,
      generation_source: generationSource,
      ai_generation: {
        model: process.env.AI_MODEL || "",
        generated_at: new Date(),
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
  const plant = await Plant.findById(plantId)
    .select("common_name is_published")
    .lean();
  if (!plant?.is_published || !plant.common_name)
    fail("RESOURCE_NOT_FOUND", 404, "Không tìm thấy cây đang công khai.");
  const filename = `${slugifyVietnamese(plant.common_name)}.docx`;
  let file = null;
  try {
    file = {
      buffer: await fs.readFile(path.join(TEMPLATE_DIRECTORY, filename)),
      originalname: filename,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
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

const slugifyVietnamese = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
    const filename = `${slugifyVietnamese(plant.common_name)}.docx`;
    let buffer;
    try {
      buffer = await fs.readFile(path.join(TEMPLATE_DIRECTORY, filename));
    } catch (error) {
      if (error.code === "ENOENT") {
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
      throw error;
    }
    const fingerprint = crypto
      .createHash("sha256")
      .update(buffer)
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
      file: { buffer, originalname: filename },
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
    documentSchedule,
  },
};
