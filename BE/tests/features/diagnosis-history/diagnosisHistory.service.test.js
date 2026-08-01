jest.mock('../../../src/features/diagnosis-history/diagnosisHistory.model', () => {
  const { buildModelMock } = require('../../mocks/mongoose');
  return buildModelMock();
});
jest.mock('../../../src/features/my-garden/userPlant.model', () => ({
  exists: jest.fn(),
}));
jest.mock('../../../src/features/ai/diagnosisImageStorage.service', () => ({
  deleteDiagnosisImage: jest.fn(),
}));

const DiagnosisHistory = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.model'
);
const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const imageStorage = require(
  '../../../src/features/ai/diagnosisImageStorage.service'
);
const service = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.service'
);

const userId = '507f1f77bcf86cd799439011';
const historyId = '507f1f77bcf86cd799439012';
const userPlantId = '507f1f77bcf86cd799439013';
const diseaseId = '507f1f77bcf86cd799439014';
const productId = '507f1f77bcf86cd799439015';

function createQuery() {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
  };
}

describe('diagnosisHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    UserPlant.exists.mockResolvedValue({ _id: userPlantId });
    imageStorage.deleteDiagnosisImage.mockResolvedValue(true);
  });

  test('creates an owned history and ignores a supplied userId', async () => {
    DiagnosisHistory.mockImplementation((data) => ({
      save: jest.fn().mockResolvedValue(data),
    }));

    const result = await service.createDiagnosisHistory(userId, {
      userId: '507f1f77bcf86cd799439099',
      userPlantId,
      image: {
        storageKey: 'diagnoses/a.jpg',
        url: 'https://example.com/a.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 100,
      },
      diagnosis: {
        diseaseId,
        diseaseKey: '  LEAF-SPOT ',
        category: ' Disease ',
        observedSymptoms: ['Đốm nâu trên lá'],
        matchScore: 0.9,
        confidence: 0.9,
        matchStatus: 'matched',
      },
      ai: { provider: 'openrouter', model: 'example' },
      recommendationSnapshot: { productIds: [productId] },
      ignored: true,
    });

    expect(result.userId).toBe(userId);
    expect(result.diagnosis.diseaseKey).toBe('leaf-spot');
    expect(result.diagnosis.category).toBe('disease');
    expect(result.diagnosis.observedSymptoms).toEqual(['Đốm nâu trên lá']);
    expect(result.diagnosis.matchScore).toBe(0.9);
    expect(result).not.toHaveProperty('ignored');
  });

  test('filters only the current user, paginates and caps limit at 100', async () => {
    DiagnosisHistory.countDocuments.mockResolvedValue(205);
    const query = createQuery();
    DiagnosisHistory.find.mockReturnValue(query);

    const result = await service.getMyDiagnosisHistories(userId, {
      userPlantId,
      diseaseKey: '  LEAF-SPOT ',
      page: '2',
      limit: '1000',
    });

    expect(DiagnosisHistory.countDocuments).toHaveBeenCalledWith({
      userId,
      userPlantId,
      'diagnosis.diseaseKey': 'leaf-spot',
    });
    expect(DiagnosisHistory.find).toHaveBeenCalledWith({
      userId,
      userPlantId,
      'diagnosis.diseaseKey': 'leaf-spot',
    });
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(query.skip).toHaveBeenCalledWith(100);
    expect(query.limit).toHaveBeenCalledWith(100);
    expect(query.populate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        path: 'diagnosis.diseaseId',
        select: 'name diseaseKey category',
      }),
    ]));
    expect(result).toEqual(expect.objectContaining({
      total: 205,
      pages: 3,
      currentPage: 2,
    }));
  });

  test('loads detail using both history and owner ids', async () => {
    const query = createQuery();
    DiagnosisHistory.findOne.mockReturnValue(query);

    await service.getMyDiagnosisHistoryById(userId, historyId);

    expect(DiagnosisHistory.findOne).toHaveBeenCalledWith({
      _id: historyId,
      userId,
    });
    expect(query.populate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ path: 'diagnosis.diseaseId' }),
      expect.objectContaining({ path: 'catalogPlantId' }),
      expect.objectContaining({
        path: 'recommendationSnapshot.productIds',
        select: 'name thumbnail images price stock isActive',
      }),
    ]));
    expect(query.populate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        path: 'diagnosis.diseaseId',
        select: expect.stringMatching(/symptoms.*causes/),
      }),
    ]));
  });

  test('checks ownership before listing histories for a UserPlant', async () => {
    UserPlant.exists.mockResolvedValue(null);

    await expect(
      service.getMyDiagnosisHistories(userId, { userPlantId })
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(UserPlant.exists).toHaveBeenCalledWith({
      _id: userPlantId,
      userId,
      status: 'active',
    });
    expect(DiagnosisHistory.find).not.toHaveBeenCalled();
  });

  test('deletes only an owned history and cleans up its stored image', async () => {
    const history = {
      _id: historyId,
      userId,
      image: { storageKey: `diagnoses/${userId}/history.jpg` },
    };
    const findQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(history),
    };
    const deleteQuery = { lean: jest.fn().mockResolvedValue(history) };
    DiagnosisHistory.findOne.mockReturnValue(findQuery);
    DiagnosisHistory.findOneAndDelete.mockReturnValue(deleteQuery);
    imageStorage.deleteDiagnosisImage.mockResolvedValue(false);

    const result = await service.deleteMyDiagnosisHistory(userId, historyId);

    expect(DiagnosisHistory.findOne).toHaveBeenCalledWith({
      _id: historyId,
      userId,
    });
    expect(findQuery.select).toHaveBeenCalledWith('image.storageKey');
    expect(DiagnosisHistory.findOneAndDelete).toHaveBeenCalledWith({
      _id: historyId,
      userId,
    });
    expect(deleteQuery.lean).toHaveBeenCalled();
    expect(imageStorage.deleteDiagnosisImage).toHaveBeenCalledWith(
      history.image.storageKey
    );
    expect(
      imageStorage.deleteDiagnosisImage.mock.invocationCallOrder[0]
    ).toBeLessThan(
      DiagnosisHistory.findOneAndDelete.mock.invocationCallOrder[0]
    );
    expect(result).toBe(history);
  });

  test('returns null without image cleanup when owned history is absent', async () => {
    const findQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    };
    DiagnosisHistory.findOne.mockReturnValue(findQuery);

    await expect(
      service.deleteMyDiagnosisHistory(userId, historyId)
    ).resolves.toBeNull();

    expect(imageStorage.deleteDiagnosisImage).not.toHaveBeenCalled();
    expect(DiagnosisHistory.findOneAndDelete).not.toHaveBeenCalled();
  });

  test('does not hard-delete when stored image cleanup fails', async () => {
    const history = {
      _id: historyId,
      userId,
      image: { storageKey: `diagnoses/${userId}/history.jpg` },
    };
    const findQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(history),
    };
    const cleanupError = new Error('cleanup failed');
    DiagnosisHistory.findOne.mockReturnValue(findQuery);
    imageStorage.deleteDiagnosisImage.mockRejectedValue(cleanupError);

    await expect(
      service.deleteMyDiagnosisHistory(userId, historyId)
    ).rejects.toBe(cleanupError);

    expect(DiagnosisHistory.findOneAndDelete).not.toHaveBeenCalled();
  });

  test('rejects invalid ids and pagination', async () => {
    await expect(
      service.getMyDiagnosisHistoryById(userId, 'invalid')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyDiagnosisHistories(userId, { userPlantId: 'invalid' })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.getMyDiagnosisHistories(userId, { page: 0 })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.createDiagnosisHistory(userId, {
        recommendationSnapshot: { productIds: ['invalid'] },
      })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.deleteMyDiagnosisHistory(userId, 'invalid')
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.deleteMyDiagnosisHistory('invalid', historyId)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(DiagnosisHistory.findOne).not.toHaveBeenCalled();
    expect(DiagnosisHistory.findOneAndDelete).not.toHaveBeenCalled();
  });
});
