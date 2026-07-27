// myGarden.utils.test.js - Kiểm tra thứ tự ưu tiên ảnh của UserPlant
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  buildUserPlantPayload,
  createUserPlantThenUpload,
  DEFAULT_IMAGE,
  getAlbumCapabilities,
  getCareEventCapabilities,
  getImageFallbackSource,
  getUserPlantImage,
  removePendingPreview,
  revokePendingPreviews,
  localDateTimeToIso,
  sortCareEvents,
  toLocalDateTimeInput,
} from "../../../src/features/my-garden/myGarden.utils.js";

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
