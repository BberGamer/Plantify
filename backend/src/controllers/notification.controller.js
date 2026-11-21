const service = require("../services/notification.service");
const devices = require("../services/notificationDevice.service");
const { success } = require("../utils/api-response");

const handle = (action) => async (req, res, next) => {
  try { return success(res, "Thao tác thông báo thành công.", await action(req)); }
  catch (error) { next(error); }
};

module.exports = {
  list: handle(req => service.list(req.user.id, req.query)),
  detail: handle(req => service.detail(req.user.id, req.params.id)),
  markRead: handle(req => service.markRead(req.user.id, req.params.id)),
  preferences: handle(req => service.preferences(req.user.id)),
  updatePreferences: handle(req => service.updatePreferences(req.user.id, req.body)),
  registerDevice: handle(req => devices.register(req.user.id, req.params.installationId, req.body)),
  revokeDevice: handle(req => devices.revoke(req.params.installationId, req.body)),
};
