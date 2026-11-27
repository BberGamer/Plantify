import { Platform } from "react-native";
import { fetch as expoFetch } from "expo/fetch";
import { randomUUID } from "expo-crypto";
import { File, Paths } from "expo-file-system";
import api from "./api";
import { adaptDiagnosisHistoryList } from "./listAdapters";
import {
  getSessionContext,
  isSessionCurrent,
  sessionError,
} from "./sessionAccess";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const invalid = (code = "DIAGNOSIS_INVALID_RESPONSE") => {
  throw Object.assign(new Error("Dữ liệu chẩn đoán không hợp lệ."), { code });
};
const text = (value) => typeof value === "string" && value.trim().length > 0;
const optionalText = (value) => value === null || typeof value === "string";
const optionalId = (value) =>
  value === null || (typeof value === "string" && /^[a-f\d]{24}$/i.test(value));
const snapshotValid = (item) =>
  !!item && text(item.title) && Number.isInteger(item.rank) && item.rank >= 1 &&
  item.rank <= 3 && Number.isFinite(item.confidence) &&
  item.confidence >= 0 && item.confidence <= 1;
const plantCandidateValid = (item) =>
  item &&
  optionalId(item.plant_id) &&
  !!item.plant_id &&
  text(item.plant_name) &&
  text(item.display_name) &&
  (item.is_healthy === undefined || typeof item.is_healthy === "boolean") &&
  optionalText(item.scientific_name) &&
  plantDetailsValid(item.plant_details, item.plant_id) &&
  Number.isFinite(item.confidence) &&
  item.confidence >= 0 &&
  item.confidence <= 1;

const historyValid = (item) =>
  item &&
  optionalId(item._id) &&
  !!item._id &&
  (item.result_kind === undefined ||
    ["plant", "disease"].includes(item.result_kind)) &&
  (item.result_kind !== "plant" || item.disease_id === null) &&
  (item.is_healthy === undefined || typeof item.is_healthy === "boolean") &&
  optionalId(item.plant_id) &&
  optionalId(item.disease_id) &&
  optionalText(item.plant_name) &&
  optionalText(item.disease_name) &&
  (item.top_prediction == null || (snapshotValid(item.top_prediction) && item.top_prediction.rank === 1)) &&
  (item.predictions == null || (Array.isArray(item.predictions) &&
    item.predictions.length <= 3 && item.predictions.every((prediction, index) =>
      snapshotValid(prediction) && prediction.rank === index + 1))) &&
  (item.selections === undefined || (Array.isArray(item.selections) &&
    item.selections.length <= 2 && item.selections.every((selection) =>
      snapshotValid(selection) && ["care", "treatment"].includes(selection.kind)))) &&
  item.status === "identified" &&
  (item.has_image === undefined || typeof item.has_image === "boolean") &&
  (item.created_at === null ||
    (typeof item.created_at === "string" &&
      Number.isFinite(Date.parse(item.created_at))));
const historyPath = (id) => {
  if (!id || !optionalId(id)) invalid();
  return `/diagnosis/history/${id}`;
};

const plantDetailsValid = (plant, plantId) =>
  plant == null || (
    plant._id === plantId &&
    text(plant.common_name) &&
    ["scientific_name", "botanical_family", "description"].every(key => optionalText(plant[key])) &&
    plant.care_requirements &&
    ["light", "water", "temperature", "humidity", "soil", "fertilizer"].every(
      key => optionalText(plant.care_requirements[key]),
    )
  );

const candidateValid = (item) =>
  item &&
  Number.isInteger(item.class_id) &&
  item.class_id >= 0 &&
  text(item.class_name) &&
  optionalText(item.display_name) &&
  optionalText(item.plant_name) &&
  optionalText(item.disease_name) &&
  typeof item.is_healthy === "boolean" &&
  Number.isFinite(item.confidence) &&
  item.confidence >= 0 &&
  item.confidence <= 1 &&
  optionalId(item.plant_id) &&
  plantDetailsValid(item.plant_details, item.plant_id) &&
  optionalId(item.disease_id) &&
  optionalText(item.symptoms) &&
  optionalText(item.care_advice) &&
  (item.treatment_available === undefined ||
    typeof item.treatment_available === "boolean");

