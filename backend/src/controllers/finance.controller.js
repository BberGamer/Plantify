const service = require("../services/finance.service");
const { success } = require("../utils/api-response");
const action = (work) => async (req, res, next) => {
  try { res.set("Cache-Control", "no-store"); success(res, "Thành công.", await work(req)); }
  catch (error) { next(error); }
};
module.exports = {
  summary: action((r) => service.summary(r.user.id)),
  topup: action((r) => service.createTopup(r.user.id, r.body)),
  purchase: action((r) => service.purchase(r.user.id, r.body)),
  orders: action((r) => service.list("orders", r.user.id, r.query)),
  transactions: action((r) => service.list("transactions", r.user.id, r.query)),
  order: action((r) => service.orderDetail(r.user.id, r.params.id)),
  adminOrders: action((r) => service.list("orders", null, r.query)),
  adminTransactions: action((r) => service.list("transactions", null, r.query)),
  adminEvents: action((r) => service.list("events", null, r.query)),
  review: action((r) => service.review(r.user.id, r.params.id, r.body)),
  adjust: action((r) => service.adjust(r.user.id, r.body)),
  webhook: action((r) => service.webhook(require("../integrations/sepay.service").verify(r.body, r.headers))),
};
