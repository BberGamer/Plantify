const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeActiveCustomer = require("../middlewares/garden.middleware");
const controller = require("../controllers/notification.controller");

router.use(authenticate, authorizeActiveCustomer);
router.get("/", controller.list);
router.patch("/:id/read", controller.markRead);
module.exports = router;
