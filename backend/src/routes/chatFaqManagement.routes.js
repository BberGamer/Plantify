const router = require("express").Router();
const { authenticate, authorizeManager } = require("../middlewares/auth.middleware");
const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const v = require("../validators/common");
const controller = require("../controllers/chatFaqManagement.controller");

router.use(authenticate, async (req, res, next) => {
  try {
    v.id(req.user.id);
    const user = await User.findById(req.user.id).select("role status").lean();
    if (!user) throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
    if (!user.status) throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
    req.user = { ...req.user, role: user.role };
    next();
  } catch (error) { next(error); }
}, authorizeManager);
router.get("/", controller.list);
router.get("/chat-turns", controller.listTurns);
router.get("/:id", controller.detail);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.patch("/:id/approve", controller.approve);
router.patch("/:id/unapprove", controller.unapprove);
module.exports = router;
