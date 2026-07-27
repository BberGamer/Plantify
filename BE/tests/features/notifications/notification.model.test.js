const {
  Notification,
  NOTIFICATION_TYPES,
} = require('../../../src/features/notifications/notification.model');

describe('Notification schema', () => {
  test('supports plant care fields, refs and unique partial dedupe index', () => {
    const { schema } = Notification;
    const dedupeIndex = schema.indexes().find(
      ([fields]) => fields.dedupeKey === 1
    );

    expect(NOTIFICATION_TYPES).toEqual(expect.arrayContaining([
      'plant_watering_due',
      'plant_fertilizing_due',
    ]));
    expect(schema.path('userPlantId').options).toEqual(
      expect.objectContaining({ ref: 'UserPlant', default: null })
    );
    expect(schema.path('careDueAt').instance).toBe('Date');
    expect(schema.path('dedupeKey').instance).toBe('String');
    expect(dedupeIndex).toEqual([
      { dedupeKey: 1 },
      {
        unique: true,
        partialFilterExpression: { dedupeKey: { $type: 'string' } },
      },
    ]);
  });

  test('allows null actor for system reminders but still requires it for legacy types', () => {
    const systemNotification = new Notification({
      recipientId: '507f1f77bcf86cd799439011',
      actorId: null,
      type: 'plant_watering_due',
      userPlantId: '507f1f77bcf86cd799439012',
    });
    const legacyNotification = new Notification({
      recipientId: '507f1f77bcf86cd799439011',
      actorId: null,
      type: 'post_commented',
    });

    expect(systemNotification.validateSync()?.errors?.actorId).toBeUndefined();
    expect(legacyNotification.validateSync()?.errors?.actorId).toBeDefined();

    const actorRequired = Notification.schema.path('actorId').options.required;
    expect(actorRequired.call({
      get: () => 'plant_fertilizing_due',
    })).toBe(false);
    expect(actorRequired.call({
      get: () => 'order_status_updated',
    })).toBe(true);
  });
});
