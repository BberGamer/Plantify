const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
  },
  { timestamps: true, collection: 'wallets' }
);

module.exports = mongoose.model('Wallet', walletSchema);
