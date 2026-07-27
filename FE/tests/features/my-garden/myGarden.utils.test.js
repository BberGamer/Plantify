// myGarden.utils.test.js - Kiểm tra thứ tự ưu tiên ảnh của UserPlant
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  buildPlantDiagnosisUrl,
  buildUserPlantPayload,
  createUserPlantThenUpload,
  DEFAULT_IMAGE,
  getAlbumCapabilities,
  getCareEventCapabilities,
  getScheduleDateBounds,
  getUserPlantScheduleStatus,
  getImageFallbackSource,
  getUserPlantImage,
  removePendingPreview,
  revokePendingPreviews,
  localDateTimeToIso,
  sortCareEvents,
  toLocalDateTimeInput,
  toLocalDateTimeInputWithSeconds,
  validateCareEventPerformedAt,
  validateUserPlantSchedule,
} from "../../../src/features/my-garden/myGarden.utils.js";
import { buildDiagnosisFormData } from "../../../src/features/ai/diagnosisRequest.utils.js";
import {
  getPlantCareNotificationMessage,
  getPlantCareNotificationSubtext,
  getPlantCareNotificationTarget,
  isPlantCareNotification,
} from "../../../src/features/notifications/notification.utils.js";

test("ưu tiên coverImageUrl trước ảnh catalogue", () => {
  const image = getUserPlantImage({
    coverImageUrl: "cover.jpg",
    catalogPlantId: {
      thumbnail: "thumbnail.jpg",
      images: ["gallery.jpg"],
    },
  });

  assert.equal(image, "cover.jpg");
});

test("timezone Asia/Ho_Chi_Minh chuyển datetime-local không lệch 7 giờ", () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = "Asia/Ho_Chi_Minh";
  try {
    const utcDate = new Date("2026-07-27T05:30:00.000Z");
    assert.equal(toLocalDateTimeInput(utcDate), "2026-07-27T12:30");
    assert.equal(localDateTimeToIso("2026-07-27T12:30"), "2026-07-27T05:30:00.000Z");
  } finally { if (previousTimezone === undefined) delete process.env.TZ; else process.env.TZ = previousTimezone; }
});

test("CareEvent editable/read-only exposes đúng thao tác", () => {
  assert.deepEqual(getCareEventCapabilities(false), { canCreate: true, canEdit: true, canDelete: true });
  assert.deepEqual(getCareEventCapabilities(true), { canCreate: false, canEdit: false, canDelete: false });
});

test("Album và CareEvent nằm ngoài form UserPlant, CareEvent không tạo nested form", () => {
  const formSource = fs.readFileSync(new URL("../../../src/features/my-garden/components/UserPlantFormDialog.jsx", import.meta.url), "utf8");
  const careSource = fs.readFileSync(new URL("../../../src/features/my-garden/components/UserPlantCareEvents.jsx", import.meta.url), "utf8");
  const formStart = formSource.indexOf('<form data-testid="user-plant-form"');
  const formEnd = formSource.indexOf("</form>", formStart);
  assert.ok(formStart >= 0 && formEnd > formStart);
  assert.ok(formSource.indexOf("<UserPlantAlbum", formEnd) > formEnd);
  assert.ok(formSource.indexOf("<UserPlantScheduleSettings", formEnd) > formEnd);
  assert.ok(formSource.indexOf("<UserPlantCareEvents", formEnd) > formEnd);
  assert.ok(formSource.indexOf('data-testid="user-plant-create-images"', formEnd) > formEnd);
  assert.equal(careSource.includes("<form"), false);
  assert.equal(careSource.includes('type="submit"'), false);
  assert.ok(careSource.includes('type="button"'));
});

test("datetime-local giữ đúng thời điểm khi chuyển local sang ISO", () => {
  const localValue = toLocalDateTimeInput(new Date("2026-07-27T05:00:00.000Z"));
  assert.equal(localDateTimeToIso(localValue), new Date(localValue).toISOString());
  assert.deepEqual(sortCareEvents([{ performedAt: "2026-01-01" }, { performedAt: "2026-02-01" }]).map((item) => item.performedAt), ["2026-02-01", "2026-01-01"]);
});

