const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const controller = require("../controllers/chat.controller");

router.post("/", authenticate, controller.send);

module.exports = router;
