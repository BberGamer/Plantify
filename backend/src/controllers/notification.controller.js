const service = require("../services/notification.service");
const { success } = require("../utils/api-response");

const handle = (action) => async (req, res, next) => {
  try { return success(res, "Thao tác thông báo thành công.", await action(req)); }
  catch (error) { next(error); }
};

module.exports = {
  list: handle(req => service.list(req.user.id, req.query)),
  markRead: handle(req => service.markRead(req.user.id, req.params.id)),
};
