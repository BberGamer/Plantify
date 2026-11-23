const service = require("../services/notification.service");
const devices = require("../services/notificationDevice.service");
const { success } = require("../utils/api-response");

const handle = (action) => async (req, res, next) => {
  try { return success(res, "Thao tác thông báo thành công.", await action(req)); }
  catch (error) { next(error); }
};

function events(req, res) {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
  });
  const write = (frame) => {
    if (!res.write(frame)) res.end();
  };
  const changed = () => write("data: changed\n\n");
  const unsubscribe = service.subscribe(req.user.id, changed);
  const heartbeat = setInterval(() => write(": heartbeat\n\n"), 15000);
  const expiration = setTimeout(() => res.end(), Math.max(0, req.user.exp * 1000 - Date.now()));
  res.once("close", () => {
    unsubscribe();
    clearInterval(heartbeat);
    clearTimeout(expiration);
  });
  res.flushHeaders();
  changed();
}

module.exports = {
  list: handle(req => service.list(req.user.id, req.query)),
  unreadCount: handle(req => service.unreadCount(req.user.id)),
  events,
  detail: handle(req => service.detail(req.user.id, req.params.id)),
  markRead: handle(req => service.markRead(req.user.id, req.params.id)),
  markAllRead: handle(req => service.markAllRead(req.user.id)),
  preferences: handle(req => service.preferences(req.user.id)),
  updatePreferences: handle(req => service.updatePreferences(req.user.id, req.body)),
  registerDevice: handle(req => devices.register(req.user.id, req.params.installationId, req.body)),
  revokeDevice: handle(req => devices.revoke(req.params.installationId, req.body)),
};
