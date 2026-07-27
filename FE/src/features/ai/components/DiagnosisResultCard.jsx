// DiagnosisResultCard.jsx - UI dùng chung cho kết quả AI mới và DiagnosisHistory






import { DiagnosisResultContent } from "@/features/ai/components/diagnosis-result/DiagnosisResultContent";

const DEFAULT_IMAGE = "/default-product.svg";
const STATUS_CONTENT = {
  matched: {
    title: "Đã đối chiếu với kho bệnh cây",
    description: "Thông tin điều trị và sản phẩm bên dưới được lấy từ cơ sở tri thức Plantify.",
    className: "border-green-200 bg-green-50 text-green-800",
  },
  unmatched: {
    title: "Chưa tìm thấy bệnh tương ứng",
    description: "AI nhận thấy dấu hiệu bất thường nhưng chưa khớp với kho bệnh cây. Không tự ý sử dụng thuốc đặc trị.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  low_confidence: {
    title: "Độ tin cậy còn thấp",
    description: "Ảnh chưa cung cấp đủ dấu hiệu rõ ràng. Hãy chụp gần vùng bị ảnh hưởng trong điều kiện đủ sáng.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  needs_review: {
    title: "Kết quả cần được xem xét thêm",
    description: "Có nhiều bệnh trong kho kiến thức có mức độ tương đồng gần nhau. Hệ thống chưa đưa ra điều trị hoặc sản phẩm đặc trị để tránh nhầm lẫn.",
    className: "border-orange-200 bg-orange-50 text-orange-800",
  },
  unknown: {
    title: "Chưa thể xác định tình trạng",
    description: "Cây có thể khỏe mạnh hoặc ảnh chưa đủ dữ liệu để kết luận. Hãy theo dõi thêm và thử ảnh khác nếu cần.",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
};

const DISPLAY_LABELS = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  unknown: "Không xác định",
  leaf: "Lá",
  stem: "Thân",
  root: "Rễ",
  flower: "Hoa",
  whole_plant: "Toàn cây",
};

function KnowledgeList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DiagnosisResultCard({
  result,
  imageUrl,
  onAddToCart,
  onNewDiagnosis,
}) {
  const diagnosis = result.diagnosis || {};
  const confidence = Math.max(0, Math.min(Number(diagnosis.confidence) || 0, 1));
  const statusContent = STATUS_CONTENT[diagnosis.matchStatus];
  const availableProducts = (result.recommendedProducts || []).filter(
    (product) => product.isActive && Number(product.stock) > 0
  );

  return (
    <DiagnosisResultContent
      DEFAULT_IMAGE={DEFAULT_IMAGE}
      DISPLAY_LABELS={DISPLAY_LABELS}
      KnowledgeList={KnowledgeList}
      availableProducts={availableProducts}
      confidence={confidence}
      diagnosis={diagnosis}
      imageUrl={imageUrl}
      onAddToCart={onAddToCart}
      result={result}
      statusContent={statusContent}
    />
  );
}
