// tests/features/plants/plant.service.test.js
// Unit test cho plant.service.js - hàm getAllPlants (priority HIGH: complex query + disease search)

jest.mock('../../../src/features/plants/plant.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plant-diseases/plantDisease.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plants/plantCategory.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});

const Plant = require('../../../src/features/plants/plant.model');
const PlantDisease = require('../../../src/features/plant-diseases/plantDisease.model');
const plantService = require('../../../src/features/plants/plant.service');

describe('plantService.getAllPlants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Không có filter -> query rỗng, sort mặc định { name: 1 }, page=1, limit=9
  test('trả về danh sách rỗng với filter mặc định khi không có filter nào', async () => {
    Plant.find.mockReturnValue(makeChain([]));
    Plant.countDocuments.mockResolvedValue(0);

    const result = await plantService.getAllPlants();

    expect(Plant.find).toHaveBeenCalledWith({});
    expect(Plant.countDocuments).toHaveBeenCalledWith({});
    expect(result).toEqual({
      plants: [],
      total: 0,
      pages: 1,
      currentPage: 1,
    });
  });

  // 2. Filter category, tag, difficulty, sunlight, watering
  test('gộp tất cả filter đơn lẻ vào query', async () => {
    Plant.find.mockReturnValue(makeChain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({
      category: 'cat-1',
      tag: 'indoor',
      difficulty: 'easy',
      sunlight: 'low',
      watering: 'low',
    });

    expect(Plant.find).toHaveBeenCalledWith({
      categoryId: 'cat-1',
      tags: 'indoor',
      difficultyLevel: 'easy',
      sunlight: 'low',
      watering: 'low',
    });
  });

  // 3. Pagination: page=2, limit=5 -> ép limit về min 9, skip=9, currentPage=2
  // Service ép limit tối thiểu = 9 (Math.max(Number(limit)||9, 9))
  test('tính skip và currentPage đúng theo page (limit bị ép về min 9)', async () => {
    const chain = makeChain([{ _id: 'p1' }]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(20);

    const result = await plantService.getAllPlants({ page: 2, limit: 5 });

    expect(chain.skip).toHaveBeenCalledWith(9);
    expect(chain.limit).toHaveBeenCalledWith(9);
    expect(result.currentPage).toBe(2);
    expect(result.pages).toBe(3); // ceil(20/9)
    expect(result.total).toBe(20);
  });

  // 4. Pagination safeguard: page < 1, limit < 9 đều ép về min
  test('ép page<1 về 1 và limit<9 về 9', async () => {
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    const result = await plantService.getAllPlants({ page: -3, limit: 0 });

    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(9);
    expect(result.currentPage).toBe(1);
  });

  // 5. Sort options: za, popular, difficulty, mặc định
  test('sort = "za" -> { name: -1 }', async () => {
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ sort: 'za' });

    expect(chain.sort).toHaveBeenCalledWith({ name: -1 });
  });

  test('sort = "popular" -> { viewCount: -1 }', async () => {
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ sort: 'popular' });

    expect(chain.sort).toHaveBeenCalledWith({ viewCount: -1 });
  });

  test('sort = "difficulty" -> { difficultyLevel: 1 }', async () => {
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ sort: 'difficulty' });

    expect(chain.sort).toHaveBeenCalledWith({ difficultyLevel: 1 });
  });

  test('không truyền sort -> mặc định { name: 1 }', async () => {
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants();

    expect(chain.sort).toHaveBeenCalledWith({ name: 1 });
  });

  // 6. Search: keyword được đưa vào $or của Plant (name/scientificName/commonNames)
  test('search không match disease nào -> $or chỉ có 3 field plant', async () => {
    PlantDisease.find.mockReturnValue(makeChain([]));
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ search: 'monstera' });

    expect(PlantDisease.find).toHaveBeenCalled();
    expect(Plant.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: 'monstera', $options: 'i' } },
        { scientificName: { $regex: 'monstera', $options: 'i' } },
        { commonNames: { $regex: 'monstera', $options: 'i' } },
      ],
    });
  });

  // 7. Search: keyword match disease -> thêm _id $in diseasePlantIds vào $or
  test('search match disease -> thêm điều kiện _id $in diseasePlantIds', async () => {
    PlantDisease.find.mockReturnValue(makeChain([
      { plantId: '64a000000000000000000001' },
      { plantId: '64a000000000000000000002' },
      { plantId: '64a000000000000000000001' }, // trùng -> phải dedupe
    ]));
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ search: 'vàng lá' });

    const callArg = Plant.find.mock.calls[0][0];
    expect(callArg.$or).toHaveLength(4);
    expect(callArg.$or[3]).toEqual({
      _id: { $in: ['64a000000000000000000001', '64a000000000000000000002'] },
    });
  });

  // 8. Search + filter khác vẫn gộp đúng
  test('search kết hợp category vẫn merge filter đúng', async () => {
    PlantDisease.find.mockReturnValue(makeChain([]));
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ search: 'xương rồng', category: 'cat-1' });

    expect(Plant.find).toHaveBeenCalledWith({
      categoryId: 'cat-1',
      $or: [
        { name: { $regex: 'xương rồng', $options: 'i' } },
        { scientificName: { $regex: 'xương rồng', $options: 'i' } },
        { commonNames: { $regex: 'xương rồng', $options: 'i' } },
      ],
    });
  });

  // 9. Pages safeguard: total=0 vẫn có pages=1
  test('total=0 -> pages=1 (không bị 0)', async () => {
    Plant.find.mockReturnValue(makeChain([]));
    Plant.countDocuments.mockResolvedValue(0);

    const result = await plantService.getAllPlants({ limit: 9 });

    expect(result.pages).toBe(1);
  });

  // 10. Search rỗng / chỉ whitespace -> không query disease, không thêm $or
  test('search là chuỗi rỗng -> bỏ qua nhánh search', async () => {
    Plant.find.mockReturnValue(makeChain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ search: '   ' });

    expect(PlantDisease.find).not.toHaveBeenCalled();
    expect(Plant.find).toHaveBeenCalledWith({});
  });

  // 11. Search không phải string (số) -> vẫn xử lý, không lỗi
  test('search là số vẫn ép về string để query regex', async () => {
    PlantDisease.find.mockReturnValue(makeChain([]));
    Plant.find.mockReturnValue(makeChain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants({ search: 123 });

    const callArg = Plant.find.mock.calls[0][0];
    expect(callArg.$or[0].name.$regex).toBe('123');
  });

  // 12. Lean được gọi cuối chain
  test('cuối chain find có gọi lean()', async () => {
    const chain = makeChain([]);
    Plant.find.mockReturnValue(chain);
    Plant.countDocuments.mockResolvedValue(0);

    await plantService.getAllPlants();

    expect(chain.lean).toHaveBeenCalled();
  });

  // 13. return shape đầy đủ 4 trường
  // limit=5 bị ép về 9, total=20 -> pages = ceil(20/9) = 3
  test('trả về object đúng shape { plants, total, pages, currentPage }', async () => {
    const fakePlants = [{ _id: 'p1', name: 'A' }, { _id: 'p2', name: 'B' }];
    Plant.find.mockReturnValue(makeChain(fakePlants));
    Plant.countDocuments.mockResolvedValue(20);

    const result = await plantService.getAllPlants({ limit: 5 });

    expect(Object.keys(result).sort()).toEqual(
      ['currentPage', 'pages', 'plants', 'total']
    );
    expect(result.plants).toBe(fakePlants);
    expect(result.total).toBe(20);
    expect(result.pages).toBe(3);
    expect(result.currentPage).toBe(1);
  });
});

// Helper: tạo chainable mock trả về findResult khi gọi lean()
function makeChain(findResult) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn(() => Promise.resolve(findResult)),
  };
  return chain;
}