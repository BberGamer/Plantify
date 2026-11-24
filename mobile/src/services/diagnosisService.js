import { Platform } from "react-native";
import api from "./api";
import { adaptDiagnosisHistoryList } from "./listAdapters";
import {
  getSessionContext,
  isSessionCurrent,
  sessionError,
} from "./sessionAccess";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const invalid = (code = "DIAGNOSIS_INVALID_RESPONSE") => {
  throw Object.assign(new Error("Dữ liệu chẩn đoán không hợp lệ."), { code });
};
const text = (value) => typeof value === "string" && value.trim().length > 0;
const optionalText = (value) => value === null || typeof value === "string";
const optionalId = (value) =>
  value === null || (typeof value === "string" && /^[a-f\d]{24}$/i.test(value));
const plantCandidateValid = (item) =>
  item &&
  optionalId(item.plant_id) &&
  !!item.plant_id &&
  text(item.plant_name) &&
  text(item.display_name) &&
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
  optionalId(item.plant_id) &&
  optionalId(item.disease_id) &&
  optionalText(item.plant_name) &&
  optionalText(item.disease_name) &&
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
    } = {},
  ) {
    if (!photo || !text(photo.uri)) invalid("DIAGNOSIS_INVALID_PHOTO");
    if (photo.fileSize > 10 * 1024 * 1024) invalid("DIAGNOSIS_IMAGE_TOO_LARGE");
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
    if (Platform.OS === "web") {
      const response = await fetch(photo.uri, { signal });
      if (!response.ok) invalid("DIAGNOSIS_INVALID_PHOTO");
      const blob = await response.blob();
      if (blob.size > 10 * 1024 * 1024) invalid("DIAGNOSIS_IMAGE_TOO_LARGE");
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
    }
    return validateResponse(response.data);
  },
};
