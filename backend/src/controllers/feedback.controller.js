const service = require("../services/feedback.service");
const validate = require("../validators/feedback.validator");
const { success } = require("../utils/api-response");
const AppError = require("../utils/app-error");

const action = (handler) => async (req, res, next) => {
  try { await handler(req, res, next); }
  catch (error) { next(error); }
};

const requireVip = async (req, res, next) => {
  try { await service.assertVip(req.user.id); next(); }
  catch (error) { next(error); }
};

const create = action(async (req, res) => {
  const input = validate.create(req.body, req.get("Idempotency-Key"));
  const result = await service.create(req.user.id, input, req.files);
  return success(res, "Đã gửi đóng góp.", result, 201);
});

const list = (manager = false) => action(async (req, res) =>
  success(res, "Đã tải danh sách đóng góp.",
    await service.list(validate.list(req.query, manager), manager ? null : req.user.id)));

const detail = (manager = false) => action(async (req, res) =>
  success(res, "Đã tải đóng góp.", await service.detail(req.params.id, manager ? null : req.user.id)));

const review = action(async (req, res) =>
  success(res, "Đã lưu kết quả xử lý.",
    await service.review(req.params.id, req.user.id, validate.review(req.body))));

function sendPrivateImage(res, next, data, missingImage) {
  res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  if (Buffer.isBuffer(data)) return res.type("image/jpeg").send(data);
  res.sendFile(data, error => {
    if (error) next(error.code === "ENOENT"
      ? missingImage : error);
  });
}

const image = (manager = false) => action(async (req, res, next) => {
  const data = await service.image(req.params.id, req.params.index, manager ? null : req.user.id);
  return sendPrivateImage(res, next, data,
    new AppError("FEEDBACK_IMAGE_NOT_FOUND", 404, "Ảnh đóng góp không còn khả dụng."));
});

const managerHistoryImage = action(async (req, res, next) => {
  const data = await service.managerHistoryImage(req.params.id);
  return sendPrivateImage(res, next, data,
    new AppError("DIAGNOSIS_IMAGE_NOT_FOUND", 404, "Ảnh của kết quả đã liên kết không còn khả dụng."));
});

module.exports = { requireVip, create, list, detail, review, image, managerHistoryImage };
