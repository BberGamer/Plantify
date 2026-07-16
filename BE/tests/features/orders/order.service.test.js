jest.mock('../../../src/features/orders/order.model', () => {
  const Order = jest.fn();
  Order.findOneAndUpdate = jest.fn();
  Order.findOne = jest.fn();
  Order.findById = jest.fn();
  Order.deleteOne = jest.fn();
  Order.updateOne = jest.fn();
  return Order;
});
jest.mock('../../../src/features/products/product.model', () => ({
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));
jest.mock('../../../src/features/cart/cart.model', () => ({ updateOne: jest.fn() }));
jest.mock('../../../src/features/notifications/notification.service', () => ({
  createOrderNotification: jest.fn(),
}));

const Order = require('../../../src/features/orders/order.model');
const Product = require('../../../src/features/products/product.model');
const Cart = require('../../../src/features/cart/cart.model');
const { createOrderNotification } = require('../../../src/features/notifications/notification.service');
const crypto = require('crypto');
const qs = require('qs');
const {
  createOrder,
  customerActionOrder,
  handleVnpayIPN,
  updateOrder,
  verifyVnpayReturn,
} = require('../../../src/features/orders/order.service');

const userId = '507f1f77bcf86cd799439011';
const productId = '507f1f77bcf86cd799439012';
const secondProductId = '507f1f77bcf86cd799439013';
const orderId = '507f1f77bcf86cd799439014';

function productQuery(products) {
  return { lean: jest.fn().mockResolvedValue(products) };
}

function makeProduct(overrides = {}) {
  return {
    _id: productId,
    name: 'Monstera',
    price: 150000,
    stock: 10,
    thumbnail: 'monstera.jpg',
    isActive: true,
    ...overrides,
  };
}

function mockOrderDocument() {
  Order.mockImplementation((data) => ({
    _id: orderId,
    inventoryApplied: false,
    ...data,
    validate: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
  }));
}

function signVnpayParams(params) {
  const sorted = {};
  Object.keys(params).map(encodeURIComponent).sort().forEach((key) => {
    sorted[key] = encodeURIComponent(params[key]).replace(/%20/g, '+');
  });
  const signData = qs.stringify(sorted, { encode: false });
  return crypto
    .createHmac('sha512', process.env.VNPAY_HASH_SECRET)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');
}

function makeVnpayParams(overrides = {}) {
  const params = {
    vnp_TxnRef: 'PL202607150001ABC',
    vnp_ResponseCode: '00',
    vnp_Amount: '18000000',
    vnp_TransactionNo: 'VNP123456',
    ...overrides,
  };
  return { ...params, vnp_SecureHash: signVnpayParams(params) };
}

describe('orderService.createOrderFromProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderDocument();
  });

  test('từ chối đơn hàng không có sản phẩm', async () => {
    await expect(createOrder(userId, { items: [], paymentMethod: 'COD' }))
      .rejects.toThrow('Đơn hàng phải có ít nhất một sản phẩm');

    expect(Product.find).not.toHaveBeenCalled();
    expect(Order).not.toHaveBeenCalled();
  });

  test.each([
    ['số lượng bằng 0', { productId, quantity: 0 }, 'Số lượng sản phẩm phải là số nguyên dương'],
    ['Product ID không hợp lệ', { productId: 'invalid-id', quantity: 1 }, 'Sản phẩm trong đơn hàng không hợp lệ'],
  ])('từ chối %s', async (_description, item, message) => {
    await expect(createOrder(userId, { items: [item], paymentMethod: 'COD' }))
      .rejects.toThrow(message);

    expect(Product.find).not.toHaveBeenCalled();
    expect(Order).not.toHaveBeenCalled();
  });

  test.each([
    ['không tồn tại', []],
    ['đã ngừng bán', [makeProduct({ isActive: false })]],
  ])('từ chối sản phẩm %s', async (_description, products) => {
    Product.find.mockReturnValue(productQuery(products));

    await expect(createOrder(userId, {
      items: [{ productId, quantity: 1 }],
      paymentMethod: 'COD',
    })).rejects.toThrow('Sản phẩm không tồn tại hoặc đã ngừng bán');

    expect(Order).not.toHaveBeenCalled();
  });

  test('từ chối khi số lượng yêu cầu vượt tồn kho', async () => {
    Product.find.mockReturnValue(productQuery([makeProduct({ stock: 2 })]));

    await expect(createOrder(userId, {
      items: [{ productId, quantity: 3 }],
      paymentMethod: 'COD',
    })).rejects.toThrow('Sản phẩm "Monstera" chỉ còn 2 sản phẩm');

    expect(Order).not.toHaveBeenCalled();
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('lấy giá từ DB, tính tổng và trừ tồn kho khi tạo đơn COD', async () => {
    const products = [
      makeProduct({ price: 150000, stock: 10 }),
      makeProduct({
        _id: secondProductId,
        name: 'Plant Pot',
        price: 50000,
        stock: 5,
        thumbnail: 'pot.jpg',
      }),
    ];
    Product.find.mockReturnValue(productQuery(products));
    Product.findOneAndUpdate.mockResolvedValue({ stock: 8 });
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 });

    let createdOrder;
    Order.mockImplementation((data) => {
      createdOrder = {
        _id: orderId,
        inventoryApplied: false,
        ...data,
        validate: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
      };
      return createdOrder;
    });
    Order.findOneAndUpdate.mockImplementation(async () => ({
      ...createdOrder,
      inventoryApplied: true,
    }));
    Order.findById.mockResolvedValue({ _id: orderId, status: 'pending' });

    const result = await createOrder(userId, {
      items: [
        { productId, quantity: 2, price: 1 },
        { productId: secondProductId, quantity: 1, price: 1 },
      ],
      shippingInfo: { fullName: 'Binh' },
      paymentMethod: 'COD',
      shippingFee: 30000,
      subtotal: 2,
      total: 2,
    });

    expect(Order).toHaveBeenCalledWith(expect.objectContaining({
      subtotal: 350000,
      shippingFee: 30000,
      total: 380000,
      items: [
        expect.objectContaining({ productId, price: 150000, quantity: 2, lineTotal: 300000 }),
        expect.objectContaining({ productId: secondProductId, price: 50000, quantity: 1, lineTotal: 50000 }),
      ],
    }));
    expect(createdOrder.validate).toHaveBeenCalledTimes(1);
    expect(createdOrder.save).toHaveBeenCalledTimes(1);
    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(Product.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: productId, stock: { $gte: 2 } },
      { $inc: { stock: -2, soldCount: 2 } },
      { new: true },
    );
    expect(Product.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: secondProductId, stock: { $gte: 1 } },
      { $inc: { stock: -1, soldCount: 1 } },
      { new: true },
    );
    expect(Cart.updateOne).toHaveBeenCalledWith(
      { userId },
      { $pull: { items: { selected: true } } },
    );
    expect(result).toEqual({ _id: orderId, status: 'pending' });
  });

  test('lấy giá từ DB và tính tổng nhưng chưa trừ tồn kho với đơn BANK chưa thanh toán', async () => {
    Product.find.mockReturnValue(productQuery([makeProduct({ price: 120000, stock: 4 })]));
    Order.findById.mockResolvedValue({ _id: orderId, paymentMethod: 'BANK' });

    await createOrder(userId, {
      items: [{ productId, quantity: 2, price: 1 }],
      paymentMethod: 'BANK',
    });

    expect(Order).toHaveBeenCalledWith(expect.objectContaining({
      subtotal: 240000,
      shippingFee: 30000,
      total: 270000,
      items: [expect.objectContaining({ price: 120000, quantity: 2, lineTotal: 240000 })],
    }));
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Cart.updateOne).not.toHaveBeenCalled();
  });
});

