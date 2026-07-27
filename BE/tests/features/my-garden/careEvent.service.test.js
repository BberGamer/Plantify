// careEvent.service.test.js - Kiểm tra CRUD, validation và ownership CareEvent
jest.mock('../../../src/features/my-garden/careEvent.model', () => {
  const model = { create: jest.fn(), find: jest.fn(), findOneAndUpdate: jest.fn(), findOneAndDelete: jest.fn() };
  model.CARE_EVENT_TYPES = ['watering', 'fertilizing', 'pruning', 'repotting', 'treatment', 'observation'];
  return model;
});
jest.mock('../../../src/features/my-garden/userPlant.model', () => ({ findOne: jest.fn() }));

const CareEvent = require('../../../src/features/my-garden/careEvent.model');
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const service = require('../../../src/features/my-garden/careEvent.service');
const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439099';
const plantId = '507f1f77bcf86cd799439012';
const eventId = '507f1f77bcf86cd799439013';
const query = (result) => ({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(result) });

describe('CareEvent service', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-27T12:00:00.000Z'));
    jest.clearAllMocks();
    UserPlant.findOne.mockResolvedValue({
      _id: plantId,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  afterEach(() => jest.useRealTimers());

  test('create uses owners from arguments and ignores body owners', async () => {
    CareEvent.create.mockImplementation(async (data) => data);
    const result = await service.createCareEvent(userId, plantId, { userId: otherUserId, userPlantId: eventId, type: 'watering', performedAt: '2026-07-27T10:00:00Z', notes: '  done  ' });
    expect(result).toEqual(expect.objectContaining({ userId, userPlantId: plantId, type: 'watering', notes: 'done' }));
    expect(UserPlant.findOne).toHaveBeenCalledWith({ _id: plantId, userId, status: 'active' });
  });

  test('GET filters owners and sorts newest first', async () => {
    const findQuery = query([{ _id: eventId }]); CareEvent.find.mockReturnValue(findQuery);
    await service.getCareEvents(userId, plantId);
    expect(CareEvent.find).toHaveBeenCalledWith({ userId, userPlantId: plantId });
    expect(findQuery.sort).toHaveBeenCalledWith({ performedAt: -1 });
  });

  test('update and hard delete filter by event, user and plant', async () => {
    const updateQuery = query({ _id: eventId }); const deleteQuery = query({ _id: eventId });
    CareEvent.findOneAndUpdate.mockReturnValue(updateQuery); CareEvent.findOneAndDelete.mockReturnValue(deleteQuery);
    await service.updateCareEvent(userId, plantId, eventId, { notes: 'new' });
    await service.deleteCareEvent(userId, plantId, eventId);
    expect(CareEvent.findOneAndUpdate).toHaveBeenCalledWith({ _id: eventId, userId, userPlantId: plantId }, { notes: 'new' }, { new: true, runValidators: true });
    expect(CareEvent.findOneAndDelete).toHaveBeenCalledWith({ _id: eventId, userId, userPlantId: plantId });
  });

  test('rejects access when active plant does not belong to user', async () => {
    UserPlant.findOne.mockResolvedValue(null);
    await expect(service.getCareEvents(otherUserId, plantId)).resolves.toBeNull();
    expect(CareEvent.find).not.toHaveBeenCalled();
  });

  test('validates ObjectId, type and notes', async () => {
    await expect(service.getCareEvents('bad', plantId)).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.createCareEvent(userId, plantId, { type: 'bad' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.createCareEvent(userId, plantId, { type: 'watering', notes: 123 })).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.updateCareEvent(userId, plantId, 'bad', { notes: '' })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('defaults undefined performedAt, rejects null, empty and invalid dates', async () => {
    CareEvent.create.mockImplementation(async (data) => data);
    const before = Date.now();
    const result = await service.createCareEvent(userId, plantId, { type: 'observation' });
    expect(result.performedAt.getTime()).toBeGreaterThanOrEqual(before);
    for (const performedAt of [null, '', 'not-a-date']) {
      await expect(service.createCareEvent(userId, plantId, { type: 'watering', performedAt })).rejects.toMatchObject({ statusCode: 400 });
    }
  });

  test('accepts lifecycle boundaries and rejects dates outside them', async () => {
    CareEvent.create.mockImplementation(async (data) => data);

    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: '2026-01-01T00:00:00.000Z',
    })).resolves.toEqual(expect.objectContaining({
      performedAt: new Date('2026-01-01T00:00:00.000Z'),
    }));
    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: '2026-07-27T12:00:00.000Z',
    })).resolves.toEqual(expect.objectContaining({
      performedAt: new Date('2026-07-27T12:00:00.000Z'),
    }));

    await expect(service.createCareEvent(userId, plantId, {
      type: 'watering',
      performedAt: '2025-12-31T23:59:59.999Z',
    })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/trước ngày tạo cây/),
    });
    await expect(service.updateCareEvent(userId, plantId, eventId, {
      performedAt: '2026-07-27T12:00:00.001Z',
    })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringMatching(/tương lai/),
    });
  });
});
