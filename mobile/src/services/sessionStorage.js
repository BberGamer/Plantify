import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROLE_LABELS } from "../constants/roles";
import { toByteArray } from "base64-js";
import { sessionError } from "./sessionAccess";

export const SESSION_KEY = "authSession";
const LEGACY_KEYS = ["token", "user"];
const USER_FIELDS = [
  "_id",
  "id",
  "fullName",
  "email",
  "phone",
  "role",
  "status",
  "isGoogleAccount",
  "isAccountGoogle",
  "createdAt",
  "updatedAt",
];

export function normalizeSessionUser(input) {
  const id = input?._id || input?.id;
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    typeof id !== "string" ||
    !/^[a-f\d]{24}$/i.test(id) ||
    (input._id !== undefined && input._id !== id) ||
    (input.id !== undefined && input.id !== id) ||
    typeof input.fullName !== "string" ||
    !input.fullName.trim() ||
    typeof input.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
    typeof input.role !== "string" ||
    !Object.prototype.hasOwnProperty.call(ROLE_LABELS, input.role) ||
    input.status !== true ||
    (input.phone !== undefined && typeof input.phone !== "string")
  ) {
    throw sessionError("INVALID_RESPONSE");
  }
  for (const field of ["isGoogleAccount", "isAccountGoogle"]) {
    if (input[field] !== undefined && typeof input[field] !== "boolean")
      throw sessionError("INVALID_RESPONSE");
  }
  for (const field of ["createdAt", "updatedAt"]) {
    if (input[field] !== undefined && typeof input[field] !== "string")
      throw sessionError("INVALID_RESPONSE");
  }
  // Cache cũ/API không được đưa password hoặc OTP vào phiên dùng chung.
  return Object.fromEntries(
    USER_FIELDS.filter((field) => input[field] !== undefined).map((field) => [
      field,
      input[field],
    ]),
  );
}

export function normalizeSession(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw sessionError("INVALID_RESPONSE");
  const { user, token } = input;
  if (
    typeof token !== "string" ||
    !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
  ) {
    throw sessionError("INVALID_RESPONSE");
  }
  const normalizedUser = normalizeSessionUser(user);
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = toByteArray(
      payload.padEnd(Math.ceil(payload.length / 4) * 4, "="),
    );
    const claims = JSON.parse(
      decodeURIComponent(
        Array.from(
          bytes,
          (byte) => `%${byte.toString(16).padStart(2, "0")}`,
        ).join(""),
      ),
    );
    // Chỉ kiểm tra shape, cặp ID và hạn cache; chữ ký/quyền vẫn do backend quyết định.
    if (
      claims?.id !== (normalizedUser._id || normalizedUser.id) ||
      typeof claims.exp !== "number" ||
      !Number.isFinite(claims.exp) ||
      claims.exp * 1000 <= Date.now()
    ) {
      throw sessionError("INVALID_RESPONSE");
    }
  } catch {
    throw sessionError("INVALID_RESPONSE");
  }
  return { user: normalizedUser, token };
}

// Đọc/ghi/xóa đi qua cùng queue: write cũ đang chạy phải kết thúc trước clear hoặc write mới.
let tail = Promise.resolve();
function enqueue(operation) {
  const task = tail.then(operation);
  tail = task.catch(() => {});
  return task;
}

async function clearRaw() {
  try {
    await AsyncStorage.multiRemove([SESSION_KEY, ...LEGACY_KEYS]);
    return true;
  } catch {
    try {
      // Marker không chứa credential và chặn khôi phục legacy nếu multiRemove thất bại.
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ schemaVersion: 1, signedOut: true }),
      );
    } catch {
      /* Bộ nhớ vẫn được xóa; storage hỏng hoàn toàn không thể bảo đảm qua lần mở app sau. */
    }
    return false;
  }
}

const sessionStorage = {
  clear: () => enqueue(clearRaw),

  write: (session, isCurrent) =>
    enqueue(async () => {
      if (!isCurrent()) return false;
      try {
        const normalized = normalizeSession(session);
        await AsyncStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ schemaVersion: 1, ...normalized }),
        );
        // Dữ liệu legacy không còn là nguồn phiên sau khi có record mới.
        await AsyncStorage.multiRemove(LEGACY_KEYS).catch(() => {});
        if (!isCurrent()) {
          // Hủy ngay trong queue để không xóa nhầm record của lần đăng nhập sau.
          await clearRaw();
          return false;
        }
        return true;
      } catch {
        await clearRaw();
        throw sessionError("SESSION_STORAGE_ERROR");
      }
    }),

  read: (isCurrent) =>
    enqueue(async () => {
      if (!isCurrent()) return null;
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      try {
        if (raw !== null) {
          const record = JSON.parse(raw);
          if (record?.schemaVersion !== 1)
            throw sessionError("INVALID_RESPONSE");
          if (record.signedOut === true) return null;
          return normalizeSession(record);
        }
        const [token, rawUser] = await Promise.all(
          LEGACY_KEYS.map((key) => AsyncStorage.getItem(key)),
        );
        if (token === null && rawUser === null) return null;
        const session = normalizeSession({ token, user: JSON.parse(rawUser) });
        if (!isCurrent()) return null;
        // Chỉ migration sau validation, ghi một record để không tạo cặp user/token ghi dở.
        await AsyncStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ schemaVersion: 1, ...session }),
        );
        await AsyncStorage.multiRemove(LEGACY_KEYS).catch(() => {});
        return session;
      } catch {
        await clearRaw();
        return null;
      }
    }),
};

export default sessionStorage;
