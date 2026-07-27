jest.mock('../../../src/features/my-garden/careEvent.model', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
}));
jest.mock('../../../src/features/my-garden/userPlant.model', () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));
jest.mock('../../../src/features/notifications/notification.model', () => ({
  Notification: {
    deleteMany: jest.fn(),
  },
}));

const mongoose = require('mongoose');
const CareEvent = require('../../../src/features/my-garden/careEvent.model');
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const {
  Notification,
} = require('../../../src/features/notifications/notification.model');
const service = require('../../../src/features/my-garden/careEvent.service');

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439099';
const plantId = '507f1f77bcf86cd799439012';
const eventId = '507f1f77bcf86cd799439013';

function query(result) {
  return {
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('CareEvent watering service', () => {
  let session;
  const now = new Date('2026-07-27T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    jest.clearAllMocks();
    session = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn().mockResolvedValue(),
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 3 },
    });
    UserPlant.updateOne.mockResolvedValue({ modifiedCount: 1 });
    CareEvent.create.mockImplementation(async (items) => items);
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type: 'watering',
      performedAt: now,
    }));
    CareEvent.findOneAndDelete.mockReturnValue(query({
      _id: eventId,
      userId,
      userPlantId: plantId,
      type: 'watering',
      performedAt: now,
    }));
    Notification.deleteMany.mockResolvedValue({ deletedCount: 0 });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('accepts watering payload, uses server time and token/path ownership', async () => {
    const result = await service.createCareEvent(
      userId,
      plantId,
      { type: 'watering' }
    );

    expect(result).toEqual(expect.objectContaining({
      userId,
      userPlantId: plantId,
      type: 'watering',
      performedAt: now,
      notes: '',
    }));
    expect(CareEvent.create).toHaveBeenCalledWith([
      {
        userId,
        userPlantId: plantId,
        type: 'watering',
        performedAt: now,
        notes: '',
      },
    ], { session });
    expect(Notification.deleteMany).toHaveBeenCalledWith(
      {
        recipientId: userId,
        userPlantId: plantId,
        type: 'plant_watering_due',
      },
      { session }
    );
  });

  test.each([
    [{ type: 'observation' }],
    [{ type: 'watering', performedAt: '2020-01-01T00:00:00.000Z' }],
    [{ type: 'watering', notes: 'client note' }],
    [{ type: 'watering', userId: otherUserId }],
    [{}],
    [null],
    [[]],
  ])('rejects forbidden create payload %p before writing', async (payload) => {
    await expect(
      service.createCareEvent(userId, plantId, payload)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(CareEvent.create).not.toHaveBeenCalled();
    expect(Notification.deleteMany).not.toHaveBeenCalled();
  });

  test('updates enabled watering schedule from the newest event atomically', async () => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 3 },
    });
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type: 'watering',
      performedAt: now,
    }));

    await service.createCareEvent(userId, plantId, { type: 'watering' });

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      {
        _id: plantId,
        userId,
        status: 'active',
        'wateringSchedule.enabled': true,
      },
      {
        $set: {
          'wateringSchedule.lastCompletedAt': now,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-30T12:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('completes fertilizing schedule and only clears its matching notification', async () => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      fertilizingSchedule: { enabled: true, frequencyDays: 5 },
    });
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type: 'fertilizing',
      performedAt: now,
    }));

    const result = await service.createCareEvent(
      userId,
      plantId,
      { type: 'fertilizing' }
    );

    expect(result).toEqual(expect.objectContaining({
      type: 'fertilizing',
      performedAt: now,
    }));
    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        'fertilizingSchedule.enabled': true,
      }),
      {
        $set: {
          'fertilizingSchedule.lastCompletedAt': now,
          'fertilizingSchedule.nextDueAt':
            new Date('2026-08-01T12:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
    expect(Notification.deleteMany).toHaveBeenCalledWith(
      {
        recipientId: userId,
        userPlantId: plantId,
        type: 'plant_fertilizing_due',
      },
      { session }
    );
  });

  test('does not create or delete notifications for a plant outside ownership', async () => {
    UserPlant.findOne.mockResolvedValue(null);
    await expect(
      service.createCareEvent(userId, plantId, { type: 'watering' })
    ).resolves.toBeNull();
    expect(CareEvent.create).not.toHaveBeenCalled();
    expect(Notification.deleteMany).not.toHaveBeenCalled();
  });

  test('rejects completion when the matching schedule is disabled', async () => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: false, frequencyDays: 3 },
    });

    await expect(
      service.createCareEvent(userId, plantId, { type: 'watering' })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(CareEvent.create).not.toHaveBeenCalled();
    expect(Notification.deleteMany).not.toHaveBeenCalled();
  });

  test('GET checks ownership and sorts newest first without deleting old event types', async () => {
    const events = [
      { _id: eventId, type: 'watering' },
      { _id: '507f1f77bcf86cd799439014', type: 'fertilizing' },
    ];
    const findQuery = query(events);
    CareEvent.find.mockReturnValue(findQuery);

    await expect(
      service.getCareEvents(userId, plantId)
    ).resolves.toEqual(events);
    expect(CareEvent.find).toHaveBeenCalledWith({
      userId,
      userPlantId: plantId,
    });
    expect(findQuery.sort).toHaveBeenCalledWith({ performedAt: -1 });
  });

  test('DELETE removes an owned watering event and resyncs its schedule', async () => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 2 },
    });
    const previousEvent = {
      _id: '507f1f77bcf86cd799439014',
      type: 'watering',
      performedAt: new Date('2026-07-20T10:00:00.000Z'),
    };
    CareEvent.findOne.mockReturnValue(query(previousEvent));

    await service.deleteCareEvent(userId, plantId, eventId);

    expect(CareEvent.findOneAndDelete).toHaveBeenCalledWith(
      {
        _id: eventId,
        userId,
        userPlantId: plantId,
        type: { $in: ['watering', 'fertilizing'] },
      },
      { session }
    );
    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'wateringSchedule.lastCompletedAt': previousEvent.performedAt,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-22T10:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('DELETE resyncs fertilizing schedule for a mistaken fertilizing completion', async () => {
    const deletedEvent = {
      _id: eventId,
      type: 'fertilizing',
      performedAt: now,
    };
    const previousEvent = {
      _id: '507f1f77bcf86cd799439014',
      type: 'fertilizing',
      performedAt: new Date('2026-07-18T10:00:00.000Z'),
    };
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      fertilizingSchedule: { enabled: true, frequencyDays: 7 },
    });
    CareEvent.findOneAndDelete.mockReturnValue(query(deletedEvent));
    CareEvent.findOne.mockReturnValue(query(previousEvent));

    await service.deleteCareEvent(userId, plantId, eventId);

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        'fertilizingSchedule.enabled': true,
      }),
      {
        $set: {
          'fertilizingSchedule.lastCompletedAt': previousEvent.performedAt,
          'fertilizingSchedule.nextDueAt':
            new Date('2026-07-25T10:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('deleting the last watering restores its configured next due date', async () => {
    const configuredNextDueAt = new Date('2026-07-27T12:00:00.000Z');
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: {
        enabled: true,
        frequencyDays: 2,
        configuredNextDueAt,
        nextDueAt: new Date('2026-07-29T12:00:00.000Z'),
      },
    });
    CareEvent.findOne.mockReturnValue(query(null));

    await service.deleteCareEvent(userId, plantId, eventId);

    expect(UserPlant.updateOne.mock.calls[0][1]).toEqual({
      $set: {
        'wateringSchedule.lastCompletedAt': null,
        'wateringSchedule.nextDueAt': configuredNextDueAt,
      },
    });
  });

  test('does not delete an old non-watering CareEvent', async () => {
    CareEvent.findOneAndDelete.mockReturnValue(query(null));
    await expect(
      service.deleteCareEvent(userId, plantId, eventId)
    ).resolves.toBeNull();
    expect(UserPlant.updateOne).not.toHaveBeenCalled();
  });

  test('validates owner, plant and event ObjectIds', async () => {
    await expect(
      service.createCareEvent('bad', plantId, { type: 'watering' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getCareEvents(userId, 'bad')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.deleteCareEvent(userId, plantId, 'bad')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('notification cleanup failure rolls back the watering transaction', async () => {
    Notification.deleteMany.mockRejectedValue(new Error('cleanup failed'));
    await expect(
      service.createCareEvent(userId, plantId, { type: 'watering' })
    ).rejects.toThrow('cleanup failed');
    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test('unsupported transactions do not create partial watering data', async () => {
    const error = new Error(
      'Transaction numbers are only allowed on a replica set member'
    );
    error.code = 20;
    session.withTransaction.mockRejectedValue(error);

    await expect(
      service.createCareEvent(userId, plantId, { type: 'watering' })
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(CareEvent.create).not.toHaveBeenCalled();
    expect(Notification.deleteMany).not.toHaveBeenCalled();
  });
});
