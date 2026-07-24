const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['payment', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    balanceAfter: {
      type: Number,
      min: 0,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true, collection: 'wallet_transactions' }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
