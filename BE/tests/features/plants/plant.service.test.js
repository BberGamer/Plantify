jest.mock('../../../src/features/plants/plant.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});

jest.mock('../../../src/features/plants/plantCategory.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plant-diseases/plantDisease.model', () => ({ find: jest.fn() }));

const Plant = require('../../../src/features/plants/plant.model');
const PlantCategory = require('../../../src/features/plants/plantCategory.model');
const PlantDisease = require('../../../src/features/plant-diseases/plantDisease.model');
const {
  getAllPlants, createPlant, updatePlant, getAllTags,
  getAllCategories, createCategory, updateCategory, deleteCategory,
} = require('../../../src/features/plants/plant.service');

const plantId = '507f1f77bcf86cd799439011';
const categoryId = '507f1f77bcf86cd799439012';

function chain(result) {
  return {
    select: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('plantService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('lấy cây theo search, sort và pagination', async () => {
    const findChain = chain([]);
    Plant.find.mockReturnValue(findChain);
    Plant.countDocuments.mockResolvedValue(12);
    PlantDisease.find.mockReturnValue(chain([{ plantId }]));

    await getAllPlants({ search: 'yellow leaf', sort: 'popular', page: 2, limit: 5 });

    expect(Plant.find).toHaveBeenCalledWith(expect.objectContaining({ $or: expect.any(Array) }));
    expect(findChain.sort).toHaveBeenCalledWith({ viewCount: -1 });
    expect(findChain.skip).toHaveBeenCalledWith(5);
    expect(findChain.limit).toHaveBeenCalledWith(5);
  });

  test('báo lỗi khi pagination không hợp lệ', async () => {
    await expect(getAllPlants({ page: 0 })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lọc cây theo category và tag', async () => {
    Plant.find.mockReturnValue(chain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await getAllPlants({ category: categoryId, tag: 'indoor' });

    expect(Plant.find).toHaveBeenCalledWith({ categoryId, tags: 'indoor' });
  });

  test('lọc cây theo độ khó', async () => {
    Plant.find.mockReturnValue(chain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await getAllPlants({ difficulty: 'easy' });

    expect(Plant.find).toHaveBeenCalledWith({ difficultyLevel: 'easy' });
  });

  test('lọc cây theo ánh sáng', async () => {
    Plant.find.mockReturnValue(chain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await getAllPlants({ sunlight: 'low' });

    expect(Plant.find).toHaveBeenCalledWith({ sunlight: 'low' });
  });

  test('lọc cây theo nhu cầu tưới nước', async () => {
    Plant.find.mockReturnValue(chain([]));
    Plant.countDocuments.mockResolvedValue(0);

    await getAllPlants({ watering: 'weekly' });

    expect(Plant.find).toHaveBeenCalledWith({ watering: 'weekly' });
  });

  test('tạo cây khi category tồn tại và chặn tên thiếu', async () => {
    PlantCategory.findById.mockReturnValue(chain({ _id: categoryId }));
    Plant.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    await expect(createPlant({ name: 'Monstera', categoryId })).resolves.toEqual({ name: 'Monstera', categoryId });
    await expect(createPlant({ categoryId })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('cập nhật cây hợp lệ và chặn payload rỗng', async () => {
    Plant.findByIdAndUpdate.mockReturnValue(chain({ _id: plantId, name: 'New name' }));

    await updatePlant(plantId, { name: 'New name' });

    expect(Plant.findByIdAndUpdate).toHaveBeenCalledWith(
      plantId, { name: 'New name' }, { new: true, runValidators: true },
    );
    await expect(updatePlant(plantId, {})).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lấy tag không trùng và sắp xếp', async () => {
    Plant.find.mockReturnValue(chain([{ tags: ['indoor', 'easy'] }, { tags: ['easy', 'air'] }]));

    await expect(getAllTags()).resolves.toEqual(['air', 'easy', 'indoor']);
  });

  test('lấy category theo tên tăng dần', async () => {
    const categoryChain = chain([{ name: 'Indoor' }]);
    PlantCategory.find.mockReturnValue(categoryChain);

    await expect(getAllCategories()).resolves.toEqual([{ name: 'Indoor' }]);
    expect(categoryChain.sort).toHaveBeenCalledWith({ name: 1 });
  });

  test('tạo category với slug từ tên', async () => {
    PlantCategory.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    await expect(createCategory({ name: 'Cây Trong Nhà' })).resolves.toEqual({
      name: 'Cây Trong Nhà', slug: 'cay-trong-nha',
    });
    await expect(createCategory({ name: ' ' })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('cập nhật category với tên và slug mới', async () => {
    PlantCategory.findByIdAndUpdate.mockReturnValue(chain({ _id: categoryId, name: 'Outdoor' }));

    await updateCategory(categoryId, { name: 'Cây Ngoài Trời' });

    expect(PlantCategory.findByIdAndUpdate).toHaveBeenCalledWith(
      categoryId,
      { name: 'Cây Ngoài Trời', slug: 'cay-ngoai-troi' },
      { new: true, runValidators: true },
    );
    await expect(updateCategory(categoryId, { name: ' ' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(updateCategory(categoryId, {})).rejects.toMatchObject({ statusCode: 400 });
  });

  test('xóa category với ID hợp lệ', async () => {
    PlantCategory.findByIdAndDelete.mockResolvedValue({ _id: categoryId });

    await expect(deleteCategory(categoryId)).resolves.toEqual({ _id: categoryId });
    await expect(deleteCategory('invalid')).rejects.toMatchObject({ statusCode: 400 });
  });
});