// Kiểm tra hợp đồng để render an toàn; không tính lại ngưỡng, margin hoặc trạng thái.
export function validateResponse(envelope) {
  const data = envelope?.data;
  const legacyStates = {
    identified: "accepted",
    uncertain: "uncertain",
    unrecognized: "uncertain",
  };
  const state = data?.result_status ?? legacyStates[data?.status];
  if (
    envelope?.success !== true ||
    !["accepted", "uncertain", "invalid_image", "unsupported_image"].includes(
      state,
    ) ||
    !text(data.message) ||
    !text(data.reason) ||
    !Array.isArray(data.alternatives) ||
    !optionalId(data.diagnosis_id ?? null) ||
    !optionalId(data.history_id ?? null)
  )
    invalid();
  if (state === "accepted") {
    const prediction = data.prediction;
    const validateCandidate = data.result_kind === "plant" ? plantCandidateValid : candidateValid;
    if (!data.alternatives.slice(1, 3).every(validateCandidate)) invalid();
    if (data.result_kind === "plant") {
      if (!plantCandidateValid(prediction) || data.diagnosis_id != null)
        invalid();
    } else if (
      !candidateValid(prediction) ||
      !text(prediction.plant_name) ||
      !text(prediction.display_name) ||
      !prediction.plant_id ||
      (!prediction.is_healthy &&
        (!prediction.disease_id || !text(prediction.disease_name)))
    )
      invalid();
  } else if (
    data.prediction !== null ||
    data.diagnosis_id != null ||
    data.history_id != null
  )
    invalid();
  return {
    ...envelope,
    data: {
      ...data,
      result_status: state,
      diagnosis_id: data.diagnosis_id ?? null,
    },
  };
}
async function readGardenAvatar(uri, signal) {
  let response;
  try {
    response = await expoFetch(uri, { signal });
  } catch {
    invalid("DIAGNOSIS_INVALID_PHOTO");
  }
  const mime = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (!response.ok || !response.body || !ALLOWED_TYPES.includes(mime) ||
      Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES) {
    await response.body?.cancel().catch(() => {});
    invalid("DIAGNOSIS_INVALID_PHOTO");
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) invalid("DIAGNOSIS_INVALID_PHOTO");
      chunks.push(value);
    }
    if (!size) invalid("DIAGNOSIS_INVALID_PHOTO");
  } catch {
    await reader.cancel().catch(() => {});
    invalid("DIAGNOSIS_INVALID_PHOTO");
  } finally {
    reader.releaseLock();
  }
  return { chunks, size, mime };
}

