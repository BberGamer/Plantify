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

  test('passes service errors to the error middleware', async () => {
    const error = new Error('failure');
    service.getMyDiagnosisHistories.mockRejectedValue(error);

    await controller.getMyDiagnosisHistories(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
