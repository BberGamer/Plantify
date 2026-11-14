const router = require("express").Router();
const service = require("../services/care.service");
const { success } = require("../utils/api-response");
router.use(require("../middlewares/auth.middleware").authenticate, require("../middlewares/garden.middleware"));
const handle = (action, status = 200) => async (req, res, next) => {
  try { success(res, "Thao tác lịch chăm sóc thành công.", await action(req), status); }
  catch (error) { next(error); }
};
router.get("/", handle(req => service.list(req.user.id, req.query)));
router.post("/", handle(req => service.create(req.user.id, req.body), 201));
router.patch("/:id/complete", handle(req => service.complete(req.user.id, req.params.id, req.body)));
router.delete("/:id", handle(req => service.remove(req.user.id, req.params.id)));
module.exports = router;
