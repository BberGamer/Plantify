jest.mock('../../../src/features/my-garden/careEvent.model', () => {
  const model = {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };
  model.CARE_EVENT_TYPES = [
    'watering',
    'fertilizing',
    'pruning',
    'repotting',
    'treatment',
    'observation',
  ];
  return model;
});
jest.mock('../../../src/features/my-garden/userPlant.model', () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));

const mongoose = require('mongoose');
const CareEvent = require('../../../src/features/my-garden/careEvent.model');
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const service = require('../../../src/features/my-garden/careEvent.service');

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439099';
const plantId = '507f1f77bcf86cd799439012';
const eventId = '507f1f77bcf86cd799439013';
const query = (result) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

describe('CareEvent service', () => {
  let session;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-27T12:00:00.000Z'));
    jest.clearAllMocks();
    session = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn().mockResolvedValue(),
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      wateringSchedule: { enabled: false },
      fertilizingSchedule: { enabled: false },
    });
    UserPlant.updateOne.mockResolvedValue({ modifiedCount: 1 });
    CareEvent.create.mockImplementation(async (items) => items);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('create is transactional, uses token/path owners and ignores body owners', async () => {
    const result = await service.createCareEvent(userId, plantId, {
      userId: otherUserId,
      userPlantId: eventId,
      type: 'watering',
      performedAt: '2026-07-27T10:00:00Z',
      notes: '  done  ',
    });

    expect(result).toEqual(expect.objectContaining({
      userId,
      userPlantId: plantId,
      type: 'watering',
      notes: 'done',
    }));
    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(UserPlant.findOne).toHaveBeenCalledWith(
      { _id: plantId, userId, status: 'active' },
      null,
      { session }
    );
    expect(CareEvent.create).toHaveBeenCalledWith([
      expect.objectContaining({ userId, userPlantId: plantId }),
    ], { session });
    expect(UserPlant.updateOne).not.toHaveBeenCalled();
  });

  test.each([
    ['watering', 'wateringSchedule'],
    ['fertilizing', 'fertilizingSchedule'],
  ])('recalculates enabled %s schedule atomically', async (type, scheduleField) => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      [scheduleField]: {
        enabled: true,
        frequencyDays: 3,
      },
    });
    const performedAt = new Date('2026-07-20T10:00:00.000Z');

    await service.createCareEvent(userId, plantId, {
      type,
      performedAt: performedAt.toISOString(),
    });

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      {
        _id: plantId,
        userId,
        status: 'active',
        [`${scheduleField}.enabled`]: true,
      },
      {
        $set: {
          [`${scheduleField}.lastCompletedAt`]: performedAt,
          [`${scheduleField}.nextDueAt`]: new Date(
            '2026-07-23T10:00:00.000Z'
          ),
        },
      },
      { session, runValidators: true }
    );
  });

  test('other event types do not change schedules', async () => {
    await service.createCareEvent(userId, plantId, {
      type: 'pruning',
      performedAt: '2026-07-20T10:00:00.000Z',
    });
    expect(UserPlant.updateOne).not.toHaveBeenCalled();
  });

  test('GET filters owners and sorts newest first', async () => {
    const findQuery = query([{ _id: eventId }]);
    CareEvent.find.mockReturnValue(findQuery);
    await service.getCareEvents(userId, plantId);
    expect(CareEvent.find).toHaveBeenCalledWith({
      userId,
      userPlantId: plantId,
    });
    expect(findQuery.sort).toHaveBeenCalledWith({ performedAt: -1 });
  });

  test('update and hard delete filter by event, user and plant', async () => {
    const updateQuery = query({ _id: eventId });
    const deleteQuery = query({ _id: eventId });
    CareEvent.findOneAndUpdate.mockReturnValue(updateQuery);
    CareEvent.findOneAndDelete.mockReturnValue(deleteQuery);
    await service.updateCareEvent(userId, plantId, eventId, { notes: 'new' });
    await service.deleteCareEvent(userId, plantId, eventId);
    expect(CareEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: eventId, userId, userPlantId: plantId },
      { notes: 'new' },
      { new: true, runValidators: true }
    );
    expect(CareEvent.findOneAndDelete).toHaveBeenCalledWith({
      _id: eventId,
      userId,
      userPlantId: plantId,
    });
  });

  test('rejects access when active plant does not belong to user', async () => {
    UserPlant.findOne.mockResolvedValue(null);
    await expect(service.getCareEvents(
      otherUserId,
      plantId
    )).resolves.toBeNull();
    expect(CareEvent.find).not.toHaveBeenCalled();
  });

  test('validates ObjectId, type and notes', async () => {
    await expect(service.getCareEvents(
      'bad',
      plantId
    )).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.createCareEvent(
      userId,
      plantId,
      { type: 'bad' }
    )).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
      notes: 123,
    })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.updateCareEvent(
      userId,
      plantId,
      'bad',
      { notes: '' }
    )).rejects.toMatchObject({ statusCode: 400 });
  });

  test('accepts any past/current time and rejects invalid/future times', async () => {
    await expect(service.createCareEvent(userId, plantId, {
      type: 'observation',
      performedAt: '2020-01-01T00:00:00.000Z',
    })).resolves.toEqual(expect.objectContaining({
      performedAt: new Date('2020-01-01T00:00:00.000Z'),
    }));
    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: '2026-07-27T12:00:00.000Z',
    })).resolves.toEqual(expect.objectContaining({
      performedAt: new Date('2026-07-27T12:00:00.000Z'),
    }));

    for (const value of [null, '', 'not-a-date']) {
      await expect(service.createCareEvent(userId, plantId, {
        type: 'watering',
        performedAt: value,
      })).rejects.toMatchObject({ statusCode: 400 });
    }
    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: '2026-07-27T12:00:00.001Z',
    })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/tương lai/),
    });
    await expect(service.updateCareEvent(userId, plantId, eventId, {
      performedAt: '2026-07-27T12:00:00.001Z',
    })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/tương lai/),
    });
  });

  test('transaction unsupported does not create a partial CareEvent', async () => {
    const unsupportedError = new Error(
      'Transaction numbers are only allowed on a replica set member'
    );
    unsupportedError.code = 20;
    session.withTransaction.mockRejectedValue(unsupportedError);

    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
    })).rejects.toMatchObject({ statusCode: 503 });

    expect(CareEvent.create).not.toHaveBeenCalled();
    expect(UserPlant.updateOne).not.toHaveBeenCalled();
  });
});
