jest.mock('../../../src/features/wallet/wallet.model', () => ({
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../../../src/features/wallet/walletTransaction.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

const Wallet = require('../../../src/features/wallet/wallet.model');
const WalletTransaction = require('../../../src/features/wallet/walletTransaction.model');
const walletService = require('../../../src/features/wallet/wallet.service');

const userId = '507f1f77bcf86cd799439011';
const order = { _id: '507f1f77bcf86cd799439012', orderCode: 'PL001' };

describe('walletService', () => {
  test('trừ tối đa số dư hiện có và ghi giao dịch thanh toán', async () => {
    Wallet.findOneAndUpdate
      .mockResolvedValueOnce({ _id: 'wallet-1', balance: 60000 })
      .mockResolvedValueOnce({ _id: 'wallet-1', balance: 0 });
    WalletTransaction.create.mockResolvedValue({ _id: 'transaction-1' });

    const amount = await walletService.debitUpTo(userId, 100000, order);

    expect(amount).toBe(60000);
    expect(WalletTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'payment',
        amount: 60000,
        balanceAfter: 0,
        idempotencyKey: `order:${order._id}:payment`,
      })
    );
  });

  test('hoàn tiền vào ví và ghi số dư sau giao dịch', async () => {
    WalletTransaction.findOne.mockResolvedValue(null);
    Wallet.findOneAndUpdate.mockResolvedValue({ _id: 'wallet-1', balance: 10000 });
    Wallet.findByIdAndUpdate.mockResolvedValue({ _id: 'wallet-1', balance: 110000 });
    WalletTransaction.create.mockResolvedValue({ _id: 'transaction-2' });

    const result = await walletService.creditRefund(userId, 100000, order);

    expect(result.balance).toBe(110000);
    expect(WalletTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'refund',
        amount: 100000,
        balanceAfter: 110000,
        idempotencyKey: `order:${order._id}:refund`,
      })
    );
  });

  test('không hoàn tiền lần hai khi đã có giao dịch cùng đơn', async () => {
    WalletTransaction.findOne.mockResolvedValue({ walletId: 'wallet-1' });
    Wallet.findById.mockResolvedValue({ _id: 'wallet-1', balance: 100000 });

    await walletService.creditRefund(userId, 100000, order);

    expect(Wallet.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(WalletTransaction.create).not.toHaveBeenCalled();
  });
});
