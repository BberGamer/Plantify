const Wallet = require('./wallet.model');
const WalletTransaction = require('./walletTransaction.model');

async function getOrCreateWallet(userId) {
  return Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, balance: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function getWallet(userId) {
  const wallet = await getOrCreateWallet(userId);
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return { balance: wallet.balance, transactions };
}

async function debitUpTo(userId, requestedAmount, order) {
  let wallet = await getOrCreateWallet(userId);
  const maximum = Math.max(0, Math.round(Number(requestedAmount) || 0));

  while (maximum > 0 && wallet.balance > 0) {
    const amount = Math.min(wallet.balance, maximum);
    const updatedWallet = await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );

    if (!updatedWallet) {
      wallet = await Wallet.findById(wallet._id);
      continue;
    }

    try {
      await WalletTransaction.create({
        walletId: updatedWallet._id,
        userId,
        orderId: order._id,
        type: 'payment',
        amount,
        balanceAfter: updatedWallet.balance,
        description: `Thanh toán đơn hàng ${order.orderCode}`,
        idempotencyKey: `order:${order._id}:payment`,
      });
      return amount;
    } catch (error) {
      await Wallet.updateOne({ _id: updatedWallet._id }, { $inc: { balance: amount } });
      throw error;
    }
  }

  return 0;
}

async function creditRefund(userId, amount, order) {
  const refundAmount = Math.max(0, Math.round(Number(amount) || 0));
  if (refundAmount === 0) return getOrCreateWallet(userId);

  const existing = await WalletTransaction.findOne({
    idempotencyKey: `order:${order._id}:refund`,
  });
  if (existing) return Wallet.findById(existing.walletId);

  const wallet = await getOrCreateWallet(userId);
  const updatedWallet = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: refundAmount } },
    { new: true }
  );

  try {
    await WalletTransaction.create({
      walletId: updatedWallet._id,
      userId,
      orderId: order._id,
      type: 'refund',
      amount: refundAmount,
      balanceAfter: updatedWallet.balance,
      description: `Hoàn tiền đơn hàng ${order.orderCode}`,
      idempotencyKey: `order:${order._id}:refund`,
    });
  } catch (error) {
    await Wallet.updateOne({ _id: updatedWallet._id }, { $inc: { balance: -refundAmount } });
    if (error?.code === 11000) return Wallet.findById(updatedWallet._id);
    throw error;
  }

  return updatedWallet;
}

module.exports = { getWallet, debitUpTo, creditRefund };
