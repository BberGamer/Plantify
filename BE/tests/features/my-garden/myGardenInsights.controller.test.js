jest.mock('../../../src/features/my-garden/myGardenInsights.service');
jest.mock('../../../src/utils/apiResponse');

const apiResponse = require('../../../src/utils/apiResponse');
const service = require(
  '../../../src/features/my-garden/myGardenInsights.service'
);
const controller = require(
  '../../../src/features/my-garden/myGardenInsights.controller'
);

describe('My Garden insights controller', () => {
  const req = {
    user: { id: '507f1f77bcf86cd799439011' },
    params: { id: '507f1f77bcf86cd799439012' },
    query: { page: '2', limit: '5' },
  };
  const res = {};
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('timeline passes token owner, plant and pagination to service', async () => {
    const timeline = { events: [], total: 0, pages: 1, currentPage: 2 };
    service.getMyUserPlantTimeline.mockResolvedValue(timeline);

    await controller.getTimeline(req, res, next);

    expect(service.getMyUserPlantTimeline).toHaveBeenCalledWith(
      req.user.id,
      req.params.id,
      req.query
    );
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      timeline
    );
  });

  test('timeline returns 404 for a plant outside current ownership', async () => {
    service.getMyUserPlantTimeline.mockResolvedValue(null);
    await controller.getTimeline(req, res, next);
    expect(apiResponse.notFound).toHaveBeenCalledWith(
      res,
      expect.any(String)
    );
  });

  test('dashboard only uses current token owner', async () => {
    const dashboard = { totalPlants: 0 };
    service.getMyGardenDashboard.mockResolvedValue(dashboard);
    await controller.getDashboard(req, res, next);
    expect(service.getMyGardenDashboard).toHaveBeenCalledWith(req.user.id);
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      dashboard
    );
  });
});
