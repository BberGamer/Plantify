/** @typedef {"generated"|"in_progress"|"recovered"|"failed"|"cancelled"} TreatmentStatus */

/**
 * @typedef {Object} TreatmentStage
 * @property {string} _id
 * @property {number} order
 * @property {string} title
 * @property {number} start_day
 * @property {number} end_day
 * @property {string[]} instructions
 * @property {string=} important_note
 */

/**
 * @typedef {Object} TreatmentTask
 * @property {string} _id
 * @property {number} stage_order
 * @property {string} title
 * @property {string} scheduled_date
 * @property {"pending"|"completed"|"upcoming"} status
 * @property {string=} completed_at
 * @property {string=} instructions
 * @property {string=} important_note
 */

/**
 * @typedef {Object} TreatmentProtocol
 * @property {string} _id
 * @property {string} protocol_name
 * @property {number} standard_duration_days
 * @property {string} safety_note
 */

/**
 * @typedef {Object} TreatmentSchedule
 * @property {string} _id
 * @property {TreatmentStatus} status
 * @property {TreatmentProtocol} protocol
 * @property {TreatmentStage[]} stages
 * @property {TreatmentTask[]=} task_progress
 * @property {number=} current_day
 * @property {number=} current_stage_order
 * @property {string=} started_at
 * @property {string=} estimated_end_at
 */

export const TREATMENT_STATUS = Object.freeze({
  GENERATED: "generated",
  IN_PROGRESS: "in_progress",
  RECOVERED: "recovered",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

export const TREATMENT_TASK_STATUS = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  UPCOMING: "upcoming",
});
