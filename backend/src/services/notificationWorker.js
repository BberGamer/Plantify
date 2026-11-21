const { randomUUID } = require("node:crypto");
const Notification = require("../models/notification.model");
const Delivery = require("../models/notificationDelivery.model");
const Device = require("../models/notificationDevice.model");
const Care = require("../models/careSchedule.model");
const Completion = require("../models/careCompletion.model");
const Treatment = require("../models/treatmentSchedule.model");
const User = require("../models/user.model");
const Plant = require("../models/userPlant.model");
const recurrence = require("./careRecurrence");
const { notifyChanged } = require("./notification.service");

const DAY = 86400000;
const VIETNAM_OFFSET = 7 * 3600000;
const INTERVAL = 60000;
const vietnamDate = (date) => new Date(+date + VIETNAM_OFFSET).toISOString().slice(0, 10);
const careDueAt = (day, time) => new Date(`${day}T${time}:00+07:00`);

async function insertReminder(reminder) {
  try {
    await Notification.updateOne({ dedupe_key: reminder.dedupe_key },
      { $setOnInsert: { ...reminder, status: "scheduled", dispatch_managed: true,
        created_at: new Date(), updated_at: new Date() } },
      { upsert: true, timestamps: false });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

async function discover(from, now) {
  const days = recurrence.dates(vietnamDate(from), vietnamDate(now));
  const careSchedules = Care.find({
    is_active: true, is_paused: { $ne: true }, start_date: { $ne: null, $lte: days.at(-1) },
    $or: [{ end_date: null }, { end_date: { $gte: days[0] } }],
  }).lean().cursor();
  for await (const schedule of careSchedules) {
    for (const day of days) {
      if (!recurrence.occurs(schedule, day)) continue;
      const due = careDueAt(day, schedule.time);
      if (!(due >= from && due <= now)) continue;
      await insertReminder({
        dedupe_key: `care:${schedule._id}:${day}`, type: "care", user_id: schedule.user_id,
        user_plant_id: schedule.user_plant_id, care_schedule_id: schedule._id,
        occurrence_date: day, scheduled_for: due, title: "Đến giờ chăm sóc cây", message: schedule.title,
      });
    }
  }

  const treatments = Treatment.find({
    status: "in_progress",
    tasks: { $elemMatch: { status: "pending", scheduled_date: { $gte: from, $lte: now } } },
  }).select("user_id tasks").lean().cursor();
  for await (const schedule of treatments) {
    for (const task of schedule.tasks) {
      if (task.status !== "pending" || task.scheduled_date < from || task.scheduled_date > now) continue;
      await insertReminder({
        dedupe_key: `treatment:${schedule._id}:task:${task._id}`, type: "treatment",
        user_id: schedule.user_id, treatment_schedule_id: schedule._id, treatment_task_id: task._id,
        scheduled_for: task.scheduled_date, title: "Công việc điều trị hôm nay", message: task.title,
      });
    }
  }
}

async function eligible(item) {
  const user = await User.findById(item.user_id).select("status role notification_preferences").lean();
  if (!user?.status || user.role !== "customer") return false;
  if (item.type === "care") {
    const schedule = await Care.findOne({ _id: item.care_schedule_id,
      user_id: item.user_id, is_active: true, is_paused: { $ne: true } }).lean();
    if (!schedule || !recurrence.occurs(schedule, item.occurrence_date) ||
        +careDueAt(item.occurrence_date, schedule.time) !== +item.scheduled_for) return false;
    const [plant, completed, treatment] = await Promise.all([
      Plant.exists({ _id: schedule.user_plant_id, user_id: item.user_id, archived_at: null }),
      Completion.exists({ user_id: item.user_id, schedule_id: schedule._id, date: item.occurrence_date }),
      Treatment.exists({ user_plant_id: schedule.user_plant_id, status: "in_progress" }),
    ]);
    return !!plant && !completed && !treatment;
  }

  const preferences = user.notification_preferences;
  if (preferences?.treatment_reminders === false ||
      preferences?.treatment_reminders_enabled_at > item.scheduled_for) return false;
  const schedule = await Treatment.findOne({ _id: item.treatment_schedule_id, user_id: item.user_id,
    status: "in_progress", tasks: { $elemMatch: { _id: item.treatment_task_id,
      status: "pending", scheduled_date: item.scheduled_for } } }).select("user_plant_id").lean();
  return !!schedule && !!(await Plant.exists({
    _id: schedule.user_plant_id, user_id: item.user_id, archived_at: null,
  }));
}

async function publish(from, now, pushEnabled) {
  const items = Notification.find({
    scheduled_for: { $gte: from, $lte: now },
    status: { $in: pushEnabled ? ["scheduled", "published", "sent"] : ["scheduled"] },
  }).lean().cursor();
  let published = 0;
  for await (const item of items) {
    if (item.status === "sent" && !item.published_at) continue;
    if (item.status === "scheduled" && item.dispatch_managed === undefined) {
      await Notification.updateOne({ _id: item._id, dispatch_managed: { $exists: false } },
        { $set: { dispatch_managed: true } });
    }
    if (!(await eligible(item))) continue;
    if (item.status === "scheduled") {
      const result = await Notification.updateOne({
        _id: item._id, status: "scheduled", scheduled_for: item.scheduled_for,
      }, { $set: { status: "published", published_at: now, dispatch_managed: true } });
      if (!result.modifiedCount) continue;
      published++;
      notifyChanged(item.user_id);
    }
    if (!pushEnabled) continue;
    const devices = await Device.find({ user_id: item.user_id, revoked: false, token: { $exists: true } })
      .select("installation_id").lean();
    for (const device of devices) {
      try {
        await Delivery.updateOne({ notification_id: item._id, installation_id: device.installation_id },
          { $setOnInsert: { status: "pending", attempts: 0,
            expires_at: new Date(+item.scheduled_for + DAY), retry_at: now } },
          { upsert: true });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }
  }
  return published;
}

const retryable = new Set([
  "messaging/server-unavailable", "messaging/internal-error", "messaging/unknown-error",
  "messaging/message-rate-exceeded", "messaging/device-message-rate-exceeded",
  "app/network-error", "app/network-timeout", "app/credential-internal-error",
]);

async function deliver(delivery, send) {
  const filter = { _id: delivery._id, lease_id: delivery.lease_id };
  async function finish(status, extra = {}) {
    await Delivery.updateOne(filter, { $set: { status, ...extra }, $unset: { lease_id: 1 } });
    return status;
  }

  const item = await Notification.findById(delivery.notification_id).lean();
  if (!item || !["published", "sent"].includes(item.status) || !(await eligible(item))) return finish("skipped");
  const device = await Device.findOne({ installation_id: delivery.installation_id,
    user_id: item.user_id, revoked: false })
    .select("+token").lean();
  if (!device?.token) return finish("skipped");
  const ttl = +delivery.expires_at - Date.now();
  if (ttl <= 0) return finish("skipped");

  try {
    await send({
      token: device.token,
      android: { priority: "high", ttl },
      data: { notificationId: String(item._id), bindingId: device._id,
        kind: item.type, expiresAt: String(+delivery.expires_at) },
    });
  } catch (error) {
    const code = error.code || "unknown";
    if (["messaging/registration-token-not-registered", "messaging/invalid-registration-token"].includes(code)) {
      await Device.updateOne({ _id: device._id, token: device.token }, { $unset: { token: 1 } });
    }
    const delay = Math.min(3600000, INTERVAL * 2 ** Math.min(delivery.attempts - 1, 6));
    const retryAt = new Date(Date.now() + delay + Math.random() * INTERVAL);
    if (retryable.has(code) && retryAt < delivery.expires_at)
      return finish("pending", { retry_at: retryAt, error_code: code });
    return finish("failed", { error_code: code });
  }
  const sentAt = new Date();
  const status = await finish("sent", { sent_at: sentAt });
  await Notification.updateOne({ _id: item._id, status: "published" },
    { $set: { status: "sent", sent_at: sentAt } });
  return status;
}

async function tick({ send, now = new Date() } = {}) {
  const from = new Date(+now - DAY);
  await discover(from, now);
  const published = await publish(from, now, !!send);
  const stats = { published, sent: 0, failed: 0, skipped: 0, pending: 0 };
  if (!send) return stats;
  for (let index = 0; index < 100; index++) {
    const time = new Date();
    const delivery = await Delivery.findOneAndUpdate({
      status: { $in: ["pending", "sending"] }, retry_at: { $lte: time }, expires_at: { $gt: time },
    }, {
      $set: { status: "sending", lease_id: randomUUID(), retry_at: new Date(+time + 5 * INTERVAL) },
      $inc: { attempts: 1 },
    }, { sort: { retry_at: 1 }, new: true }).lean();
    if (!delivery) break;
    stats[await deliver(delivery, send)]++;
  }
  return stats;
}

async function start() {
  await Promise.all([Notification.init(), Device.init(), Delivery.init()]);
  let send;
  if (process.env.FCM_ENABLED === "true") {
    const { initializeApp, applicationDefault } = require("firebase-admin/app");
    const { getMessaging } = require("firebase-admin/messaging");
    const messaging = getMessaging(initializeApp({ credential: applicationDefault() }, "plantify-notifications"));
    send = (message) => messaging.send(message);
  }
  let running = false;
  async function run() {
    if (running) return;
    running = true;
    try {
      const stats = await tick({ send });
      if (Object.values(stats).some(Boolean)) console.info("[Notifications]", stats);
    } catch (error) {
      console.error("[Notifications] Kiểm tra lịch thất bại.", error.code || error.name);
    } finally {
      running = false;
    }
  }
  void run();
  // Lịch đặt theo phút, nên chạy tại đầu phút thay vì theo giây backend khởi động.
  setTimeout(() => {
    void run();
    setInterval(run, INTERVAL).unref();
  }, INTERVAL - Date.now() % INTERVAL).unref();
}

module.exports = { start, tick };
