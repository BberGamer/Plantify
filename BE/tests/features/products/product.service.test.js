// product.service.test.js - Unit test cho lọc, tạo và cập nhật sản phẩm
jest.mock('../../../src/features/products/product.model', () => {
  const Product = jest.fn();
  Product.find = jest.fn();
  Product.countDocuments = jest.fn();
  Product.findByIdAndUpdate = jest.fn();
  return Product;
});

jest.mock('../../../src/features/products/product-category.model', () => {
  const ProductCategory = jest.fn();
  ProductCategory.findById = jest.fn();
  ProductCategory.findOne = jest.fn();
  return ProductCategory;
});

jest.mock('../../../src/features/orders/order.model', () => ({
  aggregate: jest.fn(),
}));

const Product = require('../../../src/features/products/product.model');
const ProductCategory = require('../../../src/features/products/product-category.model');
const Order = require('../../../src/features/orders/order.model');
const {
  getAllProducts,
  createProduct,
  updateProduct,
} = require('../../../src/features/products/product.service');

const productId = '507f1f77bcf86cd799439011';
const categoryId = '507f1f77bcf86cd799439012';

function queryChain(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

function validProduct(overrides = {}) {
  return {
    name: '  Phân bón hữu cơ  ',
    categoryId,
    price: '120000',
    stock: '8',
    soldCount: '2',
    brand: '  Plantify  ',
    thumbnail: '  image.jpg  ',
    description: '  Mô tả sản phẩm  ',
    usageGuide: '  Dùng mỗi tuần  ',
    tags: ['organic', 'fertilizer'],
    ...overrides,
  };
}

describe('productService.getAllProducts', () => {
  beforeEach(() => {
    Product.find.mockReturnValue(queryChain([]));
    Product.countDocuments.mockResolvedValue(0);
    ProductCategory.findOne.mockReturnValue(queryChain(null));
    Order.aggregate.mockResolvedValue([]);
  });

  test('tìm kiếm theo tên hoặc mô tả và chỉ lấy sản phẩm đang hoạt động', async () => {
    const chain = queryChain([]);
    Product.find.mockReturnValue(chain);

    await getAllProducts({ search: 'cây xanh' });

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      $or: [
        { name: { $regex: 'cây xanh', $options: 'i' } },
        { description: { $regex: 'cây xanh', $options: 'i' } },
      ],
    });
  });

  test('lọc khoảng giá và rating hợp lệ', async () => {
    await getAllProducts({ minPrice: '50000', maxPrice: '200000', minRating: '4' });

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      price: { $gte: 50000, $lte: 200000 },
      ratingAverage: { $gte: 4 },
    });
  });

  test('từ chối khoảng giá đảo ngược và rating vượt quá 5', async () => {
    await expect(getAllProducts({ minPrice: 200, maxPrice: 100 })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(getAllProducts({ minRating: 6 })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lọc category theo ObjectId', async () => {
    await getAllProducts({ category: categoryId });

    const query = Product.find.mock.calls[0][0];
    expect(String(query.categoryId)).toBe(categoryId);
  });

  test('tìm category theo slug hoặc tên trước khi lọc', async () => {
    const foundCategory = { _id: categoryId, slug: 'phan-bon' };
    ProductCategory.findOne.mockReturnValue(queryChain(foundCategory));

    await getAllProducts({ category: 'phan-bon' });

    expect(ProductCategory.findOne).toHaveBeenCalledWith({
      $or: [
        { slug: 'phan-bon' },
        { name: { $regex: '^phan-bon$', $options: 'i' } },
      ],
    });
    expect(Product.find).toHaveBeenCalledWith({ isActive: true, categoryId });
  });

  test('trả danh sách rỗng ngay khi không tìm thấy category', async () => {
    ProductCategory.findOne.mockReturnValue(queryChain(null));

    await expect(getAllProducts({ category: 'khong-ton-tai', page: 2 })).resolves.toEqual({
      products: [],
      total: 0,
      pages: 0,
      currentPage: 2,
    });
    expect(Product.find).not.toHaveBeenCalled();
  });

  test('áp dụng sort và pagination, đồng thời trả metadata chính xác', async () => {
    const products = [{ _id: productId, name: 'Product', soldCount: 1 }];
    const chain = queryChain(products);
    Product.find.mockReturnValue(chain);
    Product.countDocuments.mockResolvedValue(13);

    const result = await getAllProducts({ sortBy: 'price-high', page: 2, limit: 5 });

    expect(chain.sort).toHaveBeenCalledWith({ price: -1 });
    expect(chain.skip).toHaveBeenCalledWith(5);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      products: [{ ...products[0], soldCount: 1 }],
      total: 13,
      pages: 3,
      currentPage: 2,
    });
  });

  test.each([
    ['newest', { createdAt: -1 }],
    ['price-low', { price: 1 }],
    ['rating', { ratingAverage: -1 }],
    [undefined, { soldCount: -1, ratingCount: -1 }],
  ])('sắp xếp đúng với sortBy=%s', async (sortBy, expectedSort) => {
    const chain = queryChain([]);
    Product.find.mockReturnValue(chain);

    await getAllProducts({ sortBy });

    expect(chain.sort).toHaveBeenCalledWith(expectedSort);
  });
});

