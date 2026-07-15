jest.mock('../../../src/features/plant-diseases/plantDisease.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plants/plant.model', () => ({ findById: jest.fn() }));

const PlantDisease = require('../../../src/features/plant-diseases/plantDisease.model');
const Plant = require('../../../src/features/plants/plant.model');
const service = require('../../../src/features/plant-diseases/plantDisease.service');
const id = '507f1f77bcf86cd799439011';
const plantId = '507f1f77bcf86cd799439012';

function plantQuery(result) {
  return { select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(result) };
}

describe('plantDiseaseService CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  test('tạo bệnh cây chỉ với field được cho phép', async () => {
    Plant.findById.mockReturnValue(plantQuery({ _id: plantId }));
    PlantDisease.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    const result = await service.createPlantDisease({ plantId, name: 'Leaf spot', symptoms: 'Brown', ignored: true });

    expect(PlantDisease).toHaveBeenCalledWith({ plantId, name: 'Leaf spot', symptoms: 'Brown' });
    expect(result).not.toHaveProperty('ignored');
  });

  test('không tạo bệnh khi thiếu tên hoặc plant không tồn tại', async () => {
    await expect(service.createPlantDisease({ plantId, name: ' ' })).rejects.toMatchObject({ statusCode: 400 });
    Plant.findById.mockReturnValue(plantQuery(null));
    await expect(service.createPlantDisease({ plantId, name: 'Leaf spot' })).rejects.toMatchObject({ statusCode: 404 });
  });

  test('cập nhật bệnh chỉ với field được cho phép', async () => {
    PlantDisease.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: id }) });

    await service.updatePlantDisease(id, { name: 'Rust', treatment: 'Remove leaves', ignored: true });

    expect(PlantDisease.findByIdAndUpdate).toHaveBeenCalledWith(
      id, { name: 'Rust', treatment: 'Remove leaves' }, { new: true, runValidators: true },
    );
  });

  test('không cập nhật bệnh khi tên rỗng hoặc payload không có field hợp lệ', async () => {
    await expect(service.updatePlantDisease(id, { name: '' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.updatePlantDisease(id, { ignored: true })).rejects.toMatchObject({ statusCode: 400 });
  });
});
