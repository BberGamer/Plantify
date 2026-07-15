jest.mock('../../../src/features/care-guides/careGuide.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plants/plant.model', () => ({ findById: jest.fn() }));

const CareGuide = require('../../../src/features/care-guides/careGuide.model');
const Plant = require('../../../src/features/plants/plant.model');
const service = require('../../../src/features/care-guides/careGuide.service');
const id = '507f1f77bcf86cd799439011';
const plantId = '507f1f77bcf86cd799439012';

function plantQuery(result) {
  return { select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(result) };
}

describe('careGuideService CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  test('tạo care guide chỉ với field được cho phép', async () => {
    Plant.findById.mockReturnValue(plantQuery({ _id: plantId }));
    CareGuide.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));

    const result = await service.createCareGuide({ plantId, watering: 'Weekly', ignored: true });

    expect(CareGuide).toHaveBeenCalledWith({ plantId, watering: 'Weekly' });
    expect(result).not.toHaveProperty('ignored');
  });

  test('không tạo care guide khi thiếu plant hoặc plant không tồn tại', async () => {
    await expect(service.createCareGuide({ watering: 'Weekly' })).rejects.toMatchObject({ statusCode: 400 });
    Plant.findById.mockReturnValue(plantQuery(null));
    await expect(service.createCareGuide({ plantId, watering: 'Weekly' })).rejects.toMatchObject({ statusCode: 404 });
  });

  test('cập nhật care guide chỉ với field được cho phép', async () => {
    CareGuide.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: id }) });

    await service.updateCareGuide(id, { watering: 'Daily', pruning: 'Monthly', ignored: true });

    expect(CareGuide.findByIdAndUpdate).toHaveBeenCalledWith(
      id, { watering: 'Daily', pruning: 'Monthly' }, { new: true, runValidators: true },
    );
  });

  test('không cập nhật care guide khi plant rỗng hoặc payload không hợp lệ', async () => {
    await expect(service.updateCareGuide(id, { plantId: '' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.updateCareGuide(id, { ignored: true })).rejects.toMatchObject({ statusCode: 400 });
  });
});
