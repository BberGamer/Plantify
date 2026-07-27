// userPlant.service.test.js - Kiểm tra CRUD, validation và ownership của My Garden
jest.mock('../../../src/features/my-garden/userPlant.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plants/plant.model', () => ({
  findById: jest.fn(),
}));

const Plant = require('../../../src/features/plants/plant.model');
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const service = require('../../../src/features/my-garden/userPlant.service');

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439099';
const userPlantId = '507f1f77bcf86cd799439012';
const catalogPlantId = '507f1f77bcf86cd799439013';

function query(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('userPlantService CRUD', () => {
  beforeEach(() => jest.clearAllMocks());

  test('tạo cây bằng userId từ token và bỏ qua userId trong body', async () => {
    Plant.findById.mockReturnValue(query({ _id: catalogPlantId }));
    UserPlant.mockImplementation((data) => ({
      save: jest.fn().mockResolvedValue(data),
    }));

    const result = await service.createUserPlant(userId, {
      userId: otherUserId,
      catalogPlantId,
      name: '  Monstera phòng khách  ',
      coverImageUrl: '/uploads/monstera.jpg',
      notes: 'Đặt cạnh cửa sổ',
      ignored: true,
    });

    expect(UserPlant).toHaveBeenCalledWith({
      userId,
      catalogPlantId,
      name: 'Monstera phòng khách',
      coverImageUrl: '/uploads/monstera.jpg',
      notes: 'Đặt cạnh cửa sổ',
      status: 'active',
    });
    expect(result.userId).toBe(userId);
    expect(result).not.toHaveProperty('ignored');
    expect(Plant.findById).toHaveBeenCalledWith(catalogPlantId);
  });

  test('cho phép tạo cây không liên kết catalog và áp dụng default', async () => {
    UserPlant.mockImplementation((data) => ({
      save: jest.fn().mockResolvedValue(data),
    }));

    const result = await service.createUserPlant(userId, { name: 'Cây của tôi' });

    expect(result).toEqual({
      userId,
      catalogPlantId: null,
      name: 'Cây của tôi',
      coverImageUrl: '',
      notes: '',
      status: 'active',
    });
    expect(Plant.findById).not.toHaveBeenCalled();
  });

  test('lấy danh sách active của đúng user và sắp xếp mới nhất', async () => {
    const findQuery = query([{ _id: userPlantId }]);
    UserPlant.find.mockReturnValue(findQuery);

    const result = await service.getMyUserPlants(userId);

    expect(UserPlant.find).toHaveBeenCalledWith({ userId, status: 'active' });
    expect(findQuery.populate).toHaveBeenCalledWith(
      'catalogPlantId',
      'name scientificName thumbnail images'
    );
    expect(findQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ _id: userPlantId }]);
  });

  test('lấy chi tiết bằng cả id, owner và trạng thái active', async () => {
    const detailQuery = query({ _id: userPlantId, userId });
    UserPlant.findOne.mockReturnValue(detailQuery);

    await service.getMyUserPlantById(userId, userPlantId);

    expect(UserPlant.findOne).toHaveBeenCalledWith({
      _id: userPlantId,
      userId,
      status: 'active',
    });
  });

  test('cập nhật field hợp lệ và không cho body đổi owner', async () => {
    Plant.findById.mockReturnValue(query({ _id: catalogPlantId }));
    const updateQuery = query({ _id: userPlantId, userId });
    UserPlant.findOneAndUpdate.mockReturnValue(updateQuery);

    await service.updateMyUserPlant(userId, userPlantId, {
      userId: otherUserId,
      catalogPlantId,
      name: '  Tên mới  ',
      notes: 'Ghi chú mới',
      ignored: true,
    });

    expect(UserPlant.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userPlantId, userId, status: 'active' },
      {
        catalogPlantId,
        name: 'Tên mới',
        notes: 'Ghi chú mới',
      },
      { new: true, runValidators: true }
    );
    expect(Plant.findById).toHaveBeenCalledWith(catalogPlantId);
  });

  test('soft delete chỉ archive cây active thuộc user hiện tại', async () => {
    const archiveQuery = query({
      _id: userPlantId,
      userId,
      status: 'archived',
    });
    UserPlant.findOneAndUpdate.mockReturnValue(archiveQuery);

    const result = await service.archiveMyUserPlant(userId, userPlantId);

    expect(UserPlant.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userPlantId, userId, status: 'active' },
      { $set: { status: 'archived' } },
      { new: true, runValidators: true }
    );
    expect(result.status).toBe('archived');
  });

  test('không trả record của user khác khi đọc, sửa hoặc xóa', async () => {
    UserPlant.findOne.mockReturnValue(query(null));
    UserPlant.findOneAndUpdate.mockReturnValue(query(null));

    await expect(
      service.getMyUserPlantById(otherUserId, userPlantId)
    ).resolves.toBeNull();
    await expect(
      service.updateMyUserPlant(otherUserId, userPlantId, { name: 'Không được' })
    ).resolves.toBeNull();
    await expect(
      service.archiveMyUserPlant(otherUserId, userPlantId)
    ).resolves.toBeNull();

    expect(UserPlant.findOne).toHaveBeenCalledWith({
      _id: userPlantId,
      userId: otherUserId,
      status: 'active',
    });
    expect(UserPlant.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: userPlantId, userId: otherUserId, status: 'active' },
      { name: 'Không được' },
      { new: true, runValidators: true }
    );
    expect(UserPlant.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: userPlantId, userId: otherUserId, status: 'active' },
      { $set: { status: 'archived' } },
      { new: true, runValidators: true }
    );
  });

  test('từ chối name, status, kiểu field và ObjectId không hợp lệ', async () => {
    await expect(
      service.createUserPlant(userId, { name: ' ' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.createUserPlant(userId, { name: 'Cây', status: 'deleted' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.createUserPlant(userId, { name: 'Cây', notes: 123 })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.createUserPlant(userId, {
        name: 'Cây',
        catalogPlantId: 'invalid',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyUserPlantById(userId, 'invalid')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.updateMyUserPlant(userId, userPlantId, { ignored: true })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('từ chối catalogPlantId không tồn tại khi tạo hoặc cập nhật', async () => {
    Plant.findById.mockReturnValue(query(null));

    await expect(
      service.createUserPlant(userId, { name: 'Cây', catalogPlantId })
    ).rejects.toMatchObject({ statusCode: 404 });
    await expect(
      service.updateMyUserPlant(userId, userPlantId, { catalogPlantId })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
