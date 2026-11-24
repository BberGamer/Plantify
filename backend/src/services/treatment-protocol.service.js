const TreatmentProtocol = require("../models/treatmentProtocol.model");
const Plant = require("../models/plant.model");
const Disease = require("../models/disease.model");
const AppError = require("../utils/app-error");
const validate = require("../validators/treatment.validator");
const v = require("../validators/common");
const withTransactionResult = require("../utils/transaction-result");

const assertProtocolReferences = async (data, session) => {
  const [disease, plants] = await Promise.all([
    Disease.findById(data.disease_id)
      .select("_id disease_name status")
      .session(session || null)
      .lean(),
    Plant.find({ _id: { $in: data.plant_ids } })
      .select("_id common_name common_disease_ids is_published")
      .session(session || null)
      .lean(),
  ]);
  if (!disease)
    throw new AppError("RESOURCE_NOT_FOUND", 404, "Không tìm thấy bệnh cây.");
  if (plants.length !== data.plant_ids.length)
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      404,
      "Có cây áp dụng không tồn tại.",
    );
  const unrelated = plants.find(
    (plant) =>
      !plant.common_disease_ids?.some(
        (diseaseId) => String(diseaseId) === String(data.disease_id),
      ),
  );
  if (unrelated)
    throw new AppError(
      "PROTOCOL_PLANT_DISEASE_MISMATCH",
      400,
      `Bệnh chưa được liên kết với cây ${unrelated.common_name}.`,
    );
  if (
    data.status === "approved" &&
    (disease.status !== "active" || plants.some((plant) => !plant.is_published))
  )
    throw new AppError(
      "PROTOCOL_REFERENCE_INACTIVE",
      409,
      "Chỉ có thể phê duyệt phác đồ cho cây và bệnh đang công khai.",
    );
  return { disease, plants };
};

const approvalFields = (data, userId, currentSource = "manager_verified") =>
  data.status === "approved"
    ? {
        instruction_source: currentSource,
        approved_by: userId,
        approved_at: new Date(),
      }
    : {
        instruction_source: "manager_verified",
        approved_by: null,
        approved_at: null,
      };

const getManagerProtocols = async (input = {}) => {
  const page = v.positiveInteger(input.page, 1, "page");
  const limit = v.positiveInteger(input.limit, 20, "limit", 100);
  const filter = {};
  if (input.status) {
    if (!["draft", "approved", "deprecated"].includes(input.status))
      v.invalid("status", "Trạng thái phác đồ không hợp lệ.");
    filter.status = input.status;
  }
  if (input.disease_id)
    filter.disease_id = v.id(input.disease_id, "disease_id");
  if (typeof input.search === "string" && input.search.trim())
    filter.protocol_name = new RegExp(v.escapeRegex(input.search.trim()), "i");
  const [items, total] = await Promise.all([
    TreatmentProtocol.find(filter)
      .populate("disease_id", "disease_name status")
      .populate("plant_ids", "common_name is_published")
      .sort({ updated_at: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    TreatmentProtocol.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getManagerProtocol = async (id) => {
  v.id(id, "protocol_id");
  const item = await TreatmentProtocol.findById(id)
    .populate("disease_id", "disease_name status")
    .populate("plant_ids", "common_name is_published")
    .lean();
  if (!item)
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      404,
      "Không tìm thấy phác đồ điều trị.",
    );
  return item;
};

const createProtocol = async (userId, input) => {
  v.id(userId, "user_id");
  const data = validate.protocol(input);
  await assertProtocolReferences(data);
  const latest = await TreatmentProtocol.findOne({
    disease_id: data.disease_id,
    protocol_name: data.protocol_name,
  })
    .sort({ version: -1 })
    .select("version")
    .lean();
  const item = await TreatmentProtocol.create({
    ...data,
    ...approvalFields(data, userId),
    version: (latest?.version || 0) + 1,
    created_by: userId,
  });
  return getManagerProtocol(String(item._id));
};

const updateProtocol = async (userId, id, input) => {
  v.id(userId, "user_id");
  v.id(id, "protocol_id");
  const data = validate.protocol(input);
  return withTransactionResult(async (session) => {
    const current = await TreatmentProtocol.findById(id).session(session);
    if (!current)
      throw new AppError(
        "RESOURCE_NOT_FOUND",
        404,
        "Không tìm thấy phác đồ điều trị.",
      );
    if (String(current.disease_id) !== String(data.disease_id))
      throw new AppError(
        "PROTOCOL_DISEASE_IMMUTABLE",
        409,
        "Không thể đổi bệnh của phác đồ đã tạo.",
      );
    await assertProtocolReferences(data, session);
    if (current.status === "approved") {
      const [replacement] = await TreatmentProtocol.create(
        [
          {
            ...data,
            ...approvalFields(data, userId),
            version: current.version + 1,
            created_by: userId,
          },
        ],
        { session },
      );
      await TreatmentProtocol.updateOne(
        { _id: current._id, status: "approved" },
        { $set: { status: "deprecated" } },
        { session },
      );
      return replacement.toObject();
    }
    Object.assign(
      current,
      data,
      approvalFields(data, userId, current.instruction_source),
    );
    await current.save({ session });
    return current.toObject();
  });
};

const deprecateProtocol = async (id) => {
  v.id(id, "protocol_id");
  const item = await TreatmentProtocol.findOneAndUpdate(
    { _id: id, status: { $ne: "deprecated" } },
    { $set: { status: "deprecated" } },
    { new: true, runValidators: true },
  ).lean();
  if (item) return item;
  return getManagerProtocol(id);
};

module.exports = {
  getManagerProtocols,
  getManagerProtocol,
  createProtocol,
  updateProtocol,
  deprecateProtocol,
};
