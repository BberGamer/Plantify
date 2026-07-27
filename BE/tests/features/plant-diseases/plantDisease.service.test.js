jest.mock('../../../src/features/plant-diseases/plantDisease.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plants/plant.model', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
}));

const PlantDisease = require('../../../src/features/plant-diseases/plantDisease.model');
const Plant = require('../../../src/features/plants/plant.model');
const service = require('../../../src/features/plant-diseases/plantDisease.service');
const id = '507f1f77bcf86cd799439011';
const plantId = '507f1f77bcf86cd799439012';
const productId = '507f1f77bcf86cd799439013';
const secondPlantId = '507f1f77bcf86cd799439014';

describe('plantDiseaseService CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  test('tạo bệnh cây với canonical key và các field dạng mảng', async () => {
    Plant.countDocuments.mockResolvedValue(2);
    PlantDisease.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    const result = await service.createPlantDisease({
      affectedPlantIds: [plantId, secondPlantId, plantId],
      name: 'Bệnh Đốm Lá',
      aliases: ['Leaf spot', 'leaf spot', 'Đốm lá'],
      category: 'Disease',
      symptoms: 'Đốm nâu\nLá vàng',
      causes: ['Nấm'],
      treatment: 'Cắt lá bệnh',
      prevention: 'Giữ cây thông thoáng',
      recommendedProducts: [productId, productId],
      ignored: true,
    });

    expect(PlantDisease).toHaveBeenCalledWith({
      affectedPlantIds: [plantId, secondPlantId],
      name: 'Bệnh Đốm Lá',
      diseaseKey: 'benh-dom-la',
      aliases: ['Leaf spot', 'Đốm lá'],
      category: 'disease',
      symptoms: ['Đốm nâu', 'Lá vàng'],
      causes: ['Nấm'],
      treatments: ['Cắt lá bệnh'],
      preventions: ['Giữ cây thông thoáng'],
      recommendedProducts: [productId],
    });
    expect(result).not.toHaveProperty('ignored');
    expect(Plant.countDocuments).toHaveBeenCalledWith({
      _id: { $in: [plantId, secondPlantId] },
    });
  });

  test('cho phép không chọn cây và chặn cây không tồn tại', async () => {
    PlantDisease.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    await expect(
      service.createPlantDisease({ name: 'Leaf spot', affectedPlantIds: [] })
    ).resolves.toMatchObject({ affectedPlantIds: [] });
    await expect(
      service.createPlantDisease({ name: ' ' })
    ).rejects.toMatchObject({ statusCode: 400 });

    Plant.countDocuments.mockResolvedValue(1);
    await expect(
      service.createPlantDisease({
        name: 'Rust',
        affectedPlantIds: [plantId, secondPlantId],
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('cập nhật bệnh chỉ với field được cho phép', async () => {
    Plant.countDocuments.mockResolvedValue(1);
    PlantDisease.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: id }) });

    await service.updatePlantDisease(id, {
      name: 'Rust',
      diseaseKey: 'Leaf Rust',
      treatment: 'Remove leaves',
      affectedPlantIds: [plantId],
      isActive: false,
      ignored: true,
    });

    expect(PlantDisease.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      {
        name: 'Rust',
        diseaseKey: 'leaf-rust',
        treatments: ['Remove leaves'],
        affectedPlantIds: [plantId],
        isActive: false,
      },
      { new: true, runValidators: true },
    );
    expect(Plant.countDocuments).toHaveBeenCalledWith({
      _id: { $in: [plantId] },
    });
  });

  test('không cập nhật bệnh khi tên rỗng hoặc payload không có field hợp lệ', async () => {
    await expect(service.updatePlantDisease(id, { name: '' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.updatePlantDisease(id, { ignored: true })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('chặn category, product ID và kiểu isActive không hợp lệ', async () => {
    await expect(
      service.updatePlantDisease(id, { category: 'fungus' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.updatePlantDisease(id, { recommendedProducts: ['invalid-id'] })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.updatePlantDisease(id, { affectedPlantIds: 'invalid' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.updatePlantDisease(id, { affectedPlantIds: ['invalid-id'] })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.updatePlantDisease(id, { isActive: 'false' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('trả lỗi conflict khi diseaseKey bị trùng', async () => {
    PlantDisease.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue({
        code: 11000,
        keyPattern: { diseaseKey: 1 },
      }),
    }));

    await expect(
      service.createPlantDisease({ name: 'Leaf spot' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('chuyển payload plantId cũ sang affectedPlantIds', async () => {
    Plant.countDocuments.mockResolvedValue(1);
    PlantDisease.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    await service.createPlantDisease({ plantId, name: 'Legacy disease' });

    expect(PlantDisease).toHaveBeenCalledWith(expect.objectContaining({
      affectedPlantIds: [plantId],
    }));
    expect(PlantDisease.mock.calls[0][0]).not.toHaveProperty('plantId');
  });
});
