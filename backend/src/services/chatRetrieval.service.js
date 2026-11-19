const { createHash } = require("node:crypto");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const TreatmentProtocol = require("../models/treatmentProtocol.model");
const AppError = require("../utils/app-error");

const normalize = (value) => String(value || "").normalize("NFD")
  .replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const stop = new Set("toi ban minh cho hoi la va cua co thi nhu the nao gi voi ve mot nhung duoc hay khong nen can cay trong".split(" "));
const tokens = (text) => normalize(text).split(" ").filter((word) => word && !stop.has(word));
const hash = (text) => createHash("sha256").update(text).digest("hex");
const textOf = (value) => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join("; ");
  if (value && typeof value === "object") return Object.entries(value)
    .map(([key, item]) => `${key}: ${textOf(item)}`).join("; ");
  return "";
};
const careLabels = { water: "Tưới nước", watering: "Tưới nước", light: "Ánh sáng", sunlight: "Ánh sáng",
  humidity: "Độ ẩm", temperature: "Nhiệt độ", soil: "Đất trồng", fertilizer: "Phân bón",
  fertilizing: "Bón phân", pruning: "Cắt tỉa", repotting: "Thay chậu" };

// Chia theo đoạn có overlap; tên nguồn luôn đi cùng từng đoạn, không gửi cả DB cho model.
const split = (text, size = 1600) => {
  const chunks = [];
  for (let start = 0; start < text.length;) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - 180;
  }
  return chunks;
};

const buildDocuments = async (plants, diseases, protocols, validProtocol) => {
  const published = plants.filter((plant) => plant.is_published === true);
  const verified = diseases.filter((disease) => disease.status === "active" && disease.content_status === "verified");
  const plantMap = new Map(published.map((plant) => [String(plant._id), plant]));
  const diseaseMap = new Map(verified.map((disease) => [String(disease._id), disease]));
  const documents = [];
  const add = (type, row, title, plantIds, names, sections) => {
    for (const [section, value] of sections) {
      const text = textOf(value).trim();
      if (!text) continue;
      split(text).forEach((part, index) => documents.push({
        type, id: String(row._id), title, plantIds, names,
        version: row.version || null, updated_at: row.updated_at || row.created_at || null,
        section: `${section} (${index + 1})`, content: `${title}\n${section}: ${part}`,
      }));
    }
  };
  for (const plant of published) {
    const names = [plant.common_name, plant.scientific_name, ...(plant.diagnosis_aliases || [])].filter(Boolean);
    add("plant", plant, plant.common_name, [String(plant._id)], names, [
      ["Thông tin cây", [plant.scientific_name, plant.botanical_family, plant.description]],
      ...Object.entries(plant.care_requirements || {}).map(([key, value]) => [careLabels[key] || key, value]),
    ]);
  }
  for (const disease of verified) {
    const related = published.filter((plant) => (plant.common_disease_ids || []).some((id) => String(id) === String(disease._id)));
    const names = [disease.disease_name, disease.scientific_name, ...(disease.diagnosis_aliases || [])].filter(Boolean);
    add("disease", disease, disease.disease_name, related.map((plant) => String(plant._id)), names, [
      ["Nhận biết bệnh", [disease.scientific_name, disease.pathogen_type, disease.typical_symptoms]],
      ["Nguyên nhân môi trường", disease.environmental_cause],
    ]);
  }
  for (const protocol of protocols) {
    const disease = diseaseMap.get(String(protocol.disease_id));
    const related = (protocol.plant_ids || []).map((id) => plantMap.get(String(id)))
      .filter((plant) => plant && (plant.common_disease_ids || []).some((id) => String(id) === String(protocol.disease_id)));
    if (!disease || !related.length || !await validProtocol(protocol)) continue;
    const title = `${protocol.protocol_name} — ${disease.disease_name} — ${related.map((plant) => plant.common_name).join(", ")}`;
    const safety = textOf(protocol.safety_guidelines);
    const sections = [
      ["Tổng quan phác đồ", `${protocol.description}\nThời lượng: ${protocol.duration_days} ngày.\nHướng dẫn đã duyệt: ${textOf(protocol.approved_instructions)}\nAn toàn: ${safety}`],
      ...(protocol.stages || []).map((stage) => [
        `Giai đoạn ${stage.order}: ${stage.title}, ngày ${stage.start_day}–${stage.end_day}`,
        `${textOf(stage.instructions)}\nLiều lượng: ${stage.dosage_note || "Không có"}\nLưu ý: ${stage.important_note || ""}\nAn toàn: ${safety}`,
      ]),
    ];
    add("protocol", protocol, title, related.map((plant) => String(plant._id)),
      [protocol.protocol_name, disease.disease_name], sections);
  }
  return { documents, plants: published };
};

