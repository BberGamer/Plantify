jest.mock('../../../src/features/my-garden/careEvent.model', () => {
  const model = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
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
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type: 'observation',
      performedAt: new Date('2026-07-20T10:00:00.000Z'),
    }));
    CareEvent.findOneAndUpdate.mockReturnValue(query({
      _id: eventId,
      type: 'observation',
      performedAt: new Date('2026-07-20T10:00:00.000Z'),
    }));
    CareEvent.findOneAndDelete.mockReturnValue(query({
      _id: eventId,
      type: 'observation',
      performedAt: new Date('2026-07-20T10:00:00.000Z'),
    }));
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
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type,
      performedAt,
    }));

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

  test('creating an older CareEvent does not move the schedule backwards', async () => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 3 },
    });
    CareEvent.findOne.mockReturnValue(query({
      _id: '507f1f77bcf86cd799439014',
      type: 'watering',
      performedAt: new Date('2026-07-25T10:00:00.000Z'),
    }));

    await service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: '2026-07-20T10:00:00.000Z',
    });

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: plantId,
        userId,
        'wateringSchedule.enabled': true,
      }),
      {
        $set: {
          'wateringSchedule.lastCompletedAt':
            new Date('2026-07-25T10:00:00.000Z'),
          'wateringSchedule.nextDueAt':
            new Date('2026-07-28T10:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('creating a newer CareEvent advances the schedule', async () => {
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 2 },
    });
    const newest = new Date('2026-07-27T10:00:00.000Z');
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type: 'watering',
      performedAt: newest,
    }));

    await service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: newest.toISOString(),
    });

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'wateringSchedule.lastCompletedAt': newest,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-29T10:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('quick watering payload defaults performedAt to now and updates schedule', async () => {
    const performedAt = new Date('2026-07-27T12:00:00.000Z');
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 2 },
    });
    CareEvent.findOne.mockReturnValue(query({
      _id: eventId,
      type: 'watering',
      performedAt,
    }));

    await service.createCareEvent(userId, plantId, { type: 'watering' });

    expect(CareEvent.create).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'watering',
        performedAt,
        userId,
        userPlantId: plantId,
      }),
    ], { session });
    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'wateringSchedule.lastCompletedAt': performedAt,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-29T12:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('updating the newest event performedAt recalculates its schedule', async () => {
    const oldEvent = {
      _id: eventId,
      type: 'watering',
      performedAt: new Date('2026-07-25T10:00:00.000Z'),
    };
    const updatedEvent = {
      ...oldEvent,
      performedAt: new Date('2026-07-26T11:00:00.000Z'),
    };
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 4 },
    });
    CareEvent.findOne
      .mockReturnValueOnce(query(oldEvent))
      .mockReturnValueOnce(query(updatedEvent));
    CareEvent.findOneAndUpdate.mockReturnValue(query(updatedEvent));

    await service.updateCareEvent(userId, plantId, eventId, {
      performedAt: updatedEvent.performedAt.toISOString(),
    });

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'wateringSchedule.lastCompletedAt': updatedEvent.performedAt,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-30T11:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test.each([
    ['observation', 1],
    ['fertilizing', 2],
  ])('changing watering to %s synchronizes old and new schedule types', async (
    newType,
    expectedUpdateCount
  ) => {
    const oldEvent = {
      _id: eventId,
      type: 'watering',
      performedAt: new Date('2026-07-26T10:00:00.000Z'),
    };
    const updatedEvent = {
      ...oldEvent,
      type: newType,
    };
    const remainingWatering = {
      _id: '507f1f77bcf86cd799439014',
      type: 'watering',
      performedAt: new Date('2026-07-20T10:00:00.000Z'),
    };
    const userPlant = {
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 2 },
      fertilizingSchedule: { enabled: true, frequencyDays: 5 },
    };
    UserPlant.findOne.mockResolvedValue(userPlant);
    CareEvent.findOne
      .mockReturnValueOnce(query(oldEvent))
      .mockReturnValueOnce(query(remainingWatering));
    if (newType === 'fertilizing') {
      CareEvent.findOne.mockReturnValueOnce(query(updatedEvent));
    }
    CareEvent.findOneAndUpdate.mockReturnValue(query(updatedEvent));

    await service.updateCareEvent(userId, plantId, eventId, {
      type: newType,
    });

    expect(UserPlant.updateOne).toHaveBeenCalledTimes(expectedUpdateCount);
    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'wateringSchedule.lastCompletedAt':
            remainingWatering.performedAt,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-22T10:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
    if (newType === 'fertilizing') {
      expect(UserPlant.updateOne).toHaveBeenCalledWith(
        expect.any(Object),
        {
          $set: {
            'fertilizingSchedule.lastCompletedAt':
              updatedEvent.performedAt,
            'fertilizingSchedule.nextDueAt':
              new Date('2026-07-31T10:00:00.000Z'),
          },
        },
        { session, runValidators: true }
      );
    }
  });

  test('deleting the newest event falls back to the previous event', async () => {
    const deletedEvent = {
      _id: eventId,
      type: 'watering',
      performedAt: new Date('2026-07-26T10:00:00.000Z'),
    };
    const previousEvent = {
      _id: '507f1f77bcf86cd799439014',
      type: 'watering',
      performedAt: new Date('2026-07-20T10:00:00.000Z'),
    };
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: { enabled: true, frequencyDays: 3 },
    });
    CareEvent.findOneAndDelete.mockReturnValue(query(deletedEvent));
    CareEvent.findOne.mockReturnValue(query(previousEvent));

    await service.deleteCareEvent(userId, plantId, eventId);

    expect(UserPlant.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          'wateringSchedule.lastCompletedAt': previousEvent.performedAt,
          'wateringSchedule.nextDueAt':
            new Date('2026-07-23T10:00:00.000Z'),
        },
      },
      { session, runValidators: true }
    );
  });

  test('deleting the last event clears lastCompletedAt but preserves nextDueAt', async () => {
    const configuredNextDueAt = new Date('2026-08-01T10:00:00.000Z');
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      wateringSchedule: {
        enabled: true,
        frequencyDays: 3,
        nextDueAt: configuredNextDueAt,
      },
    });
    CareEvent.findOneAndDelete.mockReturnValue(query({
      _id: eventId,
      type: 'watering',
      performedAt: new Date('2026-07-26T10:00:00.000Z'),
    }));
    CareEvent.findOne.mockReturnValue(query(null));

    await service.deleteCareEvent(userId, plantId, eventId);

    const update = UserPlant.updateOne.mock.calls[0][1].$set;
    expect(update).toEqual({
      'wateringSchedule.lastCompletedAt': null,
    });
    expect(update).not.toHaveProperty('wateringSchedule.nextDueAt');
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

  test('update and hard delete are transactional and filter by event, user and plant', async () => {
    await service.updateCareEvent(userId, plantId, eventId, { notes: 'new' });
    await service.deleteCareEvent(userId, plantId, eventId);
    expect(session.withTransaction).toHaveBeenCalledTimes(2);
    expect(CareEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: eventId, userId, userPlantId: plantId },
      { notes: 'new' },
      { new: true, runValidators: true, session }
    );
    expect(CareEvent.findOneAndDelete).toHaveBeenCalledWith(
      { _id: eventId, userId, userPlantId: plantId },
      { session }
    );
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

  test.each(['create', 'update', 'delete'])(
    '%s propagates a schedule sync failure through its transaction',
    async (operation) => {
      const careEvent = {
        _id: eventId,
        userId,
        userPlantId: plantId,
        type: 'watering',
        performedAt: new Date('2026-07-25T10:00:00.000Z'),
      };
      UserPlant.findOne.mockResolvedValue({
        _id: plantId,
        wateringSchedule: { enabled: true, frequencyDays: 3 },
      });
      UserPlant.updateOne.mockRejectedValue(new Error('schedule sync failed'));

      let operationPromise;
      if (operation === 'create') {
        CareEvent.findOne.mockReturnValue(query(careEvent));
        operationPromise = service.createCareEvent(userId, plantId, {
          type: 'watering',
          performedAt: careEvent.performedAt.toISOString(),
        });
      } else if (operation === 'update') {
        CareEvent.findOne
          .mockReturnValueOnce(query(careEvent))
          .mockReturnValueOnce(query(careEvent));
        CareEvent.findOneAndUpdate.mockReturnValue(query(careEvent));
        operationPromise = service.updateCareEvent(
          userId,
          plantId,
          eventId,
          { notes: 'changed' }
        );
      } else {
        CareEvent.findOneAndDelete.mockReturnValue(query(careEvent));
        CareEvent.findOne.mockReturnValue(query(null));
        operationPromise = service.deleteCareEvent(
          userId,
          plantId,
          eventId
        );
      }

      await expect(operationPromise).rejects.toThrow('schedule sync failed');
      expect(session.withTransaction).toHaveBeenCalledTimes(1);
      expect(session.endSession).toHaveBeenCalledTimes(1);
    }
  );
});
