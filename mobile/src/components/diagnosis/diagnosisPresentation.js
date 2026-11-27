const percent = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 2,
});

export const formatConfidence = (value) => Number.isFinite(value) ? percent.format(value) : "";

export const formatPrediction = (prediction) => [
  prediction.title,
  formatConfidence(prediction.confidence),
].filter(Boolean).join(" · ");

export const selectionLabel = (kind) =>
  kind === "treatment" ? "Đã chọn để điều trị" : "Đã chọn để chăm sóc";

export const historyTopPrediction = (record) => {
  if (record.top_prediction) return record.top_prediction;
  const plant = record.plant_name || "Thông tin cây không còn khả dụng";
  const disease = record.is_healthy
    ? "Chưa phát hiện bệnh"
    : record.disease_name || "Thông tin bệnh không còn khả dụng";
  return {
    title: record.result_kind === "plant" ? plant : `${plant} · ${disease}`,
    confidence: record.confidence,
  };
};