describe('productService.createProduct', () => {
  beforeEach(() => {
    ProductCategory.findById.mockReturnValue(queryChain({ _id: categoryId }));
  });

  test('validate tên, category và giá trước khi truy vấn DB', async () => {
    await expect(createProduct({ categoryId, price: 10 })).rejects.toThrow('Tên sản phẩm là bắt buộc');
    await expect(createProduct({ name: 'Product', price: 10 })).rejects.toThrow('ID danh mục là bắt buộc');
    await expect(createProduct({ name: 'Product', categoryId })).rejects.toThrow('Giá sản phẩm là bắt buộc');
    expect(ProductCategory.findById).not.toHaveBeenCalled();
  });

  test('từ chối category ID không hợp lệ hoặc không tồn tại', async () => {
    await expect(createProduct(validProduct({ categoryId: 'invalid' }))).rejects.toMatchObject({
      statusCode: 400,
    });

    ProductCategory.findById.mockReturnValue(queryChain(null));
    await expect(createProduct(validProduct())).rejects.toMatchObject({ statusCode: 404 });
  });

  test('chuẩn hóa dữ liệu và lưu sản phẩm khi category tồn tại', async () => {
    const save = jest.fn().mockResolvedValue({ _id: productId });
    Product.mockImplementation((data) => ({ ...data, save }));

    await expect(createProduct(validProduct())).resolves.toEqual({ _id: productId });

    expect(Product).toHaveBeenCalledWith({
      name: 'Phân bón hữu cơ',
      categoryId,
      price: 120000,
      stock: 8,
      soldCount: 2,
      brand: 'Plantify',
      thumbnail: 'image.jpg',
      description: 'Mô tả sản phẩm',
      usageGuide: 'Dùng mỗi tuần',
      tags: ['organic', 'fertilizer'],
    });
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe('productService.updateProduct', () => {
  beforeEach(() => {
    ProductCategory.findById.mockReturnValue(queryChain({ _id: categoryId }));
    Product.findByIdAndUpdate.mockReturnValue(queryChain({ _id: productId }));
  });

  test('từ chối product ID không hợp lệ', async () => {
    await expect(updateProduct('invalid', { name: 'Product' })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('từ chối tên hoặc category rỗng', async () => {
    await expect(updateProduct(productId, { name: '   ' })).rejects.toThrow('Tên sản phẩm không được để trống');
    await expect(updateProduct(productId, { categoryId: '   ' })).rejects.toThrow('ID danh mục không được để trống');
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('kiểm tra category tồn tại trước khi cập nhật', async () => {
    ProductCategory.findById.mockReturnValue(queryChain(null));

    await expect(updateProduct(productId, { categoryId })).rejects.toMatchObject({ statusCode: 404 });
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('chuẩn hóa các field trước khi cập nhật', async () => {
    const result = await updateProduct(productId, validProduct({ tags: 'not-an-array' }));

    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
      productId,
      {
        name: 'Phân bón hữu cơ',
        categoryId,
        price: 120000,
        stock: 8,
        soldCount: 2,
        brand: 'Plantify',
        thumbnail: 'image.jpg',
        description: 'Mô tả sản phẩm',
        usageGuide: 'Dùng mỗi tuần',
        tags: [],
      },
      { new: true, runValidators: true },
    );
    expect(result).toEqual({ _id: productId });
  });
});
