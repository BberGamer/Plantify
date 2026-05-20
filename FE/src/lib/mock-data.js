const MOCK_AI_DIAGNOSIS = {
  disease: "Lá vàng do thiếu Nitrogen",
  confidence: 92,
  severity: "Trung bình",
  diagnosis: "Cây của bạn đang thiếu dinh dưỡng, đặc biệt là Nitrogen. Lá vàng từ dưới lên trên là dấu hiệu điển hình.",
  treatments: [
    {
      title: "Bón phân Nitrogen",
      description: "Sử dụng phân NPK với tỷ lệ cao Nitrogen (20-10-10)",
      priority: "Cao"
    },
    {
      title: "Cải thiện đất",
      description: "Bổ sung phân hữu cơ hoặc compost",
      priority: "Trung bình"
    },
    {
      title: "Điều chỉnh tưới nước",
      description: "Tưới đều đặn, tránh úng hoặc khô hạn",
      priority: "Thấp"
    }
  ]
};
const MOCK_AI_SAMPLE_IMAGE = "https://images.unsplash.com/photo-1587717366614-d23cfe1cca83?w=800";
export {
  MOCK_AI_DIAGNOSIS,
  MOCK_AI_SAMPLE_IMAGE
};
