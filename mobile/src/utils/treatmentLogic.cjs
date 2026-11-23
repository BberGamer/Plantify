const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

function calculateTreatmentProgress(schedule) {
  const duration = Number.isSafeInteger(schedule?.protocol?.standard_duration_days)
    ? schedule.protocol.standard_duration_days
    : 0;
  const currentDay = Number.isSafeInteger(schedule?.current_day)
    ? clamp(schedule.current_day, 0, duration)
    : 0;
  const tasks = Array.isArray(schedule?.task_progress)
    ? schedule.task_progress
    : [];
  const completedTasks = tasks.filter(
    (task) => task?.status === "completed",
  ).length;
  return {
    currentDay,
    duration,
    dayPercent: duration ? Math.round((currentDay / duration) * 100) : 0,
    completedTasks,
    totalTasks: tasks.length,
    taskPercent: tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0,
  };
}

function canApplyTreatment(schedule) {
  return Boolean(
    schedule &&
      schedule.status === "generated" &&
      schedule.plant?._id &&
      schedule.protocol?._id,
  );
}

function canCompleteTask(task) {
  return task?.status === "pending";
}

function canCompleteTreatment(schedule) {
  return Boolean(
    schedule &&
      schedule.status === "in_progress" &&
      Array.isArray(schedule.task_progress) &&
      schedule.task_progress.length > 0 &&
      schedule.task_progress.every((task) => task.status === "completed"),
  );
}

module.exports = {
  calculateTreatmentProgress,
  canApplyTreatment,
  canCompleteTask,
  canCompleteTreatment,
};
