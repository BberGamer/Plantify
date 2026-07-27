// userPlant.model.test.js - Kiểm tra schema và collection của UserPlant
const UserPlant = require('../../../src/features/my-garden/userPlant.model');

describe('UserPlant schema', () => {
  test('dùng collection user_plants, timestamps và index theo owner/status', () => {
    const { schema } = UserPlant;
    const indexes = schema.indexes().map(([fields]) => fields);

    expect(schema.options.collection).toBe('user_plants');
    expect(schema.options.timestamps).toBe(true);
    expect(indexes).toEqual(expect.arrayContaining([
      { userId: 1 },
      { userId: 1, status: 1, createdAt: -1 },
    ]));
  });

  test('khai báo đúng ownership, catalog reference và giá trị mặc định', () => {
    const { schema } = UserPlant;

    expect(schema.path('userId').options).toEqual(expect.objectContaining({
      ref: 'User',
      required: true,
    }));
    expect(schema.path('catalogPlantId').options).toEqual(expect.objectContaining({
      ref: 'Plant',
      default: null,
    }));
    expect(schema.path('name').options).toEqual(expect.objectContaining({
      required: true,
      trim: true,
    }));
    expect(schema.path('coverImageUrl').options.default).toBe('');
    expect(schema.path('notes').options.default).toBe('');
    expect(schema.path('status').options).toEqual(expect.objectContaining({
      enum: ['active', 'archived'],
      default: 'active',
    }));
  });
});
