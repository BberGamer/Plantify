jest.mock('../../../src/features/my-garden/userPlant.model', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
}));
jest.mock('../../../src/features/my-garden/careEvent.model', () => ({
  find: jest.fn(),
}));
jest.mock('../../../src/features/diagnosis-history/diagnosisHistory.model', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));

const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const CareEvent = require('../../../src/features/my-garden/careEvent.model');
const DiagnosisHistory = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.model'
);
const service = require(
  '../../../src/features/my-garden/myGardenInsights.service'
);

const userId = '507f1f77bcf86cd799439011';
const userPlantId = '507f1f77bcf86cd799439012';

function query(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

describe('My Garden timeline and dashboard service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    CareEvent.find.mockReturnValue(query([]));
    DiagnosisHistory.find.mockReturnValue(query([]));
    DiagnosisHistory.findOne.mockReturnValue(query(null));
  });

  test('timeline checks active ownership before reading related collections', async () => {
    UserPlant.findOne.mockReturnValue(query(null));

    await expect(service.getMyUserPlantTimeline(
      userId,
      userPlantId
    )).resolves.toBeNull();

    expect(UserPlant.findOne).toHaveBeenCalledWith({
      _id: userPlantId,
      userId,
      status: 'active',
    });
    expect(CareEvent.find).not.toHaveBeenCalled();
    expect(DiagnosisHistory.find).not.toHaveBeenCalled();
  });

  test('timeline merges care, diagnosis and album, sorts newest first and paginates', async () => {
    UserPlant.findOne.mockReturnValue(query({
      _id: userPlantId,
      albumImages: [{
        _id: '507f1f77bcf86cd799439021',
        url: '/uploads/plant.jpg',
        caption: 'Lá mới',
        createdAt: new Date('2026-07-27T09:00:00.000Z'),
      }],
    }));
    CareEvent.find.mockReturnValue(query([{
      _id: '507f1f77bcf86cd799439022',
      type: 'watering',
      performedAt: new Date('2026-07-27T10:00:00.000Z'),
      notes: 'Tưới 500ml',
    }]));
    DiagnosisHistory.find.mockReturnValue(query([{
      _id: '507f1f77bcf86cd799439023',
      createdAt: new Date('2026-07-27T11:00:00.000Z'),
      image: { url: '/uploads/diagnosis.jpg' },
      diagnosis: {
        diseaseId: { name: 'Đốm lá' },
        diseaseKey: 'leaf-spot',
        matchStatus: 'matched',
        confidence: 0.9,
      },
    }]));

    const result = await service.getMyUserPlantTimeline(
      userId,
      userPlantId,
      { page: 1, limit: 2 }
    );

    expect(CareEvent.find).toHaveBeenCalledWith({ userId, userPlantId });
    expect(DiagnosisHistory.find).toHaveBeenCalledWith({
      userId,
      userPlantId,
    });
    expect(result).toEqual(expect.objectContaining({
      total: 3,
      pages: 2,
      currentPage: 1,
    }));
    expect(result.events.map((event) => event.type)).toEqual([
      'diagnosis',
      'watering',
    ]);
    expect(result.events[0].diagnosis).toEqual(expect.objectContaining({
      diseaseName: 'Đốm lá',
      confidence: 0.9,
    }));
  });

  test('dashboard returns counts, today/overdue plants and latest diagnosis', async () => {
    const now = new Date('2026-07-27T12:00:00.000Z');
    const dueTodayPlant = {
      _id: userPlantId,
      name: 'Monstera',
      coverImageUrl: '/cover.jpg',
      wateringSchedule: {
        enabled: true,
        nextDueAt: new Date('2026-07-27T13:00:00.000Z'),
      },
      fertilizingSchedule: {
        enabled: true,
        nextDueAt: new Date('2026-07-27T11:00:00.000Z'),
      },
    };
    UserPlant.find.mockReturnValue(query([dueTodayPlant, {
      _id: '507f1f77bcf86cd799439013',
      name: 'Rose',
      wateringSchedule: { enabled: false, nextDueAt: null },
      fertilizingSchedule: { enabled: false, nextDueAt: null },
    }]));
    DiagnosisHistory.findOne.mockReturnValue(query({
      _id: '507f1f77bcf86cd799439023',
      userPlantId: {
        _id: userPlantId,
        name: 'Monstera',
        coverImageUrl: '/cover.jpg',
      },
      createdAt: new Date('2026-07-27T10:00:00.000Z'),
      diagnosis: {
        diseaseId: { name: 'Đốm lá' },
        matchStatus: 'matched',
        confidence: 0.9,
      },
    }));

    const result = await service.getMyGardenDashboard(userId, now);

    expect(UserPlant.find).toHaveBeenCalledWith({
      userId,
      status: 'active',
    });
    expect(result.totalPlants).toBe(2);
    expect(result.wateringDueToday).toHaveLength(1);
    expect(result.fertilizingDueToday).toHaveLength(0);
    expect(result.overduePlants).toHaveLength(1);
    expect(result.overduePlants[0].dueSchedules).toEqual([
      {
        type: 'fertilizing',
        nextDueAt: new Date('2026-07-27T11:00:00.000Z'),
      },
    ]);
    expect(result.latestDiagnosis).toEqual(expect.objectContaining({
      diseaseName: 'Đốm lá',
      userPlantId: expect.objectContaining({ _id: userPlantId }),
    }));
  });

  test('Vietnam day boundary is timezone-stable', () => {
    expect(service.getVietnamDayBounds(
      new Date('2026-07-27T18:30:00.000Z')
    )).toEqual({
      start: new Date('2026-07-27T17:00:00.000Z'),
      end: new Date('2026-07-28T17:00:00.000Z'),
    });
  });

  test('validates owner, plant and pagination ObjectIds', async () => {
    await expect(
      service.getMyGardenDashboard('bad')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyUserPlantTimeline(userId, 'bad')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyUserPlantTimeline(userId, userPlantId, { page: 0 })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
