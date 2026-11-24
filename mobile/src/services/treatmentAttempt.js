import { getRandomBytes } from "expo-crypto";

// Giữ kết quả thao tác qua blur/remount trong cùng phiên. Không hủy hoặc gửi lại POST.
// Chỉ xóa khóa chưa rõ kết quả sau khi đã đối chiếu được trạng thái server.
let sessionKey;
const attempts = new Map();

export function treatmentAttempts(session) {
  const key = JSON.stringify([session.version, session.userId, session.token]);
  if (key !== sessionKey) {
    attempts.clear();
    sessionKey = key;
  }
  return attempts;
}

export function newScheduleId() {
  return Array.from(getRandomBytes(12), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function startTreatmentAttempt(registry, key, kind, scheduleId, plantId, operation) {
  const attempt = { kind, scheduleId, plantId, pending: true, response: null, error: null };
  registry.set(key, attempt);
  attempt.promise = Promise.resolve().then(operation).then(
    (response) => { attempt.response = response; },
    (error) => { attempt.error = error; },
  ).finally(() => { attempt.pending = false; });
  return attempt;
}
