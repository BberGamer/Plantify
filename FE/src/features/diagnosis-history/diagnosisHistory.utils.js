// diagnosisHistory.utils.js - Chuyển DiagnosisHistory về payload dùng chung với kết quả AI Doctor

/**
 * Chuẩn hóa history để UI kết quả không cần phân biệt dữ liệu mới hay dữ liệu đã lưu.
 */
export function mapHistoryToDiagnosisResult(history) {
  if (!history) return null;

  const disease = history.diagnosis?.diseaseId;
  const diseaseInfo = disease && typeof disease === "object"
    ? disease
    : null;
  const snapshot = history.recommendationSnapshot || {};
  const snapshotTreatments = Array.isArray(snapshot.treatments)
    ? snapshot.treatments
    : [];
  const snapshotPreventions = Array.isArray(snapshot.preventions)
    ? snapshot.preventions
    : [];
  const products = Array.isArray(snapshot.productIds)
    ? snapshot.productIds.filter(
      (product) => product && typeof product === "object" && product._id
    )
    : [];

  return {
    diagnosis: {
      ...history.diagnosis,
      diseaseId: diseaseInfo?._id || disease || null,
    },
    diseaseInfo,
    recommendations: {
      treatments: snapshotTreatments.length > 0
        ? snapshotTreatments
        : diseaseInfo?.treatments || [],
      preventions: snapshotPreventions.length > 0
        ? snapshotPreventions
        : diseaseInfo?.preventions || [],
    },
    recommendedProducts: products,
    diagnosisHistoryId: history._id,
    createdAt: history.createdAt,
  };
}
