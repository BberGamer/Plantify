// userPlant.service.test.js - Kiểm tra CRUD, validation và ownership của My Garden
jest.mock('../../../src/features/my-garden/userPlant.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/plants/plant.model', () => ({
  findById: jest.fn(),
}));
jest.mock('../../../src/features/my-garden/careEvent.model', () => ({
  deleteMany: jest.fn(),
}));
jest.mock('../../../src/features/diagnosis-history/diagnosisHistory.model', () => ({
  updateMany: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  rm: jest.fn(),
}));

const mongoose = require('mongoose');
const fs = require('fs/promises');
const Plant = require('../../../src/features/plants/plant.model');
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const CareEvent = require('../../../src/features/my-garden/careEvent.model');
const DiagnosisHistory = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.model'
);
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
  let session;

  beforeEach(() => {
    jest.clearAllMocks();
    session = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn().mockResolvedValue(),
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
    CareEvent.deleteMany.mockResolvedValue({ deletedCount: 0 });
    DiagnosisHistory.updateMany.mockResolvedValue({ modifiedCount: 0 });
    fs.rm.mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('ignores coverImageUrl in create and update payloads', async () => {
    UserPlant.mockImplementation((data) => ({ save: jest.fn().mockResolvedValue(data) }));
    const created = await service.createUserPlant(userId, {
      name: 'Plant',
      coverImageUrl: 'https://external.example/image.jpg',
    });
    expect(created.coverImageUrl).toBe('');

    const updateQuery = query({ _id: userPlantId, notes: 'Updated' });
    UserPlant.findOneAndUpdate.mockReturnValue(updateQuery);
    await service.updateMyUserPlant(userId, userPlantId, {
      notes: 'Updated',
      coverImageUrl: 'https://external.example/image.jpg',
    });
    expect(UserPlant.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userPlantId, userId, status: 'active' },
      { notes: 'Updated' },
      { new: true, runValidators: true }
    );
  });

  test('tạo cây bằng userId từ token và bỏ qua userId trong body', async () => {
    Plant.findById.mockReturnValue(query({ _id: catalogPlantId }));
    UserPlant.mockImplementation((data) => ({
      save: jest.fn().mockResolvedValue(data),
    }));

    const result = await service.createUserPlant(userId, {
      userId: otherUserId,
      catalogPlantId,
      name: '  Monstera phòng khách  ',
      coverImageUrl: '',
      notes: 'Đặt cạnh cửa sổ',
      status: 'archived',
      ignored: true,
    });

    expect(UserPlant).toHaveBeenCalledWith({
      userId,
      catalogPlantId,
      name: 'Monstera phòng khách',
      coverImageUrl: '',
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

  test('hard delete cascade đúng dữ liệu thuộc user hiện tại', async () => {
    const deleteQuery = query({
      _id: userPlantId,
      userId,
    });
    UserPlant.findOneAndDelete.mockReturnValue(deleteQuery);

    const result = await service.deleteMyUserPlant(userId, userPlantId);

    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(UserPlant.findOneAndDelete).toHaveBeenCalledWith(
      { _id: userPlantId, userId },
      { session }
    );
    expect(CareEvent.deleteMany).toHaveBeenCalledWith(
      { userId, userPlantId },
      { session }
    );
    expect(DiagnosisHistory.updateMany).toHaveBeenCalledWith(
      { userId, userPlantId },
      { $set: { userPlantId: null } },
      { session }
    );
    expect(fs.rm).toHaveBeenCalledWith(
      expect.stringContaining(userPlantId),
      { recursive: true, force: true }
    );
    expect(session.endSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: userPlantId, userId });
  });

  test('không trả record của user khác khi đọc, sửa hoặc xóa', async () => {
    UserPlant.findOne.mockReturnValue(query(null));
    UserPlant.findOneAndUpdate.mockReturnValue(query(null));
    UserPlant.findOneAndDelete.mockReturnValue(query(null));

    await expect(
      service.getMyUserPlantById(otherUserId, userPlantId)
    ).resolves.toBeNull();
    await expect(
      service.updateMyUserPlant(otherUserId, userPlantId, { name: 'Không được' })
    ).resolves.toBeNull();
    await expect(
      service.deleteMyUserPlant(otherUserId, userPlantId)
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
    expect(UserPlant.findOneAndDelete).toHaveBeenCalledWith(
      { _id: userPlantId, userId: otherUserId },
      { session }
    );
    expect(CareEvent.deleteMany).not.toHaveBeenCalled();
    expect(DiagnosisHistory.updateMany).not.toHaveBeenCalled();
    expect(fs.rm).not.toHaveBeenCalled();
  });

  test('không xóa storage khi cascade transaction thất bại', async () => {
    UserPlant.findOneAndDelete.mockReturnValue(query({
      _id: userPlantId,
      userId,
    }));
    CareEvent.deleteMany.mockRejectedValue(new Error('Cascade failed'));

    await expect(
      service.deleteMyUserPlant(userId, userPlantId)
    ).rejects.toThrow('Cascade failed');

    expect(DiagnosisHistory.updateMany).not.toHaveBeenCalled();
    expect(fs.rm).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test('fallback an toàn khi MongoDB deployment không hỗ trợ transaction', async () => {
    const unsupportedError = new Error(
      'Transaction numbers are only allowed on a replica set member'
    );
    unsupportedError.code = 20;
    session.withTransaction.mockRejectedValue(unsupportedError);
    UserPlant.findOneAndDelete.mockReturnValue(query({
      _id: userPlantId,
      userId,
    }));

    await expect(
      service.deleteMyUserPlant(userId, userPlantId)
    ).resolves.toEqual({ _id: userPlantId, userId });

    expect(UserPlant.findOneAndDelete).toHaveBeenCalledWith(
      { _id: userPlantId, userId },
      {}
    );
    expect(CareEvent.deleteMany).toHaveBeenCalledWith(
      { userId, userPlantId },
      {}
    );
    expect(DiagnosisHistory.updateMany).toHaveBeenCalledWith(
      { userId, userPlantId },
      { $set: { userPlantId: null } },
      {}
    );
    expect(fs.rm).toHaveBeenCalledTimes(1);
  });

  test('PATCH chỉ có status bị từ chối vì client không được cập nhật status', async () => {
    await expect(
      service.updateMyUserPlant(userId, userPlantId, { status: 'archived' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('từ chối name, kiểu field và ObjectId không hợp lệ', async () => {
    await expect(
      service.createUserPlant(userId, { name: ' ' })
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
