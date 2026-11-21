const router = require("express").Router();
const {
  authenticate,
  authorizeManager,
} = require("../middlewares/auth.middleware");
const authorizeCustomer = require("../middlewares/garden.middleware");
const controller = require("../controllers/treatment.controller");

router.use(authenticate);
router.get("/manager", authorizeManager, controller.managerList);
router.post("/manager", authorizeManager, controller.managerCreate);
router.post(
  "/manager/ai-draft",
  authorizeManager,
  require("../middlewares/treatment-document.middleware").uploadTreatmentDocument,
  controller.managerAiDraft,
);
router.get("/manager/:id", authorizeManager, controller.managerDetail);
router.put("/manager/:id", authorizeManager, controller.managerUpdate);
router.patch(
  "/manager/:id/deprecate",
  authorizeManager,
  controller.managerDeprecate,
);

router.use(authorizeCustomer);
router.post("/preview", controller.preview);
router.get("/protocols", controller.protocols);
router.post("/schedules", controller.generate);
router.get("/schedules/:id", controller.detail);
router.post("/schedules/:id/activate", controller.activate);
router.patch("/schedules/:id/tasks/:taskId/complete", controller.completeTask);
router.patch("/schedules/:id/tasks/:taskId/reschedule", controller.rescheduleTask);
router.patch("/schedules/:id/finish", controller.finish);

module.exports = router;
