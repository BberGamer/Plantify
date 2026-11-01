const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeCustomer = require("../middlewares/garden.middleware");
const controller = require("../controllers/treatment.controller");

router.use(authenticate, authorizeCustomer);
router.get("/protocols", controller.protocols);
router.post("/schedules", controller.generate);
router.get("/schedules/:id", controller.detail);
router.post("/schedules/:id/activate", controller.activate);
router.patch("/schedules/:id/tasks/:taskId/complete", controller.completeTask);
router.patch("/schedules/:id/tasks/:taskId/reschedule", controller.rescheduleTask);
router.patch("/schedules/:id/finish", controller.finish);

module.exports = router;
