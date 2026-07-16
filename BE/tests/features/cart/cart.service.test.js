jest.mock('../../../src/features/cart/cart.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../../src/features/products/product.model', () => ({ findById: jest.fn() }));

const Cart = require('../../../src/features/cart/cart.model');
const Product = require('../../../src/features/products/product.model');
const { addItem, updateItem } = require('../../../src/features/cart/cart.service');

const userId = '507f1f77bcf86cd799439011';
const productId = '507f1f77bcf86cd799439012';

function makeProduct(overrides = {}) {
  return {
    _id: productId,
    name: 'Monstera',
    price: 150000,
    stock: 10,
    thumbnail: 'monstera.jpg',
    brand: 'Plantify',
    isActive: true,
    ...overrides,
  };
}

function makeCart(items = [], product = makeProduct()) {
  const cart = {
    userId,
    items,
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn(),
  };

  cart.populate.mockImplementation(async () => {
    cart.items.forEach((item) => {
      if (String(item.productId) === productId) item.productId = product;
    });
    return cart;
  });

  return cart;
}

describe('cartService.addItem', () => {
  beforeEach(() => jest.clearAllMocks());

  test('từ chối Product ID không hợp lệ', async () => {
    await expect(addItem(userId, 'invalid-id', 1)).rejects.toMatchObject({
      message: 'Product ID khong hop le',
      statusCode: 400,
    });

    expect(Product.findById).not.toHaveBeenCalled();
    expect(Cart.findOne).not.toHaveBeenCalled();
  });

  test.each([
    ['không tồn tại', null],
    ['đã ngừng bán', makeProduct({ isActive: false })],
  ])('từ chối sản phẩm %s', async (_description, product) => {
    Product.findById.mockResolvedValue(product);

    await expect(addItem(userId, productId, 1)).rejects.toMatchObject({
      message: 'Khong tim thay san pham',
      statusCode: 404,
    });

    expect(Cart.findOne).not.toHaveBeenCalled();
  });

  test('từ chối sản phẩm hết hàng', async () => {
    Product.findById.mockResolvedValue(makeProduct({ stock: 0 }));

    await expect(addItem(userId, productId, 1)).rejects.toMatchObject({
      message: 'San pham da het hang',
      statusCode: 400,
    });

    expect(Cart.findOne).not.toHaveBeenCalled();
  });

  test('tạo giỏ hàng mới rồi thêm sản phẩm với giá trị mặc định', async () => {
    const product = makeProduct();
    const cart = makeCart([], product);
    Product.findById.mockResolvedValue(product);
    Cart.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(cart);
    Cart.create.mockResolvedValue(cart);

    const result = await addItem(userId, productId);

    expect(Cart.create).toHaveBeenCalledWith({ userId, items: [] });
    expect(cart.items).toEqual([
      expect.objectContaining({ productId: product, quantity: 1, selected: true }),
    ]);
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ totalItems: 1 });
  });

  test('thêm sản phẩm mới vào giỏ hàng hiện có', async () => {
    const product = makeProduct();
    const cart = makeCart([], product);
    Product.findById.mockResolvedValue(product);
    Cart.findOne.mockResolvedValue(cart);

    const result = await addItem(userId, productId, 3, false);

    expect(cart.items[0]).toMatchObject({ productId: product, quantity: 3, selected: false });
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ totalItems: 3 });
    expect(result.items[0]).toMatchObject({ id: productId, quantity: 3, selected: false });
  });

  test('gộp số lượng và cập nhật selected khi sản phẩm đã có trong giỏ', async () => {
    const product = makeProduct();
    const existingItem = { productId, quantity: 2, selected: false };
    const cart = makeCart([existingItem], product);
    Product.findById.mockResolvedValue(product);
    Cart.findOne.mockResolvedValue(cart);

    const result = await addItem(userId, productId, 3, true);

    expect(cart.items).toHaveLength(1);
    expect(existingItem).toMatchObject({ productId: product, quantity: 5, selected: true });
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result.totalItems).toBe(5);
  });

  test.each([
    ['sản phẩm mới', [], 20],
    ['sản phẩm đã có', [{ productId, quantity: 4, selected: true }], 8],
  ])('giới hạn số lượng theo tồn kho đối với %s', async (_description, items, quantity) => {
    const product = makeProduct({ stock: 6 });
    const cart = makeCart(items, product);
    Product.findById.mockResolvedValue(product);
    Cart.findOne.mockResolvedValue(cart);

    const result = await addItem(userId, productId, quantity);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(6);
    expect(result.totalItems).toBe(6);
  });
});

