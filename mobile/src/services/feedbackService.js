import { Platform } from "react-native";
import api from "./api";
import { adaptFeedbackList } from "./listAdapters";
import {
  getSessionContext,
  isSessionCurrent,
  sessionError,
} from "./sessionAccess";

export const MAX_FEEDBACK_IMAGES = 5;
export const MAX_FEEDBACK_BYTES = 10 * 1024 * 1024;
const mimeByExtension = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const path = (manager, id) =>
  `/feedback${manager ? "/manager" : ""}${id ? "/" + id : ""}`;

export function feedbackPhotoError(asset, file = asset?.file) {
  const size = file?.size ?? asset?.fileSize;
  const extension = (file?.name || asset?.fileName || asset?.uri || "")
    .split(/[?#]/)[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  const type = (
    file?.type ||
    asset?.mimeType ||
    mimeByExtension[extension]
  )?.toLowerCase();
  if (
    !asset?.uri ||
    !Object.values(mimeByExtension).includes(
      type === "image/jpg" ? "image/jpeg" : type,
    )
  )
    return "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.";
  if (size > MAX_FEEDBACK_BYTES) return "Mỗi ảnh được tối đa 10 MB.";
  return "";
}

export default {
  async list(params, manager = false) {
    const { data } = await api.get(path(manager), { params });
    return adaptFeedbackList(data);
  },
  async detail(id, manager, signal) {
    const { data } = await api.get(path(manager, id), { signal });
    return data.data;
  },
  async create({ description, diagnosisId, images, key }) {
    const sessionContext = getSessionContext();
    const body = new FormData();
    body.append("description", description);
    if (diagnosisId) body.append("diagnosis_id", diagnosisId);
    for (const image of images) {
      const extension = (image.fileName || image.uri)
        .split(/[?#]/)[0]
        .split(".")
        .pop()
        ?.toLowerCase();
      const filename =
        image.fileName ||
        `feedback.${mimeByExtension[extension] ? extension : "jpg"}`;
      const mime = image.mimeType?.toLowerCase() || mimeByExtension[extension];
      if (Platform.OS === "web") {
        const file = image.file ?? (await (await fetch(image.uri)).blob());
        const error = feedbackPhotoError(image, file);
        if (error)
          throw Object.assign(new Error(error), {
            code: "FEEDBACK_INVALID_IMAGES",
          });
        body.append("images", file, file.name || filename);
      } else {
        body.append("images", {
          uri: image.uri,
          name: filename,
          type: mime === "image/jpg" ? "image/jpeg" : mime,
        });
      }
    }
    if (!isSessionCurrent(sessionContext))
      throw sessionError("SESSION_CHANGED");
    const { data } = await api.post(path(false), body, {
      sessionContext,
      headers: { "Content-Type": null, "Idempotency-Key": key },
      timeout: 150000,
    });
    return data.data;
  },
  async review(id, input) {
    const { data } = await api.patch(`${path(true, id)}/review`, input);
    return data.data;
  },
  managerHistoryImageUrl(id) {
    return api.getUri({ url: `${path(true, id)}/history-image` });
  },
  async managerHistoryImage(id, signal) {
    const { data } = await api.get(`${path(true, id)}/history-image`, {
      signal,
      responseType: "blob",
    });
    return data;
  },
  imageUrl(id, index, manager) {
    return api.getUri({ url: `${path(manager, id)}/images/${index}` });
  },
  async image(id, index, manager, signal) {
    const { data } = await api.get(`${path(manager, id)}/images/${index}`, {
      signal,
      responseType: "blob",
    });
    return data;
  },
};
