const { createHash } = require("node:crypto");
const { Types } = require("mongoose");
const User = require("../models/user.model");
const { Feedback } = require("../models/feedback.model");
const { TopupOrder, WalletTransaction } = require("../models/finance.model");
const Treatment = require("../models/treatmentSchedule.model");
const ChatTurn = require("../models/chatTurn.model");
const { isVip } = require("../utils/vip");
const { dates, localDateTime, shiftDate } = require("./careRecurrence");
const { normalize } = require("./chatRetrieval.service");
const garden = require("./garden.service");
const care = require("./care.service");
const notifications = require("./notification.service");
const diagnosis = require("./diagnosis.service");
const favorites = require("./favorite.service");
const AppError = require("../utils/app-error");

const domains = {
  care: ["Lịch chăm sóc", /\b(lich cham soc|lich tuoi|lich bon|nho tuoi|viec cham soc|khi nao.*(tuoi|bon)|cham soc.*(hom nay|ngay mai|tuan nay|cua toi)|tuoi.*(hom nay|ngay mai|luc may gio))\b/],
  notifications: ["Thông báo", /\b(thong bao|loi nhac|nhac viec)\b/],
  treatments: ["Lịch điều trị", /\b(lich dieu tri|dang dieu tri|qua trinh dieu tri|dot dieu tri|tien do dieu tri|phac do.*(cua toi|toi da|dang ap dung))\b/],
  garden: ["Vườn cá nhân", /\b(vuon|cay cua toi|cay toi (da |dang )?trong|toi (dang )?co.*cay|cay da them|cay da luu tru)\b/],
  diagnoses: ["Lịch sử nhận diện và chẩn đoán", /\b(lich su.*(chan doan|nhan dien|quet|phan tich)|ket qua.*(cua toi|gan nhat|da luu)|lan (quet|chan doan|nhan dien)|toi (da )?(quet|chan doan|nhan dien))\b/],
  favorites: ["Cây yêu thích", /\b(yeu thich|da luu.*(cay|danh muc)|cay.*da luu)\b/],
  feedback: ["Đóng góp và phản hồi", /\b(feedback|phan hoi|dong gop|gop y)\b/],
  account: ["Hồ sơ và gói VIP", /\b(ho so|tai khoan|email|so dien thoai|ten cua toi|ho ten|vip|goi hien tai|cai dat)\b/],
  orders: ["Đơn nạp tiền", /\b(don nap|nap tien|nap vi|thanh toan|don hang)\b/],
  wallet: ["Ví và giao dịch", /\b(so du|vi cua toi|vi plantify|trong vi|giao dich|chi tieu|tong.*tien|het bao nhieu tien)\b/],
  conversations: ["Lịch sử trò chuyện", /\b(lich su (chat|hoi thoai|tro chuyen)|cuoc tro chuyen|toi da hoi|da tra loi)\b/],
};
const localOnly = new Set(["account", "wallet", "orders", "conversations"]);
const overview = ["care", "notifications", "treatments"];
const stateLabels = {
  pending: "Đang chờ", completed: "Đã hoàn thành", paused: "Tạm dừng",
  generated: "Chưa áp dụng", in_progress: "Đang điều trị", recovered: "Đã hồi phục",
  failed: "Chưa hồi phục", cancelled: "Đã dừng", skipped: "Đã bỏ qua",
  accepted: "Đã chấp nhận", rejected: "Đã từ chối", success: "Thành công",
  topup: "Nạp ví", purchase: "Mua VIP", adjustment: "Điều chỉnh số dư",
};
const state = (value) => stateLabels[value] || "Chưa xác định";
const short = (value, limit = 260) => {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
};
const asDate = (day) => day ? String(day).slice(0, 10).split("-").reverse().join("/") : "";
const inVietnam = (date) => date && Number.isFinite(+new Date(date)) ? localDateTime(+new Date(date)) : "";
const dateTime = (date) => {
  const local = inVietnam(date);
  return local ? `${local.slice(11, 16)} ngày ${asDate(local)}` : "";
};
const amount = (number) => `${new Intl.NumberFormat("vi-VN").format(number || 0)} đ`;

