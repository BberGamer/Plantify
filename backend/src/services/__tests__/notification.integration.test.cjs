const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { test, before, after } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const Care = require("../../models/careSchedule.model");
const Completion = require("../../models/careCompletion.model");
const Delivery = require("../../models/notificationDelivery.model");
const Device = require("../../models/notificationDevice.model");
const Disease = require("../../models/disease.model");
const Notification = require("../../models/notification.model");
const Plant = require("../../models/userPlant.model");
const Treatment = require("../../models/treatmentSchedule.model");
const User = require("../../models/user.model");
const devices = require("../notificationDevice.service");
const inbox = require("../notification.service");
const { tick } = require("../notificationWorker");
const { rescheduleTask } = require("../treatment.service");

const id = () => new mongoose.Types.ObjectId();
const binding = (token, sequence = 1) => ({ token, sequence, bindingId: randomUUID(), revocationKey: randomUUID() });
const day = 86400000;
let replica;

before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replica.getUri());
  await Promise.all([Care, Completion, Delivery, Device, Disease, Notification, Plant, Treatment, User]
    .map(model => model.init()));
}, { timeout: 120000 });

after(async () => {
  await mongoose.disconnect();
  await replica?.stop();
});

async function seed(email) {
  const owner = id();
  const plant = id();
  await User.collection.insertOne({ _id: owner, email, status: true, role: "customer" });
  await Plant.collection.insertOne({ _id: plant, user_id: owner });
  return { owner, plant };
}

function care(owner, plant, fields) {
  return Care.create({
    user_id: owner, user_plant_id: plant, title: "Tưới cây", action_type: "watering",
    ...fields,
  });
}

test("uses the Vietnam calendar, checks current eligibility, and protects the inbox", async () => {
  const { owner, plant } = await seed("inbox@test.local");
  const now = new Date("2026-11-22T17:02:00.000Z");
  const due = new Date(+now - 60000);
  await care(owner, plant, { start_date: "2026-11-21", time: "00:01", repeat_every_days: 2 });
  const done = await care(owner, plant, { start_date: "2026-11-22", time: "23:55" });
  await Completion.create({ user_id: owner, schedule_id: done._id, date: "2026-11-22" });
  await care(owner, plant, { start_date: "2026-11-22", time: "23:57", is_paused: true });
  const treating = id();
  await Plant.collection.insertOne({ _id: treating, user_id: owner });
  await Treatment.collection.insertOne({
    user_id: owner, user_plant_id: treating, status: "in_progress",
    tasks: [
      { _id: id(), status: "pending", title: "Suppressed", scheduled_date: due },
      { _id: id(), status: "completed", title: "Completed", scheduled_date: due },
      { _id: id(), status: "pending", title: "Expired", scheduled_date: new Date(+now - day - 1) },
      { _id: id(), status: "pending", title: "Later", scheduled_date: new Date(+now + 60000) },
    ],
  });
  await inbox.updatePreferences(owner, { treatment_reminders: false });
  await tick({ now });
  const rows = await Notification.find({ user_id: owner, status: "published" }).lean();
  assert.equal(rows.length, 1);
  const [item] = rows;
  assert.equal(item.type, "care");
  assert.equal(item.occurrence_date, "2026-11-23");
  assert.equal(+item.scheduled_for, +due);
  // Visibility uses real UTC time, so use a past due time to assert API ownership.
  await Notification.updateOne({ _id: item._id }, { $set: { scheduled_for: new Date(0) } });
  const key = String(item._id);
  assert.equal((await inbox.detail(owner, key)).target_available, true);
  await assert.rejects(inbox.markRead(id(), key), { code: "NOTIFICATION_NOT_FOUND" });
  assert.equal((await inbox.markRead(owner, key)).is_read, true);
  await Care.updateOne({ _id: item.care_schedule_id }, { $set: { is_active: false } });
  assert.equal((await inbox.detail(owner, key)).target_available, false);

  await User.updateOne({ _id: owner }, { $set: {
    "notification_preferences.treatment_reminders": true,
    "notification_preferences.treatment_reminders_enabled_at": now,
  } });
  await tick({ now: new Date(+now + 60000) });
  assert.deepEqual(await Notification.find({ user_id: owner, type: "treatment", status: "published" })
    .distinct("message"), ["Later"]);
});