test("preview chỉ revoke ảnh bị xóa và giải phóng toàn bộ khi đóng form", () => {
  const revoked = [];
  const previews = [{ preview: "first" }, { preview: "second" }];
  const afterAdd = [...previews, { preview: "third" }];
  assert.deepEqual(revoked, []);
  const remaining = removePendingPreview(afterAdd, 1, (url) => revoked.push(url));
  assert.deepEqual(revoked, ["second"]);
  assert.deepEqual(remaining.map((item) => item.preview), ["first", "third"]);
  revokePendingPreviews(remaining, (url) => revoked.push(url));
  assert.deepEqual(revoked, ["second", "first", "third"]);
});

test("tạo cây trước rồi upload tuần tự bằng id được trả về, không xóa cây khi lỗi ảnh", async () => {
  const calls = [];
  const result = await createUserPlantThenUpload({
    payload: { name: "Monstera" },
    files: ["one.jpg", "two.jpg"],
    createPlant: async () => { calls.push("create"); return { _id: "plant-1" }; },
    uploadImage: async (userPlantId, file) => {
      calls.push(`${userPlantId}:${file}`);
      if (file === "two.jpg") throw new Error("upload failed");
    },
  });
  assert.deepEqual(calls, ["create", "plant-1:one.jpg", "plant-1:two.jpg"]);
  assert.equal(result.userPlant._id, "plant-1");
  assert.equal(result.failedUploads, 1);
});

test("album read-only không có quyền upload, sửa hoặc xóa", () => {
  assert.deepEqual(getAlbumCapabilities(true), { canUpload: false, canEdit: false, canDelete: false });
  assert.deepEqual(getAlbumCapabilities(false), { canUpload: true, canEdit: true, canDelete: true });
});

test("dùng catalogue thumbnail khi không có coverImageUrl", () => {
  const image = getUserPlantImage({
    catalogPlantId: {
      thumbnail: "thumbnail.jpg",
      images: ["gallery.jpg"],
    },
  });

  assert.equal(image, "thumbnail.jpg");
});

test("dùng ảnh catalogue đầu tiên trước DEFAULT_IMAGE", () => {
  assert.equal(
    getUserPlantImage({
      catalogPlantId: { images: ["gallery.jpg", "second.jpg"] },
    }),
    "gallery.jpg"
  );
  assert.equal(getUserPlantImage({}), DEFAULT_IMAGE);
});

test("fallback ảnh chỉ áp dụng một lần để không lặp khi ảnh mặc định lỗi", () => {
  assert.equal(getImageFallbackSource("https://cdn.example.com/broken.jpg"), DEFAULT_IMAGE);
  assert.equal(getImageFallbackSource(DEFAULT_IMAGE), null);
  assert.equal(getImageFallbackSource(`${DEFAULT_IMAGE}?cache=1`), null);
});

test("payload form không chứa userId, status hoặc coverImageUrl", () => {
  const payload = buildUserPlantPayload({
    name: "  Monstera  ",
    catalogPlantId: "",
    coverImageUrl: "  /uploads/cover.jpg  ",
    notes: "  Đặt cạnh cửa sổ  ",
    userId: "không được gửi",
    status: "archived",
  });

  assert.deepEqual(payload, {
    name: "Monstera",
    catalogPlantId: null,
    notes: "Đặt cạnh cửa sổ",
  });
  assert.equal("userId" in payload, false);
  assert.equal("status" in payload, false);
  assert.equal("coverImageUrl" in payload, false);
});

test("FormData diagnosis only sends userPlantId for a linked garden plant", () => {
  const file = new Blob(["image"], { type: "image/jpeg" });
  const linked = buildDiagnosisFormData(file, {
    userPlantId: "plant-1",
    catalogPlantId: "client-must-not-control-this",
  });
  assert.equal(linked.get("userPlantId"), "plant-1");
  assert.equal(linked.has("catalogPlantId"), false);

  const unlinked = buildDiagnosisFormData(file);
  assert.equal(unlinked.has("userPlantId"), false);
});