describe('cartService.updateItem', () => {
  beforeEach(() => jest.clearAllMocks());

  test('từ chối Product ID không hợp lệ', async () => {
    await expect(updateItem(userId, 'invalid-id', { quantity: 2 })).rejects.toMatchObject({
      message: 'Product ID khong hop le',
      statusCode: 400,
    });

    expect(Cart.findOne).not.toHaveBeenCalled();
    expect(Product.findById).not.toHaveBeenCalled();
  });

  test('từ chối sản phẩm không có trong giỏ hàng', async () => {
    const cart = makeCart([]);
    Cart.findOne.mockResolvedValue(cart);

    await expect(updateItem(userId, productId, { quantity: 2 })).rejects.toMatchObject({
      message: 'Khong tim thay san pham trong gio hang',
      statusCode: 404,
    });

    expect(Product.findById).not.toHaveBeenCalled();
    expect(cart.save).not.toHaveBeenCalled();
  });

  test('cập nhật số lượng khi số lượng yêu cầu nhỏ hơn tồn kho', async () => {
    const product = makeProduct({ stock: 10 });
    const item = { productId, quantity: 1, selected: true };
    const cart = makeCart([item], product);
    Cart.findOne.mockResolvedValue(cart);
    Product.findById.mockResolvedValue(product);

    const result = await updateItem(userId, productId, { quantity: 4 });

    expect(Product.findById).toHaveBeenCalledWith(productId);
    expect(item.quantity).toBe(4);
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result.totalItems).toBe(4);
  });

  test('giới hạn số lượng bằng tồn kho khi số lượng yêu cầu vượt tồn kho', async () => {
    const product = makeProduct({ stock: 6 });
    const item = { productId, quantity: 2, selected: true };
    const cart = makeCart([item], product);
    Cart.findOne.mockResolvedValue(cart);
    Product.findById.mockResolvedValue(product);

    const result = await updateItem(userId, productId, { quantity: 20 });

    expect(item.quantity).toBe(6);
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result.items[0]).toMatchObject({ quantity: 6, stock: 6 });
    expect(result.totalItems).toBe(6);
  });

  test.each([
    ['bằng 0', 0],
    ['số âm', -2],
    ['không phải số', 'abc'],
  ])('chuẩn hóa số lượng %s về 1', async (_description, quantity) => {
    const product = makeProduct({ stock: 10 });
    const item = { productId, quantity: 3, selected: true };
    const cart = makeCart([item], product);
    Cart.findOne.mockResolvedValue(cart);
    Product.findById.mockResolvedValue(product);

    const result = await updateItem(userId, productId, { quantity });

    expect(item.quantity).toBe(1);
    expect(result.totalItems).toBe(1);
  });

  test('làm tròn xuống khi số lượng là số thập phân', async () => {
    const product = makeProduct({ stock: 10 });
    const item = { productId, quantity: 1, selected: true };
    const cart = makeCart([item], product);
    Cart.findOne.mockResolvedValue(cart);
    Product.findById.mockResolvedValue(product);

    const result = await updateItem(userId, productId, { quantity: 3.8 });

    expect(item.quantity).toBe(3);
    expect(result.totalItems).toBe(3);
  });

  test('chỉ cập nhật selected mà không truy vấn tồn kho', async () => {
    const product = makeProduct();
    const item = { productId, quantity: 2, selected: true };
    const cart = makeCart([item], product);
    Cart.findOne.mockResolvedValue(cart);

    const result = await updateItem(userId, productId, { selected: false });

    expect(Product.findById).not.toHaveBeenCalled();
    expect(item.selected).toBe(false);
    expect(item.quantity).toBe(2);
    expect(cart.save).toHaveBeenCalledTimes(1);
    expect(result.items[0].selected).toBe(false);
  });
});
