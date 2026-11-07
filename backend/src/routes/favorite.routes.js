const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const requireCustomer = require("../middlewares/garden.middleware");
const favorite = require("../controllers/favorite.controller");

router.use(authenticate, requireCustomer);
router.get("/", favorite.list);
router.get("/status", favorite.status);
router.put("/:plantId", favorite.add);
router.delete("/:plantId", favorite.remove);

module.exports = router;
