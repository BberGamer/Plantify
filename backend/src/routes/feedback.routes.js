const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeActiveCustomer = require("../middlewares/garden.middleware");
const upload = require("../middlewares/feedback-upload.middleware");
const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const controller = require("../controllers/feedback.controller");

async function authorizeActiveManager(req, res, next) {
  try {
    if (typeof req.user?.id !== "string" || !/^[a-f\d]{24}$/i.test(req.user.id))
      throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
    if (!await User.exists({ _id: req.user.id, role: "manager", status: true }))
      throw new AppError("FORBIDDEN", 403, "Chỉ quản lý đang hoạt động được truy cập đóng góp.");
    next();
  } catch (error) { next(error); }
}

router.use(authenticate);
router.use("/manager", authorizeActiveManager);
router.get("/manager", controller.list(true));
router.get("/manager/export-images", controller.exportImages);
router.get("/manager/:id/images/:index", controller.image(true));
router.get("/manager/:id/history-image", controller.managerHistoryImage);
router.get("/manager/:id", controller.detail(true));
router.patch("/manager/:id/review", controller.review);

router.get("/", authorizeActiveCustomer, controller.list());
router.get("/:id/images/:index", authorizeActiveCustomer, controller.image());
router.get("/:id", authorizeActiveCustomer, controller.detail());
router.post("/", authorizeActiveCustomer, controller.requireVip, upload, controller.create);

module.exports = router;
