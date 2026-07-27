jest.mock('../../../src/features/my-garden/userPlant.model', () => ({
  find: jest.fn(),
}));
jest.mock('../../../src/features/notifications/notification.service', () => ({
  upsertPlantCareNotification: jest.fn(),
}));

const UserPlant = require(
  '../../../src/features/my-garden/userPlant.model'
);
const {
  upsertPlantCareNotification,
} = require('../../../src/features/notifications/notification.service');
const {
  buildPlantCareDedupeKey,
  checkDuePlantCareNotifications,
} = require(
  '../../../src/features/notifications/plantCareReminder.service'
);

const userId = '507f1f77bcf86cd799439011';
const userPlantId = '507f1f77bcf86cd799439012';
const now = new Date('2026-07-27T12:00:00.000Z');

function findQuery(result) {
  return { lean: jest.fn().mockResolvedValue(result) };
}

describe('plant care reminder service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    upsertPlantCareNotification.mockImplementation(async (payload) => ({
      _id: payload.dedupeKey,
    }));
  });

  test('queries active due schedules and creates both due and overdue reminders', async () => {
    UserPlant.find.mockReturnValue(findQuery([{
      _id: userPlantId,
      userId,
      name: 'Monstera',
      status: 'active',
      wateringSchedule: {
        enabled: true,
        nextDueAt: now,
      },
      fertilizingSchedule: {
        enabled: true,
        nextDueAt: new Date('2026-07-26T12:00:00.000Z'),
      },
    }]));

    const result = await checkDuePlantCareNotifications(now);

    expect(UserPlant.find).toHaveBeenCalledWith({
      status: 'active',
      $or: [
        {
          'wateringSchedule.enabled': true,
          'wateringSchedule.nextDueAt': { $ne: null, $lte: now },
        },
        {
          'fertilizingSchedule.enabled': true,
          'fertilizingSchedule.nextDueAt': { $ne: null, $lte: now },
        },
      ],
    });
    expect(upsertPlantCareNotification).toHaveBeenCalledTimes(2);
    expect(upsertPlantCareNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: userId,
        actorId: null,
        type: 'plant_watering_due',
        userPlantId,
        careDueAt: now,
        dedupeKey: `plant-care:${userPlantId}:watering:${now.toISOString()}`,
        message: 'Đã đến lúc tưới cây Monstera.',
      })
    );
    expect(upsertPlantCareNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'plant_fertilizing_due',
        message: 'Đã đến lúc bón phân cho cây Monstera.',
      })
    );
    expect(result).toEqual({ createdCount: 2 });
  });

  test('skips disabled or not-yet-due schedules defensively', async () => {
    UserPlant.find.mockReturnValue(findQuery([{
      _id: userPlantId,
      userId,
      name: 'Rose',
      wateringSchedule: {
        enabled: false,
        nextDueAt: new Date('2026-07-26T12:00:00.000Z'),
      },
      fertilizingSchedule: {
        enabled: true,
        nextDueAt: new Date('2026-07-28T12:00:00.000Z'),
      },
    }]));

    await expect(
      checkDuePlantCareNotifications(now)
    ).resolves.toEqual({ createdCount: 0 });
    expect(upsertPlantCareNotification).not.toHaveBeenCalled();
  });

  test('same due time has same key while a new nextDueAt has a new key', () => {
    const firstDueAt = new Date('2026-07-27T12:00:00.000Z');
    const nextDueAt = new Date('2026-07-30T12:00:00.000Z');
    const firstKey = buildPlantCareDedupeKey(
      userPlantId,
      'watering',
      firstDueAt
    );

    expect(buildPlantCareDedupeKey(
      userPlantId,
      'watering',
      firstDueAt
    )).toBe(firstKey);
    expect(buildPlantCareDedupeKey(
      userPlantId,
      'watering',
      nextDueAt
    )).not.toBe(firstKey);
  });
});
