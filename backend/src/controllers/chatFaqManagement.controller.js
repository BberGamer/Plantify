const service = require("../services/chatFaqManagement.service");
const { success } = require("../utils/api-response");
const handle = (action, status = 200) => async (req, res, next) => {
  try { return success(res, "Thao tác FAQ thành công.", await action(req), status); }
  catch (error) { next(error); }
};
module.exports = {
  list: handle(req => service.list(req.query)),
  listTurns: handle(req => service.listTurns(req.query)),
  detail: handle(req => service.detail(req.params.id)),
  create: handle(req => service.create(req.body), 201),
  update: handle(req => service.update(req.params.id, req.body)),
  remove: handle(req => service.remove(req.params.id, req.body)),
  approve: handle(req => service.approve(req.params.id, req.body)),
  unapprove: handle(req => service.unapprove(req.params.id, req.body)),
};
