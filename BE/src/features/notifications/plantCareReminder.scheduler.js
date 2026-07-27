// plantCareReminder.scheduler.js
// Lập lịch chạy tác vụ kiểm tra và tạo thông báo chăm sóc cây đến hạn.

const cron = require('node-cron');
const {
  checkDuePlantCareNotifications,
} = require('./plantCareReminder.service');

/**
 * Tạo scheduler chạy ngay và lặp lại job nhắc lịch chăm sóc.
 * @param {Object} options - Dependency scheduler.
 * @param {Function} options.runJob - Job bất đồng bộ cần chạy.
 * @param {number} options.intervalMs - Chu kỳ chạy.
 * @returns {Object} Hàm start và stop scheduler.
 */
function createPlantCareReminderScheduler({
  cronLibrary = cron,
  checkDue = checkDuePlantCareNotifications,
  logger = console,
} = {}) {
  let task = null;
  let runningPromise = null;

  async function runSafely() {
    if (runningPromise) return runningPromise;
    runningPromise = Promise.resolve()
      .then(() => checkDue())
      .catch((error) => {
        logger.error('[plant-care-reminder] Kiểm tra lịch chăm sóc thất bại:', error);
      })
      .finally(() => {
        runningPromise = null;
      });
    return runningPromise;
  }

  function start() {
    if (task) return task;
    task = cronLibrary.schedule(
      '* * * * *',
      () => {
        void runSafely();
      },
      { timezone: 'Asia/Ho_Chi_Minh' }
    );
    void runSafely();
    return task;
  }

  function stop() {
    task?.stop();
    task = null;
  }

  return {
    start,
    stop,
    runSafely,
  };
}

const plantCareReminderScheduler = createPlantCareReminderScheduler();

module.exports = {
  createPlantCareReminderScheduler,
  plantCareReminderScheduler,
};
