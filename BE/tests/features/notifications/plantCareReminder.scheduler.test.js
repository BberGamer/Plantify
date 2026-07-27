const fs = require('fs');
const path = require('path');
const {
  createPlantCareReminderScheduler,
} = require(
  '../../../src/features/notifications/plantCareReminder.scheduler'
);

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('plant care reminder scheduler', () => {
  test('runs immediately, continues after an error and stops on shutdown', async () => {
    let scheduledCallback;
    const task = { stop: jest.fn() };
    const cronLibrary = {
      schedule: jest.fn((expression, callback) => {
        scheduledCallback = callback;
        return task;
      }),
    };
    const checkDue = jest.fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce({ createdCount: 1 });
    const logger = { error: jest.fn() };
    const scheduler = createPlantCareReminderScheduler({
      cronLibrary,
      checkDue,
      logger,
    });

    scheduler.start();
    await flushPromises();
    expect(cronLibrary.schedule).toHaveBeenCalledWith(
      '* * * * *',
      expect.any(Function),
      { timezone: 'Asia/Ho_Chi_Minh' }
    );
    expect(checkDue).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);

    scheduledCallback();
    await flushPromises();
    expect(checkDue).toHaveBeenCalledTimes(2);

    scheduler.stop();
    expect(task.stop).toHaveBeenCalledTimes(1);
  });

  test('server starts scheduler after Mongo connect and stops it during shutdown', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../src/server.js'),
      'utf8'
    );
    const connectCall = source.indexOf('connectDB().then');
    const startCall = source.indexOf(
      'plantCareReminderScheduler.start()',
      connectCall
    );
    const stopCall = source.indexOf('plantCareReminderScheduler.stop()');

    expect(connectCall).toBeGreaterThanOrEqual(0);
    expect(startCall).toBeGreaterThan(connectCall);
    expect(stopCall).toBeGreaterThan(startCall);
  });
});
