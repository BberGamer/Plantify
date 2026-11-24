const AppError = require('../utils/app-error');
const Mapping = require('../models/diagnosisMapping.model');
const Plant = require('../models/plant.model');
const Disease = require('../models/disease.model');
const { loadModelMetadata } = require('../config/diagnosis');
const fail = message => { throw new AppError('CATALOG_AI_CONFLICT', 409, message); };
const validateIds = async ids => {
  if (ids === undefined) return undefined;
  const meta = await loadModelMetadata();
  if (!Array.isArray(ids) || ids.some(id => !Number.isInteger(id) || id < 0 || id >= meta.classes) || new Set(ids).size !== ids.length)
    throw new AppError('VALIDATION_ERROR', 400, 'Danh sách nhãn AI không hợp lệ.', {
      ai_class_ids: 'Chỉ chọn các nhãn AI có sẵn, không được chọn trùng.',
    });
  return ids;
};
const filterFor = meta => ({ model_run_id: meta.run_id, checkpoint_sha256: meta.sha256 });
async function listLabels(kind) {
  const meta = await loadModelMetadata();
  const rows = await Mapping.find(filterFor(meta)).lean();
  const [plants, diseases] = await Promise.all([
    Plant.find({}).select('_id common_name').lean(),
    Disease.find({}).select('_id disease_name').lean(),
  ]);
  return meta.labels.filter(label => kind === 'plant' || !label.is_healthy).map(label => {
    const row = rows.find(x => x.class_id === label.class_id);
    return { ...label, plant_id: row?.plant_id ? String(row.plant_id) : null,
      disease_id: row?.disease_id ? String(row.disease_id) : null,
      plant_name: plants.find(x => String(x._id) === String(row?.plant_id))?.common_name || null,
      disease_name: diseases.find(x => String(x._id) === String(row?.disease_id))?.disease_name || null,
      status: row?.status || 'pending' };
  });
}
async function assertCanDelete(kind, id, session) {
  if (await Mapping.exists({ [kind === 'plant' ? 'plant_id' : 'disease_id']: id }).session(session))
    fail('Bản ghi đang được gán nhãn AI. Hãy bỏ gán hoặc chuyển nhãn sang bản ghi khác trước khi xóa.');
}
async function synchronize(kind, document, ids, session) {
  const meta = await loadModelMetadata();
  const base = filterFor(meta);
  const field = kind === 'plant' ? 'plant_id' : 'disease_id';
  const owned = await Mapping.find({ ...base, [field]: document._id }).session(session).lean();
  if (ids !== undefined) {
    for (const row of owned.filter(x => !ids.includes(x.class_id)))
      await Mapping.updateOne({ _id: row._id }, { $set: {
        [field]: null, status: 'pending', reason: 'catalog_assignment_removed',
      } }, { session });
  }
  const selected = ids ?? owned.map(row => row.class_id);
  for (const classId of selected) {
    const label = meta.labels[classId];
    if (kind === 'disease' && label.is_healthy) fail('Không thể gán nhãn khỏe cho một bệnh.');
    const current = await Mapping.findOne({ ...base, class_id: classId }).session(session).lean();
    const plantId = kind === 'plant' ? document._id : current?.plant_id;
    const diseaseId = label.is_healthy ? null : kind === 'disease' ? document._id : current?.disease_id || null;
    if (kind === 'disease' && !plantId) fail('Nhãn AI chưa có cây. Hãy gán nhãn cho cây trước.');
    const plant = kind === 'plant' ? document : await Plant.findById(plantId).session(session);
    const disease = kind === 'disease' ? document : diseaseId ? await Disease.findById(diseaseId).session(session) : null;
    if (!plant) fail('Cây của nhãn AI không còn tồn tại.');
    if (kind === 'disease' && !plant.common_disease_ids?.some(id => String(id) === String(document._id)))
      fail('Nhãn AI thuộc cây chưa được chọn trong danh sách cây liên quan.');
    if (kind === 'plant' && disease) {
      await Plant.updateOne({ _id: plant._id }, { $addToSet: { common_disease_ids: disease._id } }, { session });
    }
    const ready = plant.is_published && (label.is_healthy || disease?.status === 'active');
    await Mapping.updateOne({ ...base, class_id: classId }, { $set: {
      class_name: label.class_name, is_healthy: label.is_healthy, plant_id: plantId,
      disease_id: diseaseId, status: ready ? 'ready' : 'pending',
      reason: ready ? '' : 'catalog_unavailable', import_source: 'manager_assignment',
    } }, { upsert: true, session, runValidators: true });
  }
}
module.exports = { listLabels, validateIds, synchronize, assertCanDelete };
