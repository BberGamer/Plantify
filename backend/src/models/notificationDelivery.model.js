const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  notification_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  installation_id: { type: String, required: true },
  status: { type: String, default: "pending" },
  attempts: { type: Number, default: 0 },
  retry_at: { type: Date, required: true },
  lease_id: String,
  expires_at: { type: Date, required: true },
  sent_at: Date,
  error_code: String,
});

schema.index({ notification_id: 1, installation_id: 1 }, { unique: true });
schema.index({ status: 1, retry_at: 1, expires_at: 1 });
schema.index({ expires_at: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("NotificationDelivery", schema);
