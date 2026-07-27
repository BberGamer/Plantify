// careEvent.controller.js - HTTP handlers cho CareEvent My Garden
const apiResponse = require('../../utils/apiResponse');
const service = require('./careEvent.service');
/** Tạo sự kiện chăm sóc cho cây hiện tại. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function create(req, res, next) { try { const data = await service.createCareEvent(req.user.id, req.params.id, req.body); return data ? apiResponse.created(res, 'Đã thêm lịch sử chăm sóc', data) : apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden'); } catch (error) { return next(error); } }
/** Lấy lịch sử chăm sóc của cây. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function list(req, res, next) { try { const data = await service.getCareEvents(req.user.id, req.params.id); return data ? apiResponse.success(res, 'Lấy lịch sử chăm sóc thành công', data) : apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden'); } catch (error) { return next(error); } }
/** Xóa sự kiện chăm sóc của cây. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function remove(req, res, next) { try { const data = await service.deleteCareEvent(req.user.id, req.params.id, req.params.eventId); return data ? apiResponse.success(res, 'Đã xóa lịch sử chăm sóc', data) : apiResponse.notFound(res, 'Không tìm thấy lịch sử chăm sóc'); } catch (error) { return next(error); } }
module.exports = { create, list, remove };
