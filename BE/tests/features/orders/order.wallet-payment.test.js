jest.mock('../../../src/features/orders/order.model', () => {
  const Order = jest.fn().mockImplementation((data) => ({
    _id: '507f1f77bcf86cd799439099',
    ...data,
    paymentStatus: 'pending',
    walletAmount: 0,
    validate: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
  }));
  Order.findById = jest.fn();
  Order.findOneAndUpdate = jest.fn();
  return Order;
});

jest.mock('../../../src/features/products/product.model', () => ({
  find: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../../../src/features/cart/cart.model', () => ({
  updateOne: jest.fn(),
}));

jest.mock('../../../src/features/wallet/wallet.service', () => ({
  debitUpTo: jest.fn(),
  creditRefund: jest.fn(),
}));

jest.mock('../../../src/features/notifications/notification.service', () => ({
  createOrderNotification: jest.fn(),
}));

const Order = require('../../../src/features/orders/order.model');
const Product = require('../../../src/features/products/product.model');
const walletService = require('../../../src/features/wallet/wallet.service');
const { createOrderNotification } = require('../../../src/features/notifications/notification.service');
const orderService = require('../../../src/features/orders/order.service');

describe('VNPay không sử dụng ví', () => {
  test('giữ nguyên số dư khi useWallet không được bật', async () => {
    const productId = '507f1f77bcf86cd799439011';
    let createdOrder;
    Order.mockImplementation((data) => {
      createdOrder = {
        _id: '507f1f77bcf86cd799439099',
        ...data,
        paymentStatus: 'pending',
        walletAmount: 0,
        validate: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
      };
      return createdOrder;
    });
    Product.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{
        _id: productId,
        name: 'Cây xanh',
        price: 100000,
        stock: 10,
        isActive: true,
      }]),
    });
    Order.findById.mockImplementation(async () => createdOrder);

    const order = await orderService.createOrder('507f1f77bcf86cd799439012', {
      items: [{ productId, quantity: 1 }],
      shippingInfo: {
        fullName: 'Nguyễn Văn A',
        phone: '0900000000',
        email: 'customer@example.com',
        address: 'Hà Nội',
      },
      paymentMethod: 'BANK',
      shippingFee: 30000,
      useWallet: false,
    });

    expect(walletService.debitUpTo).not.toHaveBeenCalled();
    expect(order.walletAmount).toBe(0);
    expect(order.externalAmount).toBe(130000);
  });

  test('quản lý hủy đơn VNPay đã thanh toán thì lưu lý do và hoàn toàn bộ tiền vào ví', async () => {
    const order = {
      _id: '507f1f77bcf86cd799439099',
      userId: '507f1f77bcf86cd799439012',
      orderCode: 'PL002',
      status: 'pending',
      paymentMethod: 'BANK',
      paymentStatus: 'paid',
      total: 250000,
      walletAmount: 0,
      inventoryApplied: true,
      items: [],
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findById.mockResolvedValue(order);
    Order.findOneAndUpdate.mockResolvedValue({ ...order, inventoryApplied: false });
    walletService.creditRefund.mockResolvedValue({ balance: 250000 });
    createOrderNotification.mockResolvedValue(null);

    const result = await orderService.updateOrder(
      order._id,
      { status: 'cancelled', cancellationReason: 'out_of_stock' },
      '507f1f77bcf86cd799439013'
    );

    expect(walletService.creditRefund).toHaveBeenCalledWith(order.userId, 250000, order);
    expect(result.status).toBe('cancelled');
    expect(result.paymentStatus).toBe('refunded');
    expect(result.cancellationReason).toBe('out_of_stock');
    expect(result.refundedAmount).toBe(250000);
  });

  test('từ chối hủy đơn đang chờ khi quản lý không chọn lý do', async () => {
    const order = {
      _id: '507f1f77bcf86cd799439099',
      status: 'pending',
      save: jest.fn(),
    };
    Order.findById.mockResolvedValue(order);

    await expect(
      orderService.updateOrder(
        order._id,
        { status: 'cancelled' },
        '507f1f77bcf86cd799439013'
      )
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(order.save).not.toHaveBeenCalled();
    expect(walletService.creditRefund).not.toHaveBeenCalled();
  });
});
