const mongoose = require("mongoose");
const { Schema } = mongoose;
const oid = Schema.Types.ObjectId;
const order = new Schema({
  user_id: { type: oid, ref: "User", required: true, index: true },
  code: { type: String, required: true, unique: true },
  request_key: { type: String, required: true },
  amount: { type: Number, required: true, min: 10000, max: 10000000, validate: Number.isSafeInteger },
  status: { type: String, enum: ["pending", "success", "rejected"], default: "pending" },
  expires_at: { type: Date, required: true },
  bank_code: String, account_number: String, account_name: String,
  virtual_account: { type: String, maxlength: 100 },
  reviewed_by: { type: oid, ref: "User" }, reason: String, completed_at: Date,
}, { timestamps: true });
order.index({ user_id: 1, request_key: 1 }, { unique: true });
order.index({ status: 1, expires_at: 1 });
const ledger = new Schema({
  user_id: { type: oid, ref: "User", required: true, index: true },
  actor_id: { type: oid, ref: "User", required: true },
  request_key: { type: String, required: true },
  type: { type: String, enum: ["topup", "purchase", "adjustment"], required: true },
  amount: { type: Number, required: true, validate: Number.isSafeInteger },
  balance_after: { type: Number, required: true, min: 0, max: Number.MAX_SAFE_INTEGER, validate: Number.isSafeInteger },
  plan: String, days: Number, vip_expires_at: Date,
  order_id: { type: oid, ref: "TopupOrder" }, reason: String,
}, { timestamps: { createdAt: "created_at", updatedAt: false } });
ledger.index({ actor_id: 1, request_key: 1 }, { unique: true });
ledger.index({ order_id: 1 }, { unique: true, partialFilterExpression: { order_id: { $type: "objectId" }, type: "topup" } });
const event = new Schema({
  provider_id: { type: String, required: true, unique: true },
  payload_hash: { type: String, required: true },
  amount: Number, content: String, account_number: String,
  virtual_account: { type: String, maxlength: 100 },
  order_id: { type: oid, ref: "TopupOrder" },
  status: { type: String, enum: ["credited", "review", "already_processed"], required: true },
  reason: String,
}, { timestamps: true });
module.exports = {
  TopupOrder: mongoose.model("TopupOrder", order, "topup_orders"),
  WalletTransaction: mongoose.model("WalletTransaction", ledger, "wallet_transactions"),
  PaymentEvent: mongoose.model("PaymentEvent", event, "payment_events"),
};