describe('orderService.verifyVnpayReturn', () => {
  beforeEach(() => jest.clearAllMocks());

  test('từ chối callback có chữ ký không hợp lệ', async () => {
    const result = await verifyVnpayReturn({
      ...makeVnpayParams(),
      vnp_SecureHash: 'invalid-signature',
    }, userId);

    expect(result).toEqual({ isValid: false, responseCode: '97', order: null });
    expect(Order.findOne).not.toHaveBeenCalled();
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test.each([
    ['giao dịch thành công', '00', { isValid: false, responseCode: '01', order: null }],
    ['giao dịch thất bại', '24', { isValid: true, responseCode: '24', order: null }],
  ])('xử lý callback %s khi không tìm thấy đơn hàng', async (_description, responseCode, expected) => {
    Order.findOne.mockResolvedValue(null);

    const result = await verifyVnpayReturn(makeVnpayParams({
      vnp_ResponseCode: responseCode,
    }), userId);

    expect(Order.findOne).toHaveBeenCalledWith({ orderCode: 'PL202607150001ABC' });
    expect(result).toEqual(expected);
  });

  test('từ chối người dùng không phải chủ đơn hàng', async () => {
    Order.findOne.mockResolvedValue({
      _id: orderId,
      userId: '507f1f77bcf86cd799439099',
      paymentStatus: 'pending',
    });

    await expect(verifyVnpayReturn(makeVnpayParams(), userId)).rejects.toMatchObject({
      message: 'Ban khong co quyen xem don hang nay',
      statusCode: 403,
    });

    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('trả lại đơn đã thanh toán mà không trừ tồn kho lần nữa', async () => {
    const paidOrder = {
      _id: orderId,
      userId,
      paymentStatus: 'paid',
      status: 'pending',
    };
    Order.findOne.mockResolvedValue(paidOrder);

    const result = await verifyVnpayReturn(makeVnpayParams(), userId);

    expect(result).toEqual({ isValid: true, responseCode: '00', order: paidOrder });
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Cart.updateOne).not.toHaveBeenCalled();
  });

  test('đánh dấu đơn thất bại và hủy đơn khi thanh toán không thành công', async () => {
    const pendingOrder = {
      _id: orderId,
      userId,
      paymentStatus: 'pending',
      status: 'pending',
    };
    Order.findOne.mockResolvedValue(pendingOrder);
    Order.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await verifyVnpayReturn(makeVnpayParams({
      vnp_ResponseCode: '24',
    }), userId);

    expect(Order.updateOne).toHaveBeenCalledWith(
      { _id: orderId, paymentStatus: 'pending' },
      { $set: expect.objectContaining({ paymentStatus: 'failed', status: 'cancelled' }) },
    );
    expect(result).toEqual({ isValid: true, responseCode: '24', order: null });
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('xác nhận thanh toán thành công, trừ tồn kho và trả về đơn đã cập nhật', async () => {
    const orderItem = {
      productId,
      name: 'Monstera',
      quantity: 2,
    };
    const pendingOrder = {
      _id: orderId,
      userId,
      items: [orderItem],
      paymentStatus: 'pending',
      inventoryApplied: false,
    };
    const paidOrder = {
      ...pendingOrder,
      paymentStatus: 'paid',
      status: 'pending',
      inventoryApplied: false,
    };
    const finalOrder = {
      ...paidOrder,
      inventoryApplied: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findOne.mockResolvedValue(pendingOrder);
    Order.findOneAndUpdate
      .mockResolvedValueOnce(paidOrder)
      .mockResolvedValueOnce({ ...paidOrder, inventoryApplied: true });
    Product.findOneAndUpdate.mockResolvedValue({ _id: productId, stock: 8 });
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 });
    Order.findById.mockResolvedValue(finalOrder);

    const result = await verifyVnpayReturn(makeVnpayParams(), userId);

    expect(Order.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: orderId, paymentStatus: 'pending' },
      { $set: expect.objectContaining({
        paymentStatus: 'paid',
        status: 'pending',
        vnpayTransactionNo: 'VNP123456',
      }) },
      { new: true },
    );
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: productId, stock: { $gte: 2 } },
      { $inc: { stock: -2, soldCount: 2 } },
      { new: true },
    );
    expect(Cart.updateOne).toHaveBeenCalledWith(
      { userId },
      { $pull: { items: { selected: true } } },
    );
    expect(finalOrder.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ isValid: true, responseCode: '00', order: finalOrder });
  });
});

