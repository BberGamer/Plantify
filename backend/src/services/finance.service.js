const crypto = require("crypto");
const withTransactionResult = require("../utils/transaction-result");
const User = require("../models/user.model");
const {
  TopupOrder: Order,
  WalletTransaction: Ledger,
  PaymentEvent: Event,
} = require("../models/finance.model");
const { PLANS, isVip, vipExpiry } = require("../utils/vip");
const v = require("../validators/finance.validator");
const common = require("../validators/common");
const AppError = require("../utils/app-error");
const fail = (code, message, status = 409) => {
  throw new AppError(code, status, message);
};
async function expireTopups(filter = {}) {
  const now = new Date();
  return Order.updateMany(
    { ...filter, status: "pending", expires_at: { $lte: now } },
    { $set: {
      status: "rejected",
      reason: "Đơn nạp đã hết thời hạn thanh toán 15 phút và tự động bị từ chối.",
      completed_at: now,
    } },
    { runValidators: true },
  );
}
let ready;
async function transaction(work) {
  if (!ready)
    ready = Promise.all([Order.init(), Ledger.init(), Event.init()]).catch(
      (e) => {
        ready = null;
        throw e;
      },
    );
  await ready;
  // Khi hai yêu cầu cùng idempotency key đua nhau tạo index, thử đọc lại kết quả đã commit.
  for (let attempt = 0; ; attempt++) {
    try {
      return await withTransactionResult(work, {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      });
    } catch (e) {
      if (e.code !== 11000 || attempt >= 1) throw e;
    }
  }
}
async function account(id, session, role = "customer", optional = false) {
  common.id(id);
  const user = await User.findOne({ _id: id, role, status: true })
    .select("role status balance isproaccount vip_plan vip_expires_at")
    .session(session);
  if (!user && !optional)
    fail("FORBIDDEN", "Tài khoản không hoạt động hoặc không có quyền.", 403);
  return user;
}
const bank = () => ({
  bank_code: process.env.SEPAY_BANK_CODE || "",
  account_number: process.env.SEPAY_ACCOUNT_NUMBER || "",
  account_name: process.env.SEPAY_ACCOUNT_NAME || "",
  virtual_account: process.env.SEPAY_VIRTUAL_ACCOUNT?.trim() || "",
});
function presentOrder(doc) {
  const item = doc.toObject ? doc.toObject() : doc;
  const configured = Boolean(
    item.bank_code && item.account_number && item.account_name,
  );
  const receivingAccount = item.virtual_account || item.account_number;
  return {
    ...item,
    receiving_account: receivingAccount,
    expired:
      item.status === "pending" && new Date(item.expires_at) <= new Date(),
    qr_url: configured
      ? `https://qr.sepay.vn/img?${new URLSearchParams({
          bank: item.bank_code,
          acc: receivingAccount,
          amount: String(item.amount),
          des: item.code,
        })}`
      : null,
  };
}
async function summary(userId) {
  const user = await User.findOne({
    _id: userId,
    role: "customer",
    status: true,
  }).lean();
  if (!user) fail("FORBIDDEN", "Tài khoản không khả dụng.", 403);
  const active = isVip(user);
  // Đồng bộ cờ hết hạn có điều kiện; không ghi đè lần gia hạn đồng thời.
  if (!active && user.isproaccount)
    await User.updateOne(
      { _id: userId, vip_expires_at: { $lte: new Date() } },
      { $set: { isproaccount: false } },
    );
  return {
    balance: user.balance || 0,
    isproaccount: active,
    vip_plan: user.vip_plan || null,
    vip_expires_at: user.vip_expires_at || null,
    plans: PLANS,
    payment_configured: Boolean(
      bank().bank_code &&
      bank().account_number &&
      bank().account_name &&
      process.env.SEPAY_WEBHOOK_SECRET?.trim(),
    ),
  };
}
async function createTopup(userId, input) {
  v.fields(input, ["amount", "request_key"]);
  const amount = v.amount(input.amount),
    key = v.key(input.request_key);
  await expireTopups({ user_id: userId });
  return transaction(async (session) => {
    await account(userId, session);
    const existing = await Order.findOne({
      user_id: userId,
      request_key: key,
    }).session(session);
    if (existing) {
      if (existing.amount !== amount)
        fail("IDEMPOTENCY_CONFLICT", "Mã yêu cầu đã dùng cho số tiền khác.");
      return presentOrder(existing);
    }
    const [order] = await Order.create(
      [
        {
          user_id: userId,
          request_key: key,
          amount,
          code:
            "PLANTIFY" + crypto.randomBytes(8).toString("hex").toUpperCase(),
          ...bank(),
          expires_at: new Date(Date.now() + 15 * 60000),
        },
      ],
      { session },
    );
    return presentOrder(order);
  });
}
async function purchase(userId, input) {
  v.fields(input, ["plan", "request_key"]);
  const plan = PLANS.find((p) => p.code === input.plan);
  if (!plan) v.fail("Gói VIP không hợp lệ.", "plan");
  const key = `purchase_${v.key(input.request_key)}`;
  return transaction(async (session) => {
    const user = await account(userId, session);
    const existing = await Ledger.findOne({
      actor_id: userId,
      request_key: key,
    }).session(session);
    if (existing) {
      if (existing.type !== "purchase" || existing.plan !== plan.code)
        fail("IDEMPOTENCY_CONFLICT", "Mã yêu cầu đã được sử dụng.");
      return existing;
    }
    if (!Number.isSafeInteger(user.balance ?? 0) || user.balance < 0)
      fail("BALANCE_LIMIT", "Số dư hiện tại không hợp lệ.");
    if ((user.balance ?? 0) < plan.price)
      fail("INSUFFICIENT_BALANCE", "Số dư không đủ. Vui lòng nạp tiền.");
    const expires = vipExpiry(
      isVip(user) ? user.vip_expires_at : null,
      plan.days,
    );
    const updated = await User.findOneAndUpdate(
      {
        _id: userId,
        status: true,
        role: "customer",
        balance: { $gte: plan.price },
      },
      {
        $inc: { balance: -plan.price },
        $set: {
          vip_expires_at: expires,
          isproaccount: true,
          vip_plan: plan.code,
        },
      },
      { new: true, session, runValidators: true },
    ).select("balance vip_expires_at");
    if (!updated)
      fail("INSUFFICIENT_BALANCE", "Số dư không đủ. Vui lòng nạp tiền.");
    const [record] = await Ledger.create(
      [
        {
          user_id: userId,
          actor_id: userId,
          request_key: key,
          type: "purchase",
          amount: -plan.price,
          balance_after: updated.balance,
          plan: plan.code,
          days: plan.days,
          vip_expires_at: updated.vip_expires_at,
        },
      ],
      { session },
    );
    return record;
  });
}
async function credit(user, amount, record, session) {
  if (!Number.isSafeInteger(user.balance ?? 0) || user.balance < 0)
    fail("BALANCE_LIMIT", "Số dư hiện tại không hợp lệ.");
  const updated = await User.findOneAndUpdate(
    {
      _id: user._id,
      role: "customer",
      status: true,
      $or: [
        { balance: { $exists: false } },
        { balance: { $gte: 0, $lte: Number.MAX_SAFE_INTEGER - amount } },
      ],
    },
    { $inc: { balance: amount } },
    { new: true, session, runValidators: true },
  ).select("balance");
  if (!updated || !Number.isSafeInteger(updated.balance))
    fail("BALANCE_LIMIT", "Không thể cộng số dư.");
  const [entry] = await Ledger.create(
    [{ ...record, user_id: user._id, amount, balance_after: updated.balance }],
    { session },
  );
  return entry;
}
async function review(adminId, id, input) {
  v.fields(input, ["status", "reason", "request_key"]);
  if (input.request_key !== undefined) v.key(input.request_key);
  common.id(id);
  if (!["success", "rejected"].includes(input.status))
    v.fail("Trạng thái không hợp lệ.", "status");
  const reason = v.reason(input.reason);
  await expireTopups({ _id: id });
  return transaction(async (session) => {
    await account(adminId, session, "admin");
    const order = await Order.findById(id).session(session);
    if (!order) fail("ORDER_NOT_FOUND", "Không tìm thấy đơn nạp.", 404);
    if (order.status !== "pending")
      fail("ORDER_FINAL", "Đơn đã kết thúc, không được thay đổi.");
    const user =
      input.status === "success"
        ? await account(String(order.user_id), session)
        : null;
    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, status: "pending", expires_at: { $gt: new Date() } },
      {
        $set: {
          status: input.status,
          reason,
          reviewed_by: adminId,
          completed_at: new Date(),
        },
      },
      { new: true, session, runValidators: true },
    );
    if (!claimed) fail("ORDER_FINAL", "Đơn đã kết thúc, không được thay đổi.");
    if (input.status === "success")
      await credit(
        user,
        order.amount,
        {
          actor_id: adminId,
          request_key: `order_${id}`,
          type: "topup",
          order_id: id,
          reason: `Admin duyệt: ${reason}`,
        },
        session,
      );
    return presentOrder(claimed);
  });
}
async function adjust(adminId, input) {
  v.fields(input, ["user_id", "amount", "reason", "request_key"]);
  common.id(input.user_id);
  input = { ...input, user_id: input.user_id.toLowerCase() };
  const amount = v.amount(input.amount),
    reason = v.reason(input.reason),
    key = `adjustment_${v.key(input.request_key)}`;
  return transaction(async (session) => {
    await account(adminId, session, "admin");
    const old = await Ledger.findOne({
      actor_id: adminId,
      request_key: key,
    }).session(session);
    if (old) {
      if (
        old.type !== "adjustment" ||
        old.amount !== amount ||
        String(old.user_id) !== input.user_id ||
        old.reason !== reason
      )
        fail("IDEMPOTENCY_CONFLICT", "Mã yêu cầu đã được sử dụng.");
      return old;
    }
    const user = await account(input.user_id, session);
    return credit(
      user,
      amount,
      { actor_id: adminId, request_key: key, type: "adjustment", reason },
      session,
    );
  });
}
async function webhook(payload) {
  if (
    !payload ||
    !Number.isSafeInteger(payload.id) ||
    payload.id < 0 ||
    !Number.isSafeInteger(payload.transferAmount) ||
    payload.transferAmount <= 0 ||
    typeof payload.accountNumber !== "string" ||
    !payload.accountNumber.trim() ||
    payload.accountNumber.length > 100 ||
    typeof payload.gateway !== "string" ||
    !payload.gateway.trim() ||
    payload.gateway.length > 100 ||
    typeof payload.content !== "string" ||
    payload.content.length > 2000 ||
    (payload.subAccount != null &&
      (typeof payload.subAccount !== "string" ||
        payload.subAccount.length > 100)) ||
    !["in", "out"].includes(payload.transferType)
  )
    v.fail("Dữ liệu giao dịch SePay không hợp lệ.");
  // SePay dùng id=0 cho nút Gửi thử. Controller đã xác minh HMAC trước bước này.
  // Chỉ xác nhận kết nối; tuyệt đối không mở transaction, tìm đơn hoặc ghi số dư.
  if (payload.id === 0)
    return {
      test: true,
      credited: false,
      status: "test_received",
      message:
        "Đã nhận webhook thử SePay. Không phát sinh giao dịch hoặc thay đổi số dư.",
    };
  await expireTopups();
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
  return transaction(async (session) => {
    const old = await Event.findOne({
      provider_id: String(payload.id),
    }).session(session);
    if (old) {
      if (old.payload_hash !== hash)
        fail("PAYMENT_CONFLICT", "Giao dịch SePay có dữ liệu không nhất quán.");
      return old;
    }
    const codes =
      payload.content.toUpperCase().match(/\bPLANTIFY[A-F0-9]{16}\b/g) || [];
    const order =
      codes.length === 1
        ? await Order.findOne({ code: codes[0] }).session(session)
        : null;
    const event = {
      provider_id: String(payload.id),
      payload_hash: hash,
      amount: payload.transferAmount,
      content: payload.content,
      account_number: payload.accountNumber,
      virtual_account: payload.subAccount || "",
      order_id: order?._id,
      status: "review",
      reason: "Không khớp đơn hoặc giao dịch cần đối soát.",
    };
    if (payload.transferType !== "in")
      event.reason = "Giao dịch tiền ra; không cộng ví.";
    else if (codes.length !== 1)
      event.reason = "Nội dung cần chứa đúng một mã đơn PLANTIFY hợp lệ.";
    else if (!order)
      event.reason = "Không tìm thấy đơn nạp tương ứng mã chuyển khoản.";
    else if (
      !order.account_number ||
      order.account_number !== payload.accountNumber
    )
      event.reason = "Tài khoản ngân hàng nhận tiền không khớp đơn nạp.";
    else if (
      order.virtual_account &&
      order.virtual_account !== payload.subAccount
    )
      event.reason = "Tài khoản ảo VA nhận tiền không khớp đơn nạp.";
    else if (
      !order.bank_code ||
      payload.gateway.toLowerCase() !== order.bank_code.toLowerCase()
    )
      event.reason = "Ngân hàng nhận tiền không khớp đơn nạp.";
    else if (payload.transferAmount !== order.amount)
      event.reason = "Số tiền chuyển khoản không khớp số tiền đơn nạp.";
    else {
      // Chỉ bên nhận được đơn pending mới được cộng tiền.
      const user = await account(
        String(order.user_id),
        session,
        "customer",
        true,
      );
      if (!user)
        event.reason =
          "Tài khoản nhận số dư không còn hoạt động; cần đối soát.";
      else if (order.status === "success") {
        event.status = "already_processed";
        event.reason = "Đơn đã được cộng tiền.";
      } else if (order.status === "rejected")
        event.reason =
          "Đơn đã bị từ chối; cần Admin đối soát khoản tiền nhận được.";
      else if (order.expires_at <= new Date())
        event.reason =
          "Tiền đến sau hạn thanh toán của đơn; cần Admin đối soát.";
      else if (order.status === "pending") {
        const claimed = await Order.findOneAndUpdate(
          {
            _id: order._id,
            status: "pending",
            expires_at: { $gt: new Date() },
          },
          {
            $set: {
              status: "success",
              completed_at: new Date(),
              reason: "SePay xác nhận",
            },
          },
          { new: true, session, runValidators: true },
        );
        if (!claimed)
          fail("ORDER_FINAL", "Đơn đã thay đổi trạng thái, vui lòng thử lại.");
        await credit(
          user,
          order.amount,
          {
            actor_id: order.user_id,
            request_key: `sepay_${payload.id}`,
            type: "topup",
            order_id: order._id,
            reason: "SePay xác nhận",
          },
          session,
        );
        event.status = "credited";
        event.reason = "Đã cộng ví.";
      }
    }
    const [saved] = await Event.create([event], { session });
    return saved;
  });
}
async function list(kind, userId, input = {}) {
  v.fields(input, [
    "page",
    ...(kind === "transactions" ? ["type"] : ["status"]),
    ...(!userId && kind !== "events" ? ["user_id"] : []),
  ]);
  const { page, limit } = v.page(input);
  const model = { orders: Order, transactions: Ledger, events: Event }[kind];
  const filter = userId ? { user_id: userId } : {};
  if (!userId && input.user_id !== undefined) {
    common.id(input.user_id);
    filter.user_id = input.user_id;
  }
  if (input.status !== undefined && kind !== "transactions") {
    if (
      !(
        kind === "orders"
          ? ["pending", "success", "rejected"]
          : ["review", "credited", "already_processed"]
      ).includes(input.status)
    )
      v.fail("Bộ lọc trạng thái không hợp lệ.");
    filter.status = input.status;
  }
  if (kind === "transactions" && input.type !== undefined) {
    if (!["topup", "purchase", "adjustment"].includes(input.type))
      v.fail("Loại giao dịch không hợp lệ.");
    filter.type = input.type;
  }
  if (kind === "orders")
    await expireTopups(userId ? { user_id: userId } : {});
  const [items, total] = await Promise.all([
    model
      .find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    model.countDocuments(filter),
  ]);
  return {
    items: kind === "orders" ? items.map(presentOrder) : items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
async function orderDetail(userId, id) {
  common.id(id);
  await expireTopups({ _id: id, user_id: userId });
  const order = await Order.findOne({ _id: id, user_id: userId }).lean();
  if (!order) fail("ORDER_NOT_FOUND", "Không tìm thấy đơn nạp.", 404);
  return presentOrder(order);
}
module.exports = {
  expireTopups,
  summary,
  createTopup,
  purchase,
  review,
  adjust,
  webhook,
  list,
  orderDetail,
};