test("two workers claim once and retry only the failed device", async () => {
  const { owner, plant } = await seed("push@test.local");
  const local = new Date(Date.now() - 120000 + 7 * 3600000).toISOString();
  await care(owner, plant, { start_date: local.slice(0, 10), time: local.slice(11, 16) });
  await Promise.all(["success", "retry", "invalid"].map(token =>
    devices.register(String(owner), randomUUID(), binding(token))));
  const calls = [];
  async function send(message) {
    calls.push(message.token);
    assert.ok(message.android.ttl > 0);
    assert.ok(message.data.bindingId);
    if (message.token === "retry")
      throw Object.assign(new Error(), { code: "messaging/server-unavailable" });
    if (message.token === "invalid")
      throw Object.assign(new Error(), { code: "messaging/registration-token-not-registered" });
  }
  await Promise.all([tick({ send }), tick({ send })]);
  assert.deepEqual(calls.sort(), ["invalid", "retry", "success"]);
  assert.equal(await Device.exists({ token: "invalid" }), null);
  // Simulate a restarted worker recovering an expired claim.
  await Delivery.updateMany({ status: "pending" },
    { $set: { status: "sending", lease_id: randomUUID(), retry_at: new Date(0) } });
  const retried = [];
  await tick({ send: async message => retried.push(message.token) });
  assert.deepEqual(retried, ["retry"]);
});

test("rescheduling an older treatment creates one reminder at the new UTC time", async () => {
  const { owner, plant } = await seed("reschedule@test.local");
  const disease = id();
  await Disease.collection.insertOne({ _id: disease, disease_name: "Test disease" });
  const schedule = await Treatment.create({
    user_id: owner, user_plant_id: plant, disease_id: disease, treatment_protocol_id: id(),
    status: "in_progress", start_date: new Date("2026-11-22"), end_date: new Date("2026-11-25"),
    protocol_snapshot: {
      protocol_name: "Test treatment", description: "Test treatment", duration_days: 4, version: 1,
      approved_instructions: ["Test"], safety_guidelines: ["Test"],
      stages: [{ order: 1, title: "Check", start_day: 1, end_day: 4, instructions: ["Check"] }],
    },
    tasks: [{ stage_order: 1, title: "Check", scheduled_date: new Date("2026-11-22T01:00:00Z"),
      time: "08:00", instructions: ["Check"] }],
  });
  const args = [String(owner), String(schedule._id), String(schedule.tasks[0]._id)];
  await rescheduleTask(...args, { scheduled_date: "2026-11-24" });
  await rescheduleTask(...args, { scheduled_date: "2026-11-25" });
  const reminders = await Notification.find({ treatment_schedule_id: schedule._id }).lean();
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].scheduled_for.toISOString(), "2026-11-25T01:00:00.000Z");
});

test("offline revocation protects both account switches and requests in flight", async () => {
  const previous = String(id());
  const next = String(id());
  const installationId = randomUUID();
  const oldBinding = binding("same-token");
  await devices.register(previous, installationId, oldBinding);
  const newBinding = binding("same-token", 3);
  await devices.register(next, installationId, newBinding);
  await devices.revoke(installationId, oldBinding);
  await assert.rejects(devices.register(previous, installationId, oldBinding),
    { code: "DEVICE_BINDING_INACTIVE" });
  await assert.rejects(devices.register(previous, installationId, binding("same-token", 2)),
    { code: "DEVICE_BINDING_INACTIVE" });
  const active = await Device.findOne({ installation_id: installationId, revoked: false }).lean();
  assert.equal(String(active.user_id), next);
  assert.equal(active._id, newBinding.bindingId);
  await devices.revoke(installationId, newBinding);
  assert.equal(await Device.exists({ installation_id: installationId, revoked: false }), null);

  const inFlight = binding("new-token", 4);
  await devices.revoke(installationId, inFlight);
  await assert.rejects(devices.register(next, installationId, inFlight),
    { code: "DEVICE_BINDING_INACTIVE" });
});
