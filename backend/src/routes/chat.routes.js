const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const controller = require("../controllers/chat.controller");

router.post("/", authenticate, controller.send);
router.get("/history", authenticate, controller.list);
router.get("/manager/turns", authenticate, controller.listManager);
router.get("/report.csv", authenticate, controller.exportReport);
router.patch("/:id/timing", authenticate, controller.recordTiming);

module.exports = router;
