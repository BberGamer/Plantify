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
jest.mock('../../../src/features/notifications/notification.model', () => ({
  Notification: {
    deleteMany: jest.fn(),
  },
  PLANT_CARE_NOTIFICATION_TYPES: [
    'plant_watering_due',
    'plant_fertilizing_due',
  ],
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
const {
  Notification,
  PLANT_CARE_NOTIFICATION_TYPES,
} = require('../../../src/features/notifications/notification.model');
const service = require('../../../src/features/my-garden/userPlant.service');

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439099';
const userPlantId = '507f1f77bcf86cd799439012';
const catalogPlantId = '507f1f77bcf86cd799439013';
const defaultSchedule = {
  enabled: false,
  frequencyDays: null,
  lastCompletedAt: null,
  nextDueAt: null,
};

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
    Notification.deleteMany.mockResolvedValue({ deletedCount: 0 });
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
      wateringSchedule: defaultSchedule,
      fertilizingSchedule: defaultSchedule,
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
      wateringSchedule: defaultSchedule,
      fertilizingSchedule: defaultSchedule,
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
    expect(Notification.deleteMany).toHaveBeenCalledWith(
      {
        userPlantId,
        type: { $in: PLANT_CARE_NOTIFICATION_TYPES },
      },
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

  test('từ chối xóa nếu MongoDB không hỗ trợ transaction và không chạy fallback', async () => {
    const unsupportedError = new Error(
      'Transaction numbers are only allowed on a replica set member'
    );
    unsupportedError.code = 20;
    session.withTransaction.mockRejectedValue(unsupportedError);
    await expect(
      service.deleteMyUserPlant(userId, userPlantId)
    ).rejects.toMatchObject({ statusCode: 503 });

    expect(UserPlant.findOneAndDelete).not.toHaveBeenCalled();
    expect(CareEvent.deleteMany).not.toHaveBeenCalled();
    expect(DiagnosisHistory.updateMany).not.toHaveBeenCalled();
    expect(Notification.deleteMany).not.toHaveBeenCalled();
    expect(fs.rm).not.toHaveBeenCalled();
  });

  test('cleanup album lỗi vẫn trả hard delete thành công và ghi log', async () => {
    UserPlant.findOneAndDelete.mockReturnValue(query({
      _id: userPlantId,
      userId,
    }));
    fs.rm.mockRejectedValue(new Error('Storage unavailable'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      service.deleteMyUserPlant(userId, userPlantId)
    ).resolves.toEqual({ _id: userPlantId, userId });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Không thể xóa thư mục album'),
      expect.any(Error)
    );
  });

  test('validates embedded schedules and ignores client lastCompletedAt', async () => {
    const updateQuery = query({ _id: userPlantId });
    UserPlant.findOneAndUpdate.mockReturnValue(updateQuery);

    await service.updateMyUserPlant(userId, userPlantId, {
      wateringSchedule: {
        enabled: true,
        frequencyDays: 3,
        nextDueAt: '2026-08-01T00:00:00.000Z',
        lastCompletedAt: '2026-07-01T00:00:00.000Z',
      },
      fertilizingSchedule: {
        enabled: false,
        frequencyDays: null,
        nextDueAt: null,
        lastCompletedAt: '2026-07-01T00:00:00.000Z',
      },
    });

    expect(UserPlant.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userPlantId, userId, status: 'active' },
      {
        'wateringSchedule.enabled': true,
        'wateringSchedule.frequencyDays': 3,
        'wateringSchedule.nextDueAt': new Date('2026-08-01T00:00:00.000Z'),
        'fertilizingSchedule.enabled': false,
        'fertilizingSchedule.frequencyDays': null,
        'fertilizingSchedule.nextDueAt': null,
      },
      { new: true, runValidators: true }
    );
  });

  test('rejects invalid schedule configuration and date boundaries', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-27T12:00:00.000Z'));
    try {
      await expect(service.updateMyUserPlant(userId, userPlantId, {
        wateringSchedule: {
          enabled: true,
          frequencyDays: 0,
          nextDueAt: '2026-08-01T00:00:00.000Z',
        },
      })).rejects.toMatchObject({ statusCode: 400 });
      await expect(service.updateMyUserPlant(userId, userPlantId, {
        wateringSchedule: {
          enabled: true,
          frequencyDays: 3,
          nextDueAt: null,
        },
      })).rejects.toMatchObject({ statusCode: 400 });
      await expect(service.updateMyUserPlant(userId, userPlantId, {
        wateringSchedule: {
          enabled: true,
          frequencyDays: 3,
          nextDueAt: '2026-07-27T11:59:59.999Z',
        },
      })).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringMatching(/quá khứ/),
      });
      await expect(service.updateMyUserPlant(userId, userPlantId, {
        wateringSchedule: {
          enabled: true,
          frequencyDays: 3,
          nextDueAt: '2027-07-27T12:00:00.001Z',
        },
      })).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringMatching(/12 tháng/),
      });
    } finally {
      jest.useRealTimers();
    }
  });

  test('accepts schedule nextDueAt at now and exactly 12 months', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-27T12:00:00.000Z'));
    const updateQuery = query({ _id: userPlantId });
    UserPlant.findOneAndUpdate.mockReturnValue(updateQuery);
    try {
      await expect(service.updateMyUserPlant(userId, userPlantId, {
        wateringSchedule: {
          enabled: true,
          frequencyDays: 1,
          nextDueAt: '2026-07-27T12:00:00.000Z',
        },
      })).resolves.toBeTruthy();
      await expect(service.updateMyUserPlant(userId, userPlantId, {
        fertilizingSchedule: {
          enabled: true,
          frequencyDays: 365,
          nextDueAt: '2027-07-27T12:00:00.000Z',
        },
      })).resolves.toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
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
