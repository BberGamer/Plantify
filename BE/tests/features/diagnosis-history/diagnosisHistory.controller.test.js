jest.mock('../../../src/features/diagnosis-history/diagnosisHistory.service');
jest.mock('../../../src/utils/apiResponse');

const service = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.service'
);
const apiResponse = require('../../../src/utils/apiResponse');
const controller = require(
  '../../../src/features/diagnosis-history/diagnosisHistory.controller'
);

describe('diagnosisHistoryController', () => {
  const req = {
    user: { id: '507f1f77bcf86cd799439011' },
    query: { page: '1' },
    params: { id: '507f1f77bcf86cd799439012' },
  };
  const res = {};
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('returns the current user histories', async () => {
    const result = { histories: [], total: 0 };
    service.getMyDiagnosisHistories.mockResolvedValue(result);

    await controller.getMyDiagnosisHistories(req, res, next);

    expect(service.getMyDiagnosisHistories).toHaveBeenCalledWith(
      req.user.id,
      req.query
    );
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      result
    );
  });

  test('returns not found when detail is absent', async () => {
    service.getMyDiagnosisHistoryById.mockResolvedValue(null);

    await controller.getMyDiagnosisHistoryById(req, res, next);

    expect(apiResponse.notFound).toHaveBeenCalledWith(res, expect.any(String));
  });

  test('returns detail using the authenticated user id', async () => {
    const history = { _id: req.params.id, userId: req.user.id };
    service.getMyDiagnosisHistoryById.mockResolvedValue(history);

    await controller.getMyDiagnosisHistoryById(req, res, next);

    expect(service.getMyDiagnosisHistoryById).toHaveBeenCalledWith(
      req.user.id,
      req.params.id
    );
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      history
    );
  });

  test('deletes history using the authenticated user id', async () => {
    const history = { _id: req.params.id, userId: req.user.id };
    service.deleteMyDiagnosisHistory.mockResolvedValue(history);

    await controller.deleteMyDiagnosisHistory(req, res, next);

    expect(service.deleteMyDiagnosisHistory).toHaveBeenCalledWith(
      req.user.id,
      req.params.id
    );
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      history
    );
  });

  test('returns not found when history to delete is absent', async () => {
    service.deleteMyDiagnosisHistory.mockResolvedValue(null);

    await controller.deleteMyDiagnosisHistory(req, res, next);

    expect(apiResponse.notFound).toHaveBeenCalledWith(res, expect.any(String));
    expect(apiResponse.success).not.toHaveBeenCalled();
  });

  test('passes delete errors to the error middleware', async () => {
    const error = new Error('delete failure');
    service.deleteMyDiagnosisHistory.mockRejectedValue(error);

    await controller.deleteMyDiagnosisHistory(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('passes service errors to the error middleware', async () => {
    const error = new Error('failure');
    service.getMyDiagnosisHistories.mockRejectedValue(error);

    await controller.getMyDiagnosisHistories(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
