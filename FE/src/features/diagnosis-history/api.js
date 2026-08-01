// api.js - Gọi API danh sách và chi tiết lịch sử chẩn đoán của người dùng
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

/**
 * Xóa một lịch sử chẩn đoán thuộc user đang đăng nhập.
 */
export async function deleteMyDiagnosisHistoryById(historyId) {
  const response = await api.delete(`${DIAGNOSIS_HISTORY_API}/${historyId}`);
  return response.data.data;
}
