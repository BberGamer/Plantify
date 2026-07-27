// myGarden.utils.test.js - Kiểm tra thứ tự ưu tiên ảnh của UserPlant
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildUserPlantPayload,
  DEFAULT_IMAGE,
  getImageFallbackSource,
  getUserPlantImage,
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

test("payload form không chứa userId hoặc status", () => {
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
    coverImageUrl: "/uploads/cover.jpg",
    notes: "Đặt cạnh cửa sổ",
  });
  assert.equal("userId" in payload, false);
  assert.equal("status" in payload, false);
});
