const treatment = require("../services/treatment.service");
const { success } = require("../utils/api-response");

const handle = (action, message, statusCode = 200) => async (req, res, next) => {
  try {
    const data = await action(req);
    return success(res, message, data, statusCode);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protocols: handle(
    (req) =>
      treatment.getApprovedProtocols(req.query.disease_id, req.query.plant_id),
    "Lấy danh sách phác đồ điều trị thành công.",
  ),
  preview: handle(
    (req) => require("../services/treatment-ai.service").createCustomerPreview(
      req.user.id,
      req.body,
    ),
    "Đã tạo bản xem trước phác đồ điều trị.",
    201,
  ),
  generate: handle(
    (req) => treatment.generateSchedule(req.user.id, req.body),
    "Tạo lịch điều trị thành công.",
    201,
  ),
  detail: handle(
    (req) => treatment.getSchedule(req.user.id, req.params.id),
    "Lấy lịch điều trị thành công.",
  ),
  activate: handle(
    (req) => treatment.activateSchedule(req.user.id, req.params.id),
    "Bắt đầu điều trị thành công.",
  ),
  completeTask: handle(
    (req) =>
      treatment.completeTask(req.user.id, req.params.id, req.params.taskId),
    "Hoàn thành công việc điều trị thành công.",
  ),
  rescheduleTask: handle(
    (req) =>
      treatment.rescheduleTask(
        req.user.id,
        req.params.id,
        req.params.taskId,
        req.body,
      ),
    "Đổi lịch công việc điều trị thành công.",
  ),
  finish: handle(
    (req) => treatment.finishSchedule(req.user.id, req.params.id, req.body),
    "Kết thúc điều trị thành công.",
  ),
  managerList: handle(
    (req) => treatment.getManagerProtocols(req.query),
    "Lấy danh sách phác đồ điều trị thành công.",
  ),
  managerDetail: handle(
    (req) => treatment.getManagerProtocol(req.params.id),
    "Lấy phác đồ điều trị thành công.",
  ),
  managerCreate: handle(
    (req) => treatment.createProtocol(req.user.id, req.body),
    "Tạo phác đồ điều trị thành công.",
    201,
  ),
  managerAiDraft: handle(
    (req) => require("../services/treatment-ai.service").generateFromDocument(
      req.user.id,
      req.body,
      req.file,
    ),
    "Đã tạo phác đồ từ tài liệu DOCX.",
    201,
  ),
  managerUpdate: handle(
    (req) => treatment.updateProtocol(req.user.id, req.params.id, req.body),
    "Cập nhật phác đồ điều trị thành công.",
  ),
  managerDeprecate: handle(
    (req) => treatment.deprecateProtocol(req.params.id),
    "Ngừng sử dụng phác đồ điều trị thành công.",
  ),
};
