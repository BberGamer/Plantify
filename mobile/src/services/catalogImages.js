import * as ImagePicker from "expo-image-picker";

const MAX_PHOTOS_PER_SAVE = 6;
export const catalogImageDraft = (record, cover) =>
  (record.image_urls ?? (cover ? [cover] : [])).map((image_url) => ({ image_url }));

const imageError = (message) =>
  Object.assign(new Error(message), { code: "CATALOG_INVALID_IMAGES" });

export async function pickCatalogPhotos(images) {
  const remaining = MAX_PHOTOS_PER_SAVE - images.filter((row) => row.photo).length;
  if (remaining < 1) throw imageError("Mỗi lần lưu tải lên tối đa 6 ảnh mới.");
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 1,
  });
  if (result.canceled) return [];
  const assets = result.assets || [];
  if (assets.length > remaining) throw imageError("Mỗi lần lưu tải lên tối đa 6 ảnh mới.");
  for (const asset of assets) {
    if (!asset.uri) throw imageError("Không đọc được ảnh đã chọn.");
    if ((asset.fileSize ?? asset.file?.size ?? 0) > 10 * 1024 * 1024)
      throw imageError("Ảnh tối đa 10 MB mỗi tệp.");
    if (asset.mimeType && !["image/jpeg", "image/png"].includes(asset.mimeType))
      throw imageError("Vui lòng chọn ảnh JPG hoặc PNG.");
  }
  return assets.map((photo) => ({ photo }));
}
