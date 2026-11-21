const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeActiveCustomer = require("../middlewares/garden.middleware");
const controller = require("../controllers/notification.controller");

// A scoped revocation key permits cleanup after local sign-out.
router.delete("/devices/:installationId", controller.revokeDevice);
router.use(authenticate, authorizeActiveCustomer);
router.get("/", controller.list);
router.get("/unread-count", controller.unreadCount);
router.get("/events", controller.events);
router.get("/preferences", controller.preferences);
router.patch("/preferences", controller.updatePreferences);
router.put("/devices/:installationId", controller.registerDevice);
router.get("/:id", controller.detail);
router.patch("/:id/read", controller.markRead);
module.exports = router;
