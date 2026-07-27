// api.js - Gọi API danh sách và chi tiết lịch sử chẩn đoán của user hiện tại
import { api } from "@/lib/api";

const DIAGNOSIS_HISTORY_API = "/diagnosis-histories";

/**
 * Lấy lịch sử chẩn đoán của user đang đăng nhập.
 */
export async function getMyDiagnosisHistories(params = {}, signal) {
  const response = await api.get(DIAGNOSIS_HISTORY_API, {
    params,
    signal,
  });
  return response.data.data;
}

/**
 * Lấy một lịch sử theo ID; backend tự giới hạn theo user hiện tại.
 */
export async function getMyDiagnosisHistoryById(historyId, signal) {
  const response = await api.get(
    `${DIAGNOSIS_HISTORY_API}/${historyId}`,
    { signal }
  );
  return response.data.data;
}