describe('orderService.handleVnpayIPN', () => {
  beforeEach(() => jest.clearAllMocks());

  test('từ chối IPN có chữ ký không hợp lệ', async () => {
    const result = await handleVnpayIPN({
      ...makeVnpayParams(),
      vnp_SecureHash: 'invalid-signature',
    });

    expect(result).toEqual({ rspCode: '97', message: 'Checksum failed' });
    expect(Order.findOne).not.toHaveBeenCalled();
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('trả mã 01 khi không tìm thấy đơn hàng', async () => {
    Order.findOne.mockResolvedValue(null);

    const result = await handleVnpayIPN(makeVnpayParams());

    expect(Order.findOne).toHaveBeenCalledWith({ orderCode: 'PL202607150001ABC' });
    expect(result).toEqual({ rspCode: '01', message: 'Order not found' });
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('từ chối khi số tiền VNPay không khớp tổng đơn hàng', async () => {
    Order.findOne.mockResolvedValue({
      _id: orderId,
      total: 200000,
      paymentStatus: 'pending',
    });

    const result = await handleVnpayIPN(makeVnpayParams({
      vnp_Amount: '18000000',
    }));

    expect(result).toEqual({ rspCode: '04', message: 'Amount invalid' });
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test.each([
    ['paid'],
    ['failed'],
  ])('không cập nhật lặp khi đơn đã ở trạng thái %s', async (paymentStatus) => {
    Order.findOne.mockResolvedValue({
      _id: orderId,
      total: 180000,
      paymentStatus,
    });

    const result = await handleVnpayIPN(makeVnpayParams());

    expect(result).toEqual({ rspCode: '02', message: 'Order already updated' });
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Order.updateOne).not.toHaveBeenCalled();
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Cart.updateOne).not.toHaveBeenCalled();
  });

  test('hủy đơn pending khi VNPay thông báo thanh toán thất bại', async () => {
    Order.findOne.mockResolvedValue({
      _id: orderId,
      total: 180000,
      paymentStatus: 'pending',
      status: 'pending',
    });
    Order.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await handleVnpayIPN(makeVnpayParams({
      vnp_ResponseCode: '24',
    }));

    expect(Order.updateOne).toHaveBeenCalledWith(
      { _id: orderId, paymentStatus: 'pending' },
      { $set: expect.objectContaining({ paymentStatus: 'failed', status: 'cancelled' }) },
    );
    expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
    expect(result).toEqual({ rspCode: '00', message: 'Success' });
  });

  test('xác nhận thanh toán thành công và chỉ áp dụng tồn kho một lần', async () => {
    const item = { productId, name: 'Monstera', quantity: 2 };
    const pendingOrder = {
      _id: orderId,
      userId,
      total: 180000,
      items: [item],
      paymentStatus: 'pending',
      inventoryApplied: false,
    };
    const paidOrder = {
      ...pendingOrder,
      paymentStatus: 'paid',
      status: 'pending',
    };
    const finalOrder = {
      ...paidOrder,
      inventoryApplied: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findOne.mockResolvedValue(pendingOrder);
    Order.findOneAndUpdate
      .mockResolvedValueOnce(paidOrder)
      .mockResolvedValueOnce({ ...paidOrder, inventoryApplied: true });
    Product.findOneAndUpdate.mockResolvedValue({ _id: productId, stock: 8 });
    Order.findById.mockResolvedValue(finalOrder);
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await handleVnpayIPN(makeVnpayParams());

    expect(Order.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: orderId, paymentStatus: 'pending' },
      { $set: expect.objectContaining({
        paymentStatus: 'paid',
        status: 'pending',
        vnpayTransactionNo: 'VNP123456',
      }) },
      { new: true },
    );
    expect(Order.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: orderId, inventoryApplied: false },
      { $set: { inventoryApplied: true } },
      { new: true },
    );
    expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: productId, stock: { $gte: 2 } },
      { $inc: { stock: -2, soldCount: 2 } },
      { new: true },
    );
    expect(Cart.updateOne).toHaveBeenCalledWith(
      { userId },
      { $pull: { items: { selected: true } } },
    );
    expect(finalOrder.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ rspCode: '00', message: 'Success' });
  });
});