const namedPlants = (message, plants) => {
  const query = ` ${normalize(message)} `;
  return plants.filter((plant) => [plant.common_name, plant.scientific_name, ...(plant.diagnosis_aliases || [])]
    .some((name) => normalize(name).length >= 3 && query.includes(` ${normalize(name)} `)))
    .map((plant) => String(plant._id));
};

const rank = (documents, message, history = [], plants = []) => {
  const current = new Set(tokens(message));
  if (!current.size) return [];
  let plantIds = namedPlants(message, plants);
  const previous = [...history].reverse().find((turn) => turn.role === "user")?.content || "";
  // Chỉ kế thừa chủ thể ở câu ngắn nối tiếp; câu hỏi có tên cây mới ưu tiên tên mới.
  const followup = !plantIds.length && current.size <= 5 && /\b(vay|con|no|do|nay|bao nhieu|bao lau|the nao)\b/.test(normalize(message));
  if (followup) plantIds = namedPlants(previous, plants);
  const context = followup ? new Set(tokens(previous)) : new Set();
  const terms = new Set([...current, ...context]);
  const rows = documents.filter((doc) => !plantIds.length || doc.plantIds.some((id) => plantIds.includes(id)))
    .map((doc) => ({ doc, words: tokens(`${doc.title} ${doc.section} ${doc.content}`) }));
  const average = rows.reduce((sum, row) => sum + row.words.length, 0) / (rows.length || 1);
  const frequency = new Map();
  for (const { words } of rows) for (const word of new Set(words))
    if (terms.has(word)) frequency.set(word, (frequency.get(word) || 0) + 1);
  return rows.map(({ doc, words }) => {
    const counts = new Map();
    for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
    let score = 0;
    let hits = 0;
    for (const term of terms) {
      const count = counts.get(term) || 0;
      if (!count) continue;
      if (current.has(term)) hits += 1;
      const idf = Math.log(1 + (rows.length - (frequency.get(term) || 0) + 0.5) / ((frequency.get(term) || 0) + 0.5));
      score += (current.has(term) ? 1 : 0.25) * idf * count * 2.2 /
        (count + 1.2 * (0.25 + 0.75 * words.length / (average || 1)));
    }
    return { ...doc, score: hits ? score : 0 };
  }).filter((doc) => doc.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
};

const createRetriever = ({ plantModel = Plant, diseaseModel = Disease, protocolModel = TreatmentProtocol } = {}) => async (message, history = []) => {
  try {
    // Giới hạn rõ ràng: không âm thầm bỏ phần cuối danh mục khi dữ liệu vượt quy mô này.
    const read = (model, filter, fields) => model.find(filter).select(fields).sort({ _id: 1 })
      .limit(2001).maxTimeMS(4000).lean();
    const [plants, diseases, protocols] = await Promise.all([
      read(plantModel, { is_published: true }, "common_name scientific_name diagnosis_aliases botanical_family description care_requirements common_disease_ids is_published updated_at"),
      read(diseaseModel, { status: "active", content_status: "verified" }, "disease_name scientific_name diagnosis_aliases pathogen_type typical_symptoms environmental_cause status content_status created_at"),
      read(protocolModel, { status: "approved", instruction_source: { $ne: "ai_unverified" } }, "-reference_material -ai_generation"),
    ]);
    if ([plants, diseases, protocols].some((items) => items.length > 2000)) throw new Error("Catalog capacity exceeded");
    const corpus = await buildDocuments(plants, diseases, protocols, async (row) => {
      if (row.status !== "approved" || row.instruction_source === "ai_unverified") return false;
      try { await new TreatmentProtocol(row).validate(); return true; } catch { return false; }
    });
    if (corpus.documents.length > 20000) throw new Error("Chunk capacity exceeded");
    const selected = [];
    let length = 0;
    for (const doc of rank(corpus.documents, message, history, corpus.plants)) {
      if (selected.length >= 6) break;
      if (length + doc.content.length > 12000) continue;
      selected.push(doc); length += doc.content.length;
    }
    const sources = selected.map((doc, index) => ({
      number: index + 1, type: doc.type, id: doc.id, title: doc.title, section: doc.section,
      version: doc.version, updated_at: doc.updated_at, content_hash: hash(doc.content),
    }));
    const content = selected.length ? JSON.stringify(selected.map((doc, index) => ({
      source: index + 1, type: doc.type, title: doc.title, section: doc.section, excerpt: doc.content,
    }))) : "Không tìm thấy tài liệu phù hợp trong danh mục Plantify.";
    return { sources, content, method: "bm25", status: selected.length ? "matched" : "no_match" };
  } catch {
    throw new AppError("CHAT_RETRIEVAL_UNAVAILABLE", 503, "Chưa thể tra cứu kiến thức Plantify. Vui lòng thử lại sau.");
  }
};

module.exports = { retrieve: createRetriever(), createRetriever, buildDocuments, rank, normalize };
