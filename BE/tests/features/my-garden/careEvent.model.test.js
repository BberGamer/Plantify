// careEvent.model.test.js - Kiểm tra schema, enum, ref, timestamps và index CareEvent
const CareEvent = require('../../../src/features/my-garden/careEvent.model');

describe('CareEvent schema', () => {
  test('uses care_events collection, timestamps and compound index', () => {
    expect(CareEvent.schema.options.collection).toBe('care_events');
    expect(CareEvent.schema.options.timestamps).toBe(true);
    expect(CareEvent.schema.indexes().map(([fields]) => fields)).toContainEqual({ userId: 1, userPlantId: 1, performedAt: -1 });
  });

  test('declares owner refs, enum and defaults', () => {
    const { schema } = CareEvent;
    expect(schema.path('userId').options).toEqual(expect.objectContaining({ ref: 'User', required: true }));
    expect(schema.path('userPlantId').options).toEqual(expect.objectContaining({ ref: 'UserPlant', required: true }));
    expect(schema.path('type').options.enum).toEqual(['watering', 'fertilizing', 'pruning', 'repotting', 'treatment', 'observation']);
    expect(schema.path('performedAt').options).toEqual(expect.objectContaining({ required: true, default: Date.now }));
    expect(schema.path('notes').options.default).toBe('');
  });
});