describe('orderService.updateOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createOrderNotification.mockResolvedValue(undefined);
  });

  test('từ chối Order ID không hợp lệ', async () => {
    await expect(updateOrder('invalid-id', { status: 'packing' }, userId))
      .rejects.toMatchObject({
        message: 'ID don hang khong hop le',
        statusCode: 400,
      });

    expect(Order.findById).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy đơn hàng', async () => {
    Order.findById.mockResolvedValue(null);

    await expect(updateOrder(orderId, { status: 'packing' }, userId))
      .rejects.toThrow('Không tìm thấy đơn hàng');

    expect(createOrderNotification).not.toHaveBeenCalled();
  });

  test.each([
    ['pending', 'sented'],
    ['packing', 'cancelled'],
    ['sented', 'packing'],
  ])('từ chối chuyển trạng thái không hợp lệ từ %s sang %s', async (currentStatus, nextStatus) => {
    const order = {
      _id: orderId,
      status: currentStatus,
      save: jest.fn(),
    };
    Order.findById.mockResolvedValue(order);

    await expect(updateOrder(orderId, { status: nextStatus }, userId))
      .rejects.toThrow(`Không thể chuyển từ "${currentStatus}" sang "${nextStatus}"`);

    expect(order.save).not.toHaveBeenCalled();
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(createOrderNotification).not.toHaveBeenCalled();
  });

  test.each([
    ['pending', 'packing'],
    ['packing', 'sented'],
  ])('cho phép chuyển trạng thái hợp lệ từ %s sang %s', async (currentStatus, nextStatus) => {
    const order = {
      _id: orderId,
      status: currentStatus,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const updatedOrder = { _id: orderId, status: nextStatus };
    Order.findById.mockResolvedValueOnce(order).mockResolvedValueOnce(updatedOrder);

    const result = await updateOrder(orderId, { status: nextStatus }, userId);

    expect(order.status).toBe(nextStatus);
    expect(order.save).toHaveBeenCalledTimes(1);
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Product.updateOne).not.toHaveBeenCalled();
    expect(createOrderNotification).toHaveBeenCalledWith(updatedOrder, nextStatus, userId);
    expect(result).toEqual(updatedOrder);
  });

  test('hủy đơn pending và hoàn lại tồn kho đã áp dụng', async () => {
    const items = [
      { productId, quantity: 2 },
      { productId: secondProductId, quantity: 1 },
    ];
    const order = {
      _id: orderId,
      status: 'pending',
      inventoryApplied: true,
      items,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const updatedOrder = { _id: orderId, status: 'cancelled', inventoryApplied: false };
    Order.findById.mockResolvedValueOnce(order).mockResolvedValueOnce(updatedOrder);
    Order.findOneAndUpdate.mockResolvedValue({
      ...order,
      status: 'cancelled',
      inventoryApplied: false,
    });
    Product.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await updateOrder(orderId, { status: 'cancelled' }, userId);

    expect(order.status).toBe('cancelled');
    expect(order.cancelledAt).toBeInstanceOf(Date);
    expect(order.save).toHaveBeenCalledTimes(1);
    expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: orderId, inventoryApplied: true },
      { $set: { inventoryApplied: false } },
      { new: true },
    );
    expect(Product.updateOne).toHaveBeenCalledTimes(2);
    expect(Product.updateOne).toHaveBeenNthCalledWith(
      1,
      { _id: productId },
      { $inc: { stock: 2, soldCount: -2 } },
    );
    expect(Product.updateOne).toHaveBeenNthCalledWith(
      2,
      { _id: secondProductId },
      { $inc: { stock: 1, soldCount: -1 } },
    );
    expect(createOrderNotification).toHaveBeenCalledWith(updatedOrder, 'cancelled', userId);
    expect(result).toEqual(updatedOrder);
  });

  test('không hoàn kho lần nữa khi đơn chưa từng áp dụng tồn kho', async () => {
    const order = {
      _id: orderId,
      status: 'pending',
      inventoryApplied: false,
      items: [{ productId, quantity: 2 }],
      save: jest.fn().mockResolvedValue(undefined),
    };
    const updatedOrder = { _id: orderId, status: 'cancelled', inventoryApplied: false };
    Order.findById.mockResolvedValueOnce(order).mockResolvedValueOnce(updatedOrder);
    Order.findOneAndUpdate.mockResolvedValue(null);

    await updateOrder(orderId, { status: 'cancelled' }, userId);

    expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: orderId, inventoryApplied: true },
      { $set: { inventoryApplied: false } },
      { new: true },
    );
    expect(Product.updateOne).not.toHaveBeenCalled();
  });
});

