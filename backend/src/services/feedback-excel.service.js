const { Feedback } = require("../models/feedback.model");
const Diagnosis = require("../models/diseaseDiagnosis.model");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const User = require("../models/user.model");
const { createWorkbook } = require("../utils/xlsx");

const statusLabels = { accepted: "Đã tiếp nhận", pending: "Chờ xử lý" };
const dateLabel = (date) => date instanceof Date
  ? new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 16).replace("T", " ")
  : "";

const lookup = (model, localField, as) => ({
  $lookup: { from: model.collection.name, localField, foreignField: "_id", as },
});

function reportRows(filter) {
  return Feedback.aggregate([
    { $match: filter },
    { $sort: { created_at: -1, _id: -1 } },
    { $project: { user_id: 1, diagnosis_id: 1, description: 1, created_at: 1, status: 1, ai_assessment: 1 } },
    lookup(Diagnosis, "diagnosis_id", "linked"),
    {
      $set: {
        linked: {
          $first: {
            $filter: {
              input: "$linked",
              as: "record",
              cond: { $and: [
                { $eq: ["$$record.user_id", "$user_id"] },
                { $eq: ["$$record.status", "identified"] },
              ] },
            },
          },
        },
      },
    },
    lookup(Plant, "linked.plant_id", "plants"),
    lookup(Disease, "linked.disease_id", "diseases"),
    {
      $project: {
        created_at: 1, description: 1, status: 1, ai_assessment: 1,
        plant: { $first: "$plants.common_name" },
        disease: { $first: "$diseases.disease_name" },
        kind: "$linked.result_kind",
      },
    },
  ]).allowDiskUse(true).cursor({ batchSize: 100 });
}

function increment(counts, value) {
  const label = value?.trim().replace(/\s+/gu, " ");
  if (!label) return;
  const key = label.normalize("NFC").toLocaleLowerCase("vi");
  const row = counts.get(key);
  if (row) row.count++;
  else counts.set(key, { label, count: 1 });
}

const ranked = (counts) => [...counts.values()].sort((a, b) =>
  b.count - a.count || a.label.localeCompare(b.label, "vi"),
);

async function exportExcel({ filter, email, mode }) {
  const eligible = mode === "review" ? ["accepted", "pending"] : ["accepted"];
  const conditions = {
    ...filter,
    status: { $in: filter.status ? eligible.filter((status) => status === filter.status) : eligible },
    "ai_assessment.verdict": "supported",
  };
  if (email) {
    const user = await User.findOne({ email }).select("_id").lean();
    conditions.user_id = user?._id || { $in: [] };
  }

  const plants = new Map();
  const diseases = new Map();
  const symptoms = new Map();
  const counts = { accepted: 0, pending: 0 };
  let completeDetails;
  const detailsReady = new Promise((resolve) => { completeDetails = resolve; });

  async function* details() {
    let cursor;
    try {
      yield [
        "Mã feedback", "Ngày gửi (giờ Việt Nam)", "Loại kết quả", "Cây", "Bệnh",
        "Nội dung người dùng", "Lý do của chatbot", "Trích feedback", "Trích danh mục",
        "Trạng thái Manager",
      ];
      cursor = reportRows(conditions);
      for await (const row of cursor) {
        const assessment = row.ai_assessment;
        counts[row.status]++;
        increment(plants, row.plant);
        increment(diseases, row.disease);
        increment(symptoms, assessment.feedback_quote);
        yield [
          String(row._id), dateLabel(row.created_at),
          row.kind === "plant" ? "Nhận diện cây" : row.disease ? "Chẩn đoán bệnh" : "",
          row.plant, row.disease, row.description, assessment.reason,
          assessment.feedback_quote, assessment.reference_quote, statusLabels[row.status],
        ];
      }
    } finally {
      completeDetails();
      if (cursor) await cursor.close();
    }
  }

  async function* summary() {
    yield ["Nhóm", "Nội dung", "Số feedback"];
    await detailsReady;
    yield ["Tổng cộng", mode === "review" ? "Bản rà soát" : "Báo cáo chính thức", counts.accepted + counts.pending];
    yield ["Trạng thái", statusLabels.accepted, counts.accepted];
    if (mode === "review") yield ["Trạng thái", statusLabels.pending, counts.pending];
    for (const { label, count } of ranked(plants)) yield ["Cây", label, count];
    for (const { label, count } of ranked(diseases)) yield ["Bệnh", label, count];
    for (const { label, count } of ranked(symptoms).slice(0, 10))
      yield ["Dấu hiệu (trích feedback)", label, count];
  }

  return createWorkbook([
    { name: "Feedback có căn cứ", widths: [28, 23, 20, 24, 26, 58, 58, 42, 42, 20], rows: details() },
    { name: "Tổng hợp", widths: [28, 62, 16], rows: summary() },
  ]);
}

module.exports = { exportExcel };
