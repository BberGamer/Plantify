const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const c = require("../controllers/finance.controller");
router.use(authenticate);
// Vai trò và trạng thái luôn đối chiếu database, không lấy quyền tài chính từ JWT cũ.
router.use(async (req, res, next) => {
  try {
    const role = req.path.startsWith("/admin/") ? "admin" : "customer";
    if (!await User.exists({ _id: req.user.id, role, status: true }))
      throw new AppError("FORBIDDEN", 403, "Không có quyền sử dụng chức năng tài chính.");
    next();
  } catch (e) { next(e); }
});
router.get("/me", c.summary);
router.get("/orders", c.orders);
router.get("/orders/:id", c.order);
router.post("/orders", c.topup);
router.get("/transactions", c.transactions);
router.post("/vip/purchase", c.purchase);
router.get("/admin/orders", c.adminOrders);
router.get("/admin/transactions", c.adminTransactions);
router.get("/admin/events", c.adminEvents);
router.patch("/admin/orders/:id", c.review);
router.post("/admin/adjustments", c.adjust);
module.exports = router;