function chooseDomains(text) {
  if (/\b(tat ca|toan bo) (du lieu|thong tin) (cua toi|ca nhan)\b/.test(text))
    return Object.keys(domains);
  const selected = Object.keys(domains).filter((key) => domains[key][1].test(text));
  if (/^vi( tien)?( con bao nhieu| hien tai)?$/.test(text)) selected.push("wallet");
  if (/\b(tong hop|ke hoach|viec gi|can lam gi|lich hom nay)\b/.test(text) &&
      /\b(hom nay|ngay mai|trong ngay|tuan nay)\b/.test(text) && !selected.length)
    return overview;
  return [...new Set(selected)];
}

function period(message, today) {
  const text = normalize(message);
  const explicit = [...message.matchAll(/\b(\d{4}-\d{2}-\d{2})\b|\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g)]
    .map(([, iso, day, month, year]) => iso ||
      `${year || today.slice(0, 4)}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  if (explicit.length) {
    const [from, to = from] = explicit;
    dates(from, to);
    return { from, to };
  }
  if (/\b(hom qua|ngay mai|hom nay|trong ngay|bay gio|sang nay|chieu nay|toi nay)\b/.test(text)) {
    const offset = /\bhom qua\b/.test(text) ? -1 : /\bngay mai\b/.test(text) ? 1 : 0;
    const day = shiftDate(today, offset);
    return { from: day, to: day };
  }
  if (/\b(7 ngay qua|7 ngay toi)\b/.test(text))
    return /\bqua\b/.test(text) ? { from: shiftDate(today, -6), to: today } :
      { from: today, to: shiftDate(today, 6) };
  if (/\b(tuan nay|tuan truoc|tuan sau|tuan toi)\b/.test(text)) {
    const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
    const offset = /tuan truoc/.test(text) ? -7 : /tuan (sau|toi)/.test(text) ? 7 : 0;
    const from = shiftDate(today, offset - weekday);
    return { from, to: shiftDate(from, 6) };
  }
  if (/\b(thang nay|thang truoc)\b/.test(text)) {
    const [year, month] = today.split("-").map(Number);
    const index = month - (/thang truoc/.test(text) ? 2 : 1);
    return {
      from: new Date(Date.UTC(year, index, 1)).toISOString().slice(0, 10),
      to: new Date(Date.UTC(year, index + 1, 0)).toISOString().slice(0, 10),
    };
  }
  return null;
}

function timeFilter(range) {
  return range ? {
    $gte: new Date(`${range.from}T00:00:00+07:00`),
    $lt: new Date(`${shiftDate(range.to, 1)}T00:00:00+07:00`),
  } : null;
}

function dateSection(range) {
  if (!range) return "Dữ liệu hiện có";
  return range.from === range.to ? asDate(range.from) :
    `${asDate(range.from)} đến ${asDate(range.to)}`;
}

async function list(model, userId, filter, fields, { limit, offset }, populate) {
  const scoped = { ...filter, user_id: userId };
  const query = model.find(scoped).select(fields)
    .sort({ _id: -1 }).skip(offset).limit(limit).maxTimeMS(4000);
  if (populate) query.populate(populate);
  const [items, total] = await Promise.all([
    query.lean(),
    model.countDocuments(scoped).maxTimeMS(4000),
  ]);
  return { items, total };
}

function page(rows, limit, render, total = rows.length, summary = "") {
  return { total, summary, rows: rows.slice(0, limit).map(render).filter(Boolean) };
}

const sources = {
  async care(userId, { range, today, limit, offset, text }) {
    const interval = range || { from: today, to: today };
    const { tasks } = await care.list(userId, interval);
    const actions = [
      ["watering", /\btuoi\b/],
      ["fertilizing", /\b(bon|phan bon)\b/],
      ["sunlight", /\b(anh sang|phoi nang)\b/],
    ].filter(([, pattern]) => pattern.test(text)).map(([action]) => action);
    const matching = tasks.filter((task) =>
      (!actions.length || actions.includes(task.action_type)) &&
      (!/\bchua (hoan thanh|lam|tuoi|bon)\b/.test(text) || task.status === "pending") &&
      (!/\bda (hoan thanh|lam xong)\b/.test(text) || task.status === "completed"),
    );
    const completed = matching.filter((task) => task.status === "completed").length;
    const paused = matching.filter((task) => task.status === "paused").length;
    const summary = `${completed} đã hoàn thành, ${paused} tạm dừng, ${matching.length - completed - paused} đang chờ`;
    return {
      ...page(matching.slice(offset), limit, (t) => `Ngày ${asDate(t.date)} lúc ${t.time} – ${short(t.plant_name, 90)} · ${short(t.title, 125)} · ${state(t.status)}${t.notes ? `. ${short(t.notes, 700)}` : ""}`, matching.length, summary),
      range: interval,
    };
  },
  async notifications(userId, { range, today, now, limit, offset, text }) {
    const unreadOnly = /\bchua doc\b/.test(text);
    const interval = range || (unreadOnly || /\b(gan nhat|tat ca|toan bo)\b/.test(text) ? null : { from: today, to: today });
    const window = timeFilter(interval);
    const { items, total, unread } = await notifications.summarize(userId, {
      from: window?.$gte, until: window?.$lt, unreadOnly, now, limit, offset,
    });
    return {
      ...page(items, limit, (n) => `${dateTime(n.scheduled_for)} – ${short(n.title, 150)} (${n.is_read ? "đã đọc" : "chưa đọc"}). ${short(n.message)}`, total, `${unread} chưa đọc`),
      range: interval,
    };
  },
  async garden(userId, { limit, pageNumber, text }) {
    const archived = /\b(da luu tru|da xoa|da an)\b/.test(text);
    const result = await garden.list(userId, { limit, page: pageNumber, archived });
    return page(result.plants, limit, (p) => [
      `${short(p.plant_nickname, 100)} · ${short(p.species_name, 90)}`,
      p.placement_location && `Vị trí ${short(p.placement_location, 100)}`,
      p.pot_type_size && `Chậu ${short(p.pot_type_size, 80)}`,
      p.acquisition_date && `Ngày thêm cây ${asDate(p.acquisition_date)}`,
      p.active_treatment && "Đang điều trị",
    ].filter(Boolean).join(" · "), result.total);
  },
  async treatments(userId, { range, dateWindow, limit, offset, text }) {
    const filter = /\b(dang dieu tri|dang ap dung)\b/.test(text) ? { status: "in_progress" } : {};
    if (dateWindow) filter.tasks = { $elemMatch: { scheduled_date: dateWindow } };
    const { items, total } = await list(Treatment, userId, filter,
      "user_plant_id disease_id protocol_snapshot.protocol_name status tasks.title tasks.status tasks.scheduled_date tasks.instructions tasks.dosage_note follow_up_note",
      { limit, offset }, [
        { path: "user_plant_id", match: { user_id: userId }, select: "plant_nickname" },
        { path: "disease_id", match: { status: "active" }, select: "disease_name" },
      ]);
    return {
      ...page(items, limit, (t) => {
        const relevant = dateWindow ? t.tasks.filter((task) => task.scheduled_date >= dateWindow.$gte && task.scheduled_date < dateWindow.$lt) : t.tasks;
        return [
          `${short(t.user_plant_id?.plant_nickname, 80) || "Cây trong lịch"} · ${short(t.protocol_snapshot?.protocol_name, 100)} · ${state(t.status)}`,
          t.disease_id && `Bệnh ${short(t.disease_id.disease_name, 100)}`,
          `${t.tasks.filter((task) => task.status === "completed").length}/${t.tasks.length} việc đã hoàn thành`,
          ...relevant.sort((a, b) => +a.scheduled_date - +b.scheduled_date)
            .filter((task) => dateWindow || task.status === "pending").slice(0, 3)
            .map((task) => [
              `${dateTime(task.scheduled_date)} · ${short(task.title, 100)} · ${state(task.status)}`,
              short(task.instructions?.join(" "), 220),
              task.dosage_note && `Liều lượng trong lịch ${short(task.dosage_note, 180)}`,
            ].filter(Boolean).join(". ")),
          relevant.length > 3 && dateWindow && `${relevant.length} việc khớp ngày trong lịch này`,
          t.follow_up_note && `Ghi chú theo dõi ${short(t.follow_up_note, 120)}`,
        ].filter(Boolean).join(". ");
      }, total),
      range,
    };
  },
  async diagnoses(userId, { limit, pageNumber, text, dateWindow, range }) {
    const result_kind = /\bnhan dien\b/.test(text) && !/\bchan doan\b/.test(text) ? "plant" :
      /\bchan doan\b/.test(text) && !/\bnhan dien\b/.test(text) ? "disease" : undefined;
    const result = await diagnosis.history(userId, { limit, page: pageNumber, result_kind }, dateWindow);
    return { ...page(result.diagnoses, limit, (d) =>
      `${dateTime(d.created_at)} – ${short(d.plant_name, 120) || "Cây chưa có tên hiển thị"} · ${d.result_kind === "plant" ? "Nhận diện cây" : d.is_healthy ? "Chưa phát hiện bệnh" : short(d.disease_name, 100) || "Chẩn đoán bệnh"}${Number.isFinite(d.confidence) ? ` · Điểm AI ${new Intl.NumberFormat("vi-VN", { style: "percent", maximumFractionDigits: 2 }).format(d.confidence)}` : ""}`, result.total), range };
  },
  async favorites(userId, { limit, pageNumber }) {
    const result = await favorites.list(userId, { limit, page: pageNumber });
    return page(result.plants, limit, (p) => short(p.common_name, 140), result.total);
  },
  async feedback(userId, { dateWindow, range, limit, offset }) {
    const { items, total } = await list(Feedback, userId, dateWindow ? { created_at: dateWindow } : {},
      "description status review.response review.reviewed_at created_at", { limit, offset });
    return { ...page(items, limit, (f) =>
      `${dateTime(f.created_at)} – ${short(f.description)} · ${state(f.status)}${f.review?.response ? `. Phản hồi đã gửi ${short(f.review.response, 380)}` : ""}`, total), range };
  },
  async account(userId, { now }) {
    const user = await User.findOne({ _id: userId, role: "customer", status: true })
      .select("fullName email phone vip_plan vip_expires_at isproaccount notification_preferences.treatment_reminders")
      .lean();
    if (!user) throw new AppError("FORBIDDEN", 403, "Tài khoản khách hàng không khả dụng.");
    return {
      total: 1,
      rows: [
        `Tên tài khoản ${short(user.fullName, 100)} · Email ${short(user.email, 150)}${user.phone ? ` · Điện thoại ${short(user.phone, 32)}` : ""}`,
        isVip(user, now) ? `Gói VIP ${user.vip_plan || "đang hoạt động"} · Hết hạn ${dateTime(user.vip_expires_at)}` :
          user.vip_expires_at ? `Gói VIP đã hết hạn hoặc ngừng hoạt động · Mốc hết hạn ${dateTime(user.vip_expires_at)}` : "Tài khoản hiện dùng gói thường.",
        `Nhắc điều trị đang ${user.notification_preferences?.treatment_reminders === false ? "tắt" : "bật"}.`,
      ],
    };
  },
  async orders(userId, { dateWindow, range, now, limit, offset }) {
    const { items, total } = await list(TopupOrder, userId, dateWindow ? { createdAt: dateWindow } : {},
      "code amount status createdAt expires_at completed_at", { limit, offset });
    return { ...page(items, limit, (o) =>
      `${dateTime(o.createdAt)} – Đơn ${short(o.code, 80)} · ${amount(o.amount)} · ${o.status === "pending" && o.expires_at <= now ? "Đã hết hạn" : state(o.status)}`, total), range };
  },
  async wallet(userId, { dateWindow, range, limit, offset }) {
    const filter = dateWindow ? { created_at: dateWindow } : {};
    const [user, { items, total }, totals] = await Promise.all([
      User.findOne({ _id: userId, role: "customer", status: true }).select("balance").lean(),
      list(WalletTransaction, userId, filter, "type amount balance_after plan vip_expires_at created_at", { limit, offset }),
      WalletTransaction.aggregate([
        { $match: { ...filter, user_id: new Types.ObjectId(userId) } },
        { $group: { _id: "$type", net: { $sum: "$amount" } } },
      ]).option({ maxTimeMS: 4000 }),
    ]);
    if (!user) throw new AppError("FORBIDDEN", 403, "Tài khoản khách hàng không khả dụng.");
    const value = (type) => totals.find((row) => row._id === type)?.net || 0;
    return { ...page(items, limit, (t) =>
      `${dateTime(t.created_at)} – ${state(t.type)} · ${amount(t.amount)} · Số dư sau giao dịch ${amount(t.balance_after)}`, total,
    `Số dư hiện tại ${amount(user.balance)}. Tổng nạp ${amount(value("topup"))}. Chi mua VIP ${amount(Math.abs(value("purchase")))}. Điều chỉnh ròng ${amount(value("adjustment"))}`), range };
  },
  async conversations(userId, { dateWindow, range, limit, offset }) {
    const { items, total } = await list(ChatTurn, userId, dateWindow ? { created_at: dateWindow } : {},
      "question answer created_at", { limit, offset });
    return { ...page(items, limit, (t) =>
      `${dateTime(t.created_at)} – Bạn hỏi ${short(t.question, 180)}. Trợ lý trả lời ${short(t.answer, 260)}`, total), range };
  },
};

async function retrieve(userId, message, previous = [], now = new Date()) {
  const today = localDateTime(+now).slice(0, 10);
  const text = normalize(message);
  if (/\b(danh sach (tai khoan|nguoi dung|khach hang)|du lieu (admin|manager|quan tri|nguoi dung khac)|(?:mat khau|otp|api key|webhook|token)|(?:email|so dien thoai) cua (admin|manager|quan ly|quan tri vien))\b/.test(text)) {
    return {
      method: "customer", status: "no_match", content: "[]", sources: [],
      localReply: "Tôi chỉ có thể tra cứu thông tin bạn được xem trong tài khoản Plantify của mình.",
    };
  }
  let keys = chooseDomains(text);
  let inherited = "";
  if (!keys.length && /^(con|vay|the|tom tat|liet ke|bao nhieu|luc may gio|da xong|chua doc|ngay mai|hom qua|trang|tuan (nay|sau))\b/.test(text)) {
    inherited = previous.find((question) => chooseDomains(normalize(question)).length) || "";
    keys = chooseDomains(normalize(inherited));
  }
  if (!keys.length) return null;
  const range = period(message, today) || (inherited ? period(inherited, today) : null);
  const limit = keys.length > 4 ? 2 : keys.length > 1 ? 4 : 10;
  const pageNumber = Number(text.match(/\btrang ([1-9]\d{0,3})\b/)?.[1] || 1);
  const offset = (pageNumber - 1) * limit;
  const query = { range, dateWindow: timeFilter(range), today, now, limit, pageNumber, offset,
    text: `${normalize(inherited)} ${text}`.trim() };
  const data = await Promise.all(keys.map(async (key) => ({
    key,
    title: domains[key][0],
    ...await sources[key](userId, query),
  })));
  const blocks = data.map((entry) => ({
    title: entry.title,
    section: dateSection(entry.range),
    tong_so: entry.total,
    tong_hop: entry.summary || undefined,
    chi_tiet: entry.rows,
    trang: pageNumber,
    co_them: entry.key !== "account" && offset + entry.rows.length < entry.total,
  }));
  const fallbackReply = blocks.map((block, index) => [
    `${block.title} · ${block.section} [${index + 1}]`,
    block.tong_so || block.tong_hop ? [block.tong_hop, block.tong_so ?
      `${block.tong_so} mục` : "Chưa có mục nào trong phạm vi tra cứu"].filter(Boolean).join(". ") :
      "Chưa có dữ liệu trong phạm vi tra cứu.",
    ...block.chi_tiet.map((row) => `• ${row}`),
    !block.chi_tiet.length && block.tong_so > 0 && `Trang ${pageNumber} không có mục nào.`,
    block.co_them && `Đang hiển thị một phần chi tiết. Hỏi “trang ${pageNumber + 1}” hoặc theo ngày để xem thêm.`,
  ].filter(Boolean).join("\n")).join("\n\n");
  return {
    method: "customer",
    status: data.some((entry) => entry.total > 0) ? "matched" : "no_match",
    localReply: keys.some((key) => localOnly.has(key)) ||
      /^(hom nay toi co lich cham soc nao|lich cham soc hom nay|tong hop (cac )?thong bao (hom nay|trong ngay)|thong bao hom nay)$/.test(text)
      ? fallbackReply : undefined,
    fallbackReply,
    content: JSON.stringify(blocks.map((block, index) => ({ source: index + 1, ...block }))),
    sources: blocks.map((block, index) => ({
      number: index + 1, type: "customer", id: data[index].key, title: block.title, section: block.section,
      content_hash: createHash("sha256").update(JSON.stringify(block)).digest("hex"),
    })),
  };
}

module.exports = { retrieve };
