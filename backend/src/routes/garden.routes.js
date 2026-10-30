const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const customer = require("../middlewares/garden.middleware");
const garden = require("../controllers/garden.controller");

router.use(authenticate, customer);
router.get("/", garden.list);
router.post("/", garden.create);
router.get("/:id", garden.detail);
router.patch("/:id", garden.update);
router.patch("/:id/archive", garden.archive);

module.exports = router;