async function appendGardenAvatar(body, uri, signal) {
  const download = new AbortController();
  const abort = () => download.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 15000);
  let image;
  try {
    image = await readGardenAvatar(uri, download.signal);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
  const { chunks, size, mime } = image;
  const name = `${randomUUID()}.${mime === "image/jpeg" ? "jpg" : mime.split("/")[1]}`;
  if (Platform.OS === "web") {
    body.append("photo", new Blob(chunks, { type: mime }), name);
    return;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const file = new File(Paths.cache, name);
  const dispose = () => {
    try { if (file.exists) file.delete(); } catch { /* Cache tạm do hệ điều hành quản lý. */ }
  };
  try {
    file.create();
    file.write(bytes);
    body.append("photo", { uri: file.uri, name, type: mime });
    return dispose;
  } catch {
    dispose();
    invalid("DIAGNOSIS_INVALID_PHOTO");
  }
}

export default {
  async history({ page = 1, limit = 20, result_kind } = {}) {
    const response = await api.get("/diagnosis/history", {
      params: { page, limit, result_kind },
    });
    const envelope = adaptDiagnosisHistoryList(response.data);
    if (envelope.data.items.some((item) => !historyValid(item))) invalid();
    return envelope;
  },
  async historyDetail(id, { signal } = {}) {
    const response = await api.get(historyPath(id), { signal });
    if (
      response.data?.success !== true ||
      !historyValid(response.data.data) ||
      response.data.data._id !== id
    )
      invalid();
    return response.data;
  },
  historyImageUrl(id) {
    return api.getUri({ url: `${historyPath(id)}/image` });
  },
  async historyImage(id, { signal } = {}) {
    return (
      await api.get(`${historyPath(id)}/image`, {
        signal,
        responseType: "blob",
      })
    ).data;
  },
  async analyze(
    photo,
    {
      sessionContext = getSessionContext(),
      signal,
      identification = false,
      userPlantId,
    } = {},
  ) {
    if (!photo || !text(photo.uri)) invalid("DIAGNOSIS_INVALID_PHOTO");
    if (photo.fileSize > MAX_IMAGE_BYTES) invalid("DIAGNOSIS_IMAGE_TOO_LARGE");
    if (!sessionContext?.token) throw sessionError("AUTH_REQUIRED");
    if (!isSessionCurrent(sessionContext))
      throw sessionError("SESSION_CHANGED");
    if (signal?.aborted)
      throw Object.assign(new Error(), { code: "ERR_CANCELED" });
    if (photo.mimeType != null && typeof photo.mimeType !== "string")
      invalid("DIAGNOSIS_INVALID_PHOTO");
    let mime = photo.mimeType?.toLowerCase();
    if (mime === "image/jpg") mime = "image/jpeg";
    if (mime && !ALLOWED_TYPES.includes(mime))
      invalid("DIAGNOSIS_UNSUPPORTED_IMAGE");
    const body = new FormData();
    let dispose;
    if (photo.source === "garden-avatar") {
      dispose = await appendGardenAvatar(body, photo.uri, signal);
    } else if (Platform.OS === "web") {
      const response = await fetch(photo.uri, { signal });
      if (!response.ok) invalid("DIAGNOSIS_INVALID_PHOTO");
      const blob = await response.blob();
      if (blob.size > MAX_IMAGE_BYTES) invalid("DIAGNOSIS_IMAGE_TOO_LARGE");
      mime = blob.type?.toLowerCase() || mime;
      if (!ALLOWED_TYPES.includes(mime)) invalid("DIAGNOSIS_UNSUPPORTED_IMAGE");
      body.append(
        "photo",
        blob,
        photo.fileName ||
          `plant.${mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"}`,
      );
    } else {
      // Camera chụp JPEG; album dùng mime từ picker hoặc phần mở rộng của URI.
      if (!mime) {
        const extension = photo.uri
          .split(/[?#]/, 1)[0]
          .split(".")
          .pop()
          ?.toLowerCase();
        mime =
          extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : ["jpg", "jpeg"].includes(extension) || photo.source === "camera"
                ? "image/jpeg"
                : null;
      }
      if (!ALLOWED_TYPES.includes(mime)) invalid("DIAGNOSIS_UNSUPPORTED_IMAGE");
      body.append("photo", {
        uri: photo.uri,
        name:
          photo.fileName ||
          `plant.${mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"}`,
        type: mime,
      });
    }
    // Không để JSON header mặc định hoặc tự đặt boundary cho multipart.
    let response;
    try {
      response = await api.post(
        identification ? "/identification" : "/diagnosis",
        body,
        {
          signal,
          sessionContext,
          params: userPlantId ? { user_plant_id: userPlantId } : undefined,
          timeout: 100000,
          headers: { "Content-Type": null },
        },
      );
    } catch (error) {
      const rejected = error?.response?.data?.data;
      if (rejected?.result_status === "invalid_image") {
        error.diagnosisResult = validateResponse({
          success: true,
          data: rejected,
        }).data;
      }
      throw error;
    } finally {
      dispose?.();
    }
    return validateResponse(response.data);
  },
};
