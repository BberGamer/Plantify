// userPlant.controller.test.js - Kiểm tra controller luôn dùng user từ token
jest.mock('../../../src/features/my-garden/userPlant.service');
jest.mock('../../../src/utils/apiResponse');

const apiResponse = require('../../../src/utils/apiResponse');
const service = require('../../../src/features/my-garden/userPlant.service');
const controller = require('../../../src/features/my-garden/userPlant.controller');

describe('userPlantController', () => {
  const req = {
    user: { id: '507f1f77bcf86cd799439011' },
    params: { id: '507f1f77bcf86cd799439012' },
    body: {
      userId: '507f1f77bcf86cd799439099',
      name: 'Cây của tôi',
    },
  };
  const res = {};
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('tạo cây bằng user id từ token', async () => {
    const userPlant = { _id: req.params.id, userId: req.user.id };
    service.createUserPlant.mockResolvedValue(userPlant);

    await controller.createUserPlant(req, res, next);

    expect(service.createUserPlant).toHaveBeenCalledWith(req.user.id, req.body);
    expect(apiResponse.created).toHaveBeenCalledWith(
      res,
      expect.any(String),
      userPlant
    );
  });

  test('lấy danh sách bằng user id từ token', async () => {
    service.getMyUserPlants.mockResolvedValue([]);

    await controller.getMyUserPlants(req, res, next);

    expect(service.getMyUserPlants).toHaveBeenCalledWith(req.user.id);
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      []
    );
  });

  test.each([
    ['detail', 'getMyUserPlantById'],
    ['update', 'updateMyUserPlant'],
    ['delete', 'archiveMyUserPlant'],
  ])('trả 404 khi %s không tìm thấy cây thuộc user', async (_, serviceMethod) => {
    service[serviceMethod].mockResolvedValue(null);

    if (serviceMethod === 'getMyUserPlantById') {
      await controller.getMyUserPlantById(req, res, next);
    } else if (serviceMethod === 'updateMyUserPlant') {
      await controller.updateMyUserPlant(req, res, next);
    } else {
      await controller.archiveMyUserPlant(req, res, next);
    }

    expect(apiResponse.notFound).toHaveBeenCalledWith(res, expect.any(String));
  });

  test('cập nhật truyền owner, id và payload xuống service', async () => {
    const userPlant = { _id: req.params.id, name: 'Tên mới' };
    service.updateMyUserPlant.mockResolvedValue(userPlant);

    await controller.updateMyUserPlant(req, res, next);

    expect(service.updateMyUserPlant).toHaveBeenCalledWith(
      req.user.id,
      req.params.id,
      req.body
    );
    expect(apiResponse.success).toHaveBeenCalledWith(
      res,
      expect.any(String),
      userPlant
    );
  });

  test('chuyển lỗi service tới error middleware', async () => {
    const error = new Error('Database failed');
    service.createUserPlant.mockRejectedValue(error);

    await controller.createUserPlant(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
