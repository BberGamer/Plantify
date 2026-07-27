// myGarden.utils.test.js - Kiểm tra thứ tự ưu tiên ảnh của UserPlant
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildUserPlantPayload,
  createUserPlantThenUpload,
  DEFAULT_IMAGE,
  getAlbumCapabilities,
  getImageFallbackSource,
  getUserPlantImage,
  removePendingPreview,
  revokePendingPreviews,
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
