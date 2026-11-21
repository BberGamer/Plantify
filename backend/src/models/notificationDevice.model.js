const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  _id: String,
  installation_id: String,
  sequence: Number,
  user_id: mongoose.Schema.Types.ObjectId,
  token: { type: String, select: false },
  revoke_hash: { type: String, required: true, select: false },
  revoked: { type: Boolean, default: false },
  revoked_at: Date,
}, { timestamps: true });

schema.index({ installation_id: 1 }, { unique: true, partialFilterExpression: { revoked: false } });
schema.index({ token: 1 }, { unique: true, sparse: true });
schema.index({ user_id: 1, revoked: 1 });
schema.index({ installation_id: 1, sequence: -1 });
schema.index({ revoked_at: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("NotificationDevice", schema);