test("AI Doctor URL preserves userPlantId when opening a history", () => {
  assert.equal(
    buildPlantDiagnosisUrl("plant-1"),
    "/ai-doctor?userPlantId=plant-1"
  );
  assert.equal(
    buildPlantDiagnosisUrl("plant-1", "history-1"),
    "/ai-doctor?userPlantId=plant-1&historyId=history-1"
  );
});

test("CareEvent accepts any past/current time and rejects future/invalid time", () => {
  const createdAt = "2026-07-01T00:00:00.000Z";
  const now = new Date("2026-07-27T12:00:00.000Z");

  assert.equal(
    validateCareEventPerformedAt("2020-01-01T07:00", createdAt, now).error,
    ""
  );
  assert.match(
    validateCareEventPerformedAt("2026-07-27T19:01", createdAt, now).error,
    /tương lai/
  );
  assert.match(
    validateCareEventPerformedAt("", createdAt, now).error,
    /không hợp lệ/
  );
});

test("CareEvent datetime-local preserves seconds and has only a future max", () => {
  const source = fs.readFileSync(
    new URL("../../../src/features/my-garden/components/UserPlantCareEvents.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes('step="1"'));
  assert.equal(source.includes("min={userPlantCreatedAt"), false);
  assert.ok(source.includes("max={toLocalDateTimeInputWithSeconds()}"));
  assert.ok(source.includes("validateCareEventPerformedAt"));
  assert.ok(source.includes("Ghi nhận chăm sóc"));
});

test("datetime-local seconds round-trip correctly in Asia/Ho_Chi_Minh", () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = "Asia/Ho_Chi_Minh";
  try {
    const utcDate = new Date("2026-07-27T05:30:45.000Z");
    const localValue = toLocalDateTimeInputWithSeconds(utcDate);
    assert.equal(localValue, "2026-07-27T12:30:45");
    assert.equal(localDateTimeToIso(localValue), utcDate.toISOString());
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test("embedded schedules validate boundaries and display status", () => {
  const now = new Date("2026-07-27T12:00:00.000Z");
  const bounds = getScheduleDateBounds(now);
  assert.equal(
    bounds.min,
    toLocalDateTimeInputWithSeconds(
      new Date(now.getTime() + 60 * 1000)
    )
  );
  assert.equal(validateUserPlantSchedule({
    enabled: true,
    frequencyDays: "3",
    nextDueAt: bounds.min,
  }, "Lịch tưới", now).error, "");
  assert.equal(validateUserPlantSchedule({
    enabled: true,
    frequencyDays: 365,
    nextDueAt: bounds.max,
  }, "Lịch tưới", now).error, "");
  assert.match(validateUserPlantSchedule({
    enabled: true,
    frequencyDays: 0,
    nextDueAt: bounds.min,
  }, "Lịch tưới", now).error, /1 đến 365/);

  const pastLocal = toLocalDateTimeInputWithSeconds(
    new Date(now.getTime() - 1000)
  );
  assert.match(validateUserPlantSchedule({
    enabled: true,
    frequencyDays: 3,
    nextDueAt: pastLocal,
  }, "Lịch tưới", now).error, /quá khứ/);

  assert.equal(getUserPlantScheduleStatus({ enabled: false }, now), "disabled");
  assert.equal(getUserPlantScheduleStatus({
    enabled: true,
    nextDueAt: "2026-07-27T13:00:00.000Z",
  }, now), "today");
  assert.equal(getUserPlantScheduleStatus({
    enabled: true,
    nextDueAt: "2026-07-27T11:00:00.000Z",
  }, now), "overdue");
  assert.equal(getUserPlantScheduleStatus({
    enabled: true,
    nextDueAt: "2026-07-28T12:00:00.000Z",
  }, now), "upcoming");

  const source = fs.readFileSync(
    new URL("../../../src/features/my-garden/components/UserPlantScheduleSettings.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes("min={bounds.min}"));
  assert.ok(source.includes("max={bounds.max}"));
  assert.ok(source.includes("Lịch tưới"));
  assert.ok(source.includes("Lịch bón phân"));
  assert.ok(source.includes("Đã tắt"));
});

test("recording care refetches UserPlant schedules without nested forms", () => {
  const formSource = fs.readFileSync(
    new URL("../../../src/features/my-garden/components/UserPlantFormDialog.jsx", import.meta.url),
    "utf8"
  );
  const careSource = fs.readFileSync(
    new URL("../../../src/features/my-garden/components/UserPlantCareEvents.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(formSource.includes("getUserPlantById(workingPlant._id)"));
  assert.ok(formSource.includes("onRecorded={handleCareRecorded}"));
  assert.ok(careSource.includes("await onRecorded?.()"));
  assert.equal(careSource.includes("<form"), false);
});

test("My Garden removes a deleted UserPlant from local state after API success", () => {
  const source = fs.readFileSync(
    new URL("../../../src/features/my-garden/hooks/useMyGarden.js", import.meta.url),
    "utf8"
  );
  const deleteCall = source.indexOf("await deleteUserPlant(userPlantId)");
  const filterCall = source.indexOf("userPlant._id !== userPlantId", deleteCall);
  assert.ok(deleteCall >= 0);
  assert.ok(filterCall > deleteCall);
});

test("My Garden detail reuses diagnosis history with a userPlantId filter", () => {
  const source = fs.readFileSync(
    new URL("../../../src/features/my-garden/components/UserPlantDiagnosisHistory.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes('from "react-router"'));
  assert.equal(source.includes('from "react-router-dom"'), false);
  assert.ok(source.includes("useDiagnosisHistory"));
  assert.ok(source.includes("userPlantId,"));
  assert.ok(source.includes("DiagnosisHistoryList"));
  assert.ok(source.includes("Chẩn đoán cây này"));
});

test("plant care notification renders message/subtext and targets the correct UserPlant", () => {
  const watering = {
    type: "plant_watering_due",
    message: "Đã đến lúc tưới cây Monstera.",
    userPlantId: { _id: "plant-1", name: "Monstera" },
    careDueAt: "2026-07-27T12:00:00.000Z",
  };
  const fertilizing = {
    type: "plant_fertilizing_due",
    userPlantId: { _id: "plant-2", name: "Rose" },
  };

  assert.equal(isPlantCareNotification(watering), true);
  assert.equal(
    getPlantCareNotificationMessage(watering),
    "Đã đến lúc tưới cây Monstera."
  );
  assert.match(getPlantCareNotificationMessage(fertilizing), /bón phân/);
  assert.match(getPlantCareNotificationSubtext(watering), /Monstera/);
  assert.equal(
    getPlantCareNotificationTarget(watering),
    "/my-garden?userPlantId=plant-1"
  );
  assert.equal(
    getPlantCareNotificationTarget({ type: "post_commented" }),
    null
  );

  const headerSource = fs.readFileSync(
    new URL("../../../src/components/layout/Header.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(headerSource.includes('case "plant_watering_due"'));
  assert.ok(headerSource.includes('case "plant_fertilizing_due"'));
  assert.ok(headerSource.includes("getPlantCareNotificationTarget(notification)"));
});

test("My Garden opens requested plant and clears a missing userPlantId query", () => {
  const source = fs.readFileSync(
    new URL("../../../src/pages/customer/MyGarden.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes('searchParams.get("userPlantId")'));
  assert.ok(source.includes("setDetailPlantId(requestedPlant._id)"));
  assert.ok(source.includes('nextParams.delete("userPlantId")'));
  assert.ok(source.includes("Cây này không còn tồn tại trong My Garden."));
});
