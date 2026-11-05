const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const controller = require("../controllers/chat.controller");

router.post("/", authenticate, controller.send);
router.get("/history", authenticate, controller.list);
router.post("/:id/evaluation", authenticate, controller.evaluate);
router.get("/:id/evaluation", authenticate, controller.getEvaluation);

module.exports = router;