describe('orderService.customerActionOrder', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ['Order ID', 'invalid-id', userId, 'ID don hang khong hop le', 400],
    ['User ID', orderId, 'invalid-user', 'Nguoi dung chua duoc xac thuc hop le', 401],
  ])('từ chối %s không hợp lệ', async (_description, targetOrderId, targetUserId, message, statusCode) => {
    await expect(customerActionOrder(targetOrderId, targetUserId, 'succeeded'))
      .rejects.toMatchObject({ message, statusCode });

    expect(Order.findById).not.toHaveBeenCalled();
  });

  test('từ chối khi không tìm thấy đơn hàng', async () => {
    Order.findById.mockResolvedValue(null);

    await expect(customerActionOrder(orderId, userId, 'succeeded'))
      .rejects.toThrow('Không tìm thấy đơn hàng');
  });

  test('từ chối người dùng không phải chủ đơn hàng', async () => {
    const order = {
      _id: orderId,
      userId: '507f1f77bcf86cd799439099',
      status: 'sented',
      save: jest.fn(),
    };
    Order.findById.mockResolvedValue(order);

    await expect(customerActionOrder(orderId, userId, 'succeeded'))
      .rejects.toThrow('Bạn không có quyền thao tác đơn hàng này');

    expect(order.save).not.toHaveBeenCalled();
  });

  test.each([
    ['pending', 'succeeded'],
    ['sented', 'cancelled'],
  ])('từ chối chuyển từ trạng thái %s bằng hành động %s không hợp lệ', async (status, action) => {
    const order = {
      _id: orderId,
      userId,
      status,
      save: jest.fn(),
    };
    Order.findById.mockResolvedValue(order);

    await expect(customerActionOrder(orderId, userId, action)).rejects.toThrow(
      `Không thể thực hiện hành động "${action}" khi đơn hàng đang ở trạng thái "${status}"`,
    );

    expect(order.save).not.toHaveBeenCalled();
  });

  test('xác nhận nhận hàng và đánh dấu đơn chưa thanh toán thành paid', async () => {
    const order = {
      _id: orderId,
      userId,
      status: 'sented',
      paymentStatus: 'pending',
      paidAt: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findById.mockResolvedValue(order);

    const result = await customerActionOrder(orderId, userId, 'succeeded');

    expect(order.status).toBe('succeeded');
    expect(order.paymentStatus).toBe('paid');
    expect(order.paidAt).toBeInstanceOf(Date);
    expect(order.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(order);
  });

  test('yêu cầu hoàn trả và giữ nguyên trạng thái thanh toán', async () => {
    const order = {
      _id: orderId,
      userId,
      status: 'sented',
      paymentStatus: 'paid',
      paidAt: new Date('2026-07-15T00:00:00.000Z'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const originalPaidAt = order.paidAt;
    Order.findById.mockResolvedValue(order);

    const result = await customerActionOrder(orderId, userId, 'returning');

    expect(order.status).toBe('returning');
    expect(order.paymentStatus).toBe('paid');
    expect(order.paidAt).toBe(originalPaidAt);
    expect(order.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(order);
  });
});
