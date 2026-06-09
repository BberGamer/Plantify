// plant.controller.js - Xử lý request/response cho Plants
const plantService = require('./plant.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * Xử lý request GET /api/plants.
 *
 * Controller chỉ làm nhiệm vụ điều phối:
 * 1. Nhận query string từ request, ví dụ category/page/limit.
 * 2. Gọi plantService.getAllPlants để lấy dữ liệu từ database.
 * 3. Trả response theo format chung { success, message, data }.
 * 4. Nếu có lỗi thì chuyển cho errorHandler thông qua next(error).
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xử lý lỗi
 */
async function getAllPlants(req, res, next) {
  try {
    // req.query chứa các query param trên URL, ví dụ /api/plants?category=indoor&page=1&limit=10.
    const plants = await plantService.getAllPlants(req.query);

    // Dùng helper apiResponse để format response thống nhất toàn bộ backend.
    return apiResponse.success(res, 'Lấy danh sách cây thành công', plants);
  } catch (error) {
    // Không tự res lỗi ở đây để errorHandler xử lý tập trung.
    return next(error);
  }
}

module.exports = { getAllPlants };
