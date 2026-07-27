const UserPlant = require('../my-garden/userPlant.model');
const {
  upsertPlantCareNotification,
} = require('./notification.service');

const CARE_REMINDERS = [
  {
    scheduleField: 'wateringSchedule',
    careType: 'watering',
    notificationType: 'plant_watering_due',
    message: (name) => `Đã đến lúc tưới cây ${name}.`,
  },
  {
    scheduleField: 'fertilizingSchedule',
    careType: 'fertilizing',
    notificationType: 'plant_fertilizing_due',
    message: (name) => `Đã đến lúc bón phân cho cây ${name}.`,
  },
];

function buildPlantCareDedupeKey(userPlantId, careType, nextDueAt) {
  return [
    'plant-care',
    String(userPlantId),
    careType,
    new Date(nextDueAt).toISOString(),
  ].join(':');
}

async function checkDuePlantCareNotifications(now = new Date()) {
  const duePlants = await UserPlant.find({
    status: 'active',
    $or: CARE_REMINDERS.map(({ scheduleField }) => ({
      [`${scheduleField}.enabled`]: true,
      [`${scheduleField}.nextDueAt`]: { $ne: null, $lte: now },
    })),
  }).lean();

  let createdCount = 0;
  for (const userPlant of duePlants) {
    for (const reminder of CARE_REMINDERS) {
      const schedule = userPlant[reminder.scheduleField];
      const careDueAt = schedule?.nextDueAt
        ? new Date(schedule.nextDueAt)
        : null;
      if (
        !schedule?.enabled
        || !careDueAt
        || Number.isNaN(careDueAt.getTime())
        || careDueAt > now
      ) {
        continue;
      }

      const notification = await upsertPlantCareNotification({
        recipientId: userPlant.userId,
        actorId: null,
        type: reminder.notificationType,
        userPlantId: userPlant._id,
        careDueAt,
        dedupeKey: buildPlantCareDedupeKey(
          userPlant._id,
          reminder.careType,
          careDueAt
        ),
        message: reminder.message(userPlant.name),
      });
      if (notification) createdCount += 1;
    }
  }

  return { createdCount };
}

module.exports = {
  CARE_REMINDERS,
  buildPlantCareDedupeKey,
  checkDuePlantCareNotifications,
};
