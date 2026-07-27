// careEvent.model.js - Schema lịch sử chăm sóc thực tế của UserPlant
const mongoose = require('mongoose');

const CARE_EVENT_TYPES = ['watering', 'fertilizing', 'pruning', 'repotting', 'treatment', 'observation'];
const careEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userPlantId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPlant', required: true },
  type: { type: String, enum: CARE_EVENT_TYPES, required: true },
  performedAt: { type: Date, required: true, default: Date.now },
}, { collection: 'care_events', timestamps: true });
careEventSchema.index({ userId: 1, userPlantId: 1, performedAt: -1 });
module.exports = mongoose.model('CareEvent', careEventSchema);
module.exports.CARE_EVENT_TYPES = CARE_EVENT_TYPES;
