import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import api from "./api";
import { isSessionCurrent } from "./sessionAccess";

const STORAGE = "plantify.notifications.device";
export const CHANNEL = "plantify-reminders";
const TASK = "plantify-show-reminder";
const DAY = 86400000;
let tail = Promise.resolve();
let generation = 0;
let flushing;
const storage = () =>
  AsyncStorage.getItem(STORAGE).then((value) =>
    value ? JSON.parse(value) : { pending: [] },
  );
const save = (state) => AsyncStorage.setItem(STORAGE, JSON.stringify(state));

function serialize(operation) {
  const task = tail.then(operation);
  tail = task.catch(() => {});
  return task;
}

function unlink(state) {
  if (state.binding) {
    const { userId, ...credentials } = state.binding;
    state.pending.push(credentials);
    delete state.binding;
    delete state.shown;
  }
}

export function clearPushBinding() {
  generation++;
  const cleared = serialize(async () => {
    const state = await storage();
    unlink(state);
    try {
      await save(state);
    } finally {
      await Notifications.dismissAllNotificationsAsync();
    }
  });
  void cleared.then(flushRevocations).catch(() => {});
  return cleared;
}

export function flushRevocations() {
  if (flushing) return flushing;
  flushing = (async () => {
    const { installationId, pending } = await storage();
    for (const value of pending) {
      try {
        await api.delete(`/notifications/devices/${installationId}`, {
          data: value,
          anonymous: true,
          timeout: 5000,
        });
      } catch {
        continue;
      }
      await serialize(async () => {
        const state = await storage();
        state.pending = state.pending.filter(
          (item) => item.bindingId !== value.bindingId,
        );
        await save(state);
      });
    }
  })().finally(() => {
    flushing = undefined;
  });
  return flushing;
}

export async function syncPushDevice(session, rotatedToken) {
  const started = generation;
  const current = () => started === generation && isSessionCurrent(session);
  if (!current()) return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Thông báo Plantify",
    importance: Notifications.AndroidImportance.HIGH,
  });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain && current()) {
    const shouldPrompt = await serialize(async () => {
      const state = await storage();
      if (state.prompted || !current()) return false;
      state.prompted = true;
      await save(state);
      return true;
    });
    if (shouldPrompt && current())
      permission = await Notifications.requestPermissionsAsync();
  }
  if (!current()) return;
  if (!permission.granted) {
    if (__DEV__) console.warn("[Push] Plantify chưa có quyền thông báo Android.");
    if ((await storage()).binding && current()) await clearPushBinding();
    return;
  }
  let token = rotatedToken;
  if (token === undefined) {
    try {
      token = (await Notifications.getDevicePushTokenAsync()).data;
    } catch (error) {
      if (__DEV__) {
        console.warn(
          "[Push] Không lấy được FCM token.",
          error.code || error.name,
          error.message,
        );
      }
      throw error;
    }
  }
  if (typeof token !== "string" || !current()) return;
  try {
    if (!(await TaskManager.isTaskRegisteredAsync(TASK)))
      await Notifications.registerTaskAsync(TASK);
  } catch (error) {
    if (__DEV__) {
      console.warn("[Push] Không đăng ký được tác vụ nhận push.", error.code || error.name);
    }
    throw error;
  }

  const registration = await serialize(async () => {
    if (!current()) return;
    const state = await storage();
    if (state.binding?.userId !== session.userId) unlink(state);
    state.installationId ||= randomUUID();
    if (!state.binding) {
      state.sequence = (state.sequence ?? 0) + 1;
      state.binding = {
        userId: session.userId,
        sequence: state.sequence,
        bindingId: randomUUID(),
        revocationKey: randomUUID(),
      };
    }
    await save(state);
    const { userId, ...credentials } = state.binding;
    return { installationId: state.installationId, ...credentials };
  });
  if (!registration || !current()) return;
  const { installationId, ...credentials } = registration;
  try {
    await api.put(
      `/notifications/devices/${installationId}`,
      { ...credentials, token },
      { sessionContext: session, timeout: 10000 },
    );
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[Push] API đăng ký thiết bị thất bại.",
        error.response?.status ?? error.code ?? error.name,
      );
    }
    if (error.response?.data?.code === "DEVICE_BINDING_INACTIVE" && current()) {
      await clearPushBinding();
    }
    throw error;
  }
}

export async function isCurrentPushBinding(bindingId, userId) {
  const { binding } = await storage();
  return (
    !!bindingId &&
    binding?.bindingId === bindingId &&
    (!userId || binding.userId === userId)
  );
}

TaskManager.defineTask(TASK, async ({ data, error }) => {
  const payload = data?.data;
  if (
    error ||
    !/^[a-f0-9]{24}$/i.test(payload?.notificationId ?? "") ||
    typeof payload.bindingId !== "string"
  )
    return;
  const { notificationId, bindingId, kind } = payload;
  const isFeedback = kind === "feedback_reply";
  const expiresAt = Number(payload.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;

  await serialize(async () => {
    const state = await storage();
    if (
      state.binding?.bindingId !== bindingId ||
      state.shown?.[notificationId] > Date.now()
    )
      return;
    const started = generation;
    const identifier = `plantify-${notificationId}`;
    if (
      !(await Notifications.getPermissionsAsync()).granted ||
      started !== generation ||
      !(await isCurrentPushBinding(bindingId))
    )
      return;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: isFeedback
          ? "Plantify đã phản hồi góp ý của bạn"
          : kind === "care"
            ? "Đến giờ chăm sóc cây"
            : "Đến giờ điều trị cây",
        body: isFeedback
          ? "Mở ứng dụng để xem nội dung phản hồi."
          : "Mở Plantify để xem công việc cần thực hiện.",
        data: { notificationId, bindingId },
      },
      trigger: { channelId: CHANNEL },
    });
    if (started !== generation || !(await isCurrentPushBinding(bindingId))) {
      await Notifications.dismissNotificationAsync(identifier);
      return;
    }
    const updated = await storage();
    if (updated.binding?.bindingId !== bindingId) return;
    updated.shown = Object.fromEntries(
      Object.entries(updated.shown ?? {}).filter(
        ([, until]) => until > Date.now(),
      ),
    );
    updated.shown[notificationId] = Math.min(expiresAt, Date.now() + DAY);
    await save(updated);
  });
});

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const show =
      notification.request.identifier.startsWith("plantify-") &&
      (await isCurrentPushBinding(data?.bindingId));
    return {
      shouldShowBanner: show,
      shouldShowList: show,
      shouldPlaySound: show,
      shouldSetBadge: false,
    };
  },
});
