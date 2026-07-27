// DiagnosisResultCard.jsx - UI dùng chung cho kết quả AI mới và DiagnosisHistory
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/constants";
import {
  CheckCircle,
  Leaf,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router";

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
    <Card className="h-full border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-green-50/50">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Kết quả chẩn đoán
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-center space-y-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Ảnh cây đã dùng để chẩn đoán"
            className="max-h-72 w-full rounded-xl border bg-muted object-contain"
          />
        ) : null}

        <div className="py-4 text-center">
          <Leaf className="mx-auto mb-3 h-12 w-12 text-primary" />
          <p className="mb-1 text-sm text-muted-foreground">Bệnh</p>
          <h3 className="text-2xl font-bold text-primary">
            {result.diseaseInfo?.name
              || diagnosis.rawDiseaseName
              || "Chưa xác định"}
          </h3>
          {diagnosis.description ? (
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              {diagnosis.description}
            </p>
          ) : null}
        </div>

        {statusContent ? (
          <div className={`rounded-lg border p-3 text-sm ${statusContent.className}`}>
            <p className="font-semibold">{statusContent.title}</p>
            <p className="mt-1 text-xs">{statusContent.description}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Độ chính xác</span>
            <span className="font-semibold">{(confidence * 100).toFixed(1)}%</span>
          </div>
          <Progress value={confidence * 100} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-white/60 p-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Mức độ</p>
            <p className="font-semibold">
              {DISPLAY_LABELS[diagnosis.severity] || "Không xác định"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bộ phận ảnh hưởng</p>
            <p className="font-semibold">
              {DISPLAY_LABELS[diagnosis.affectedPart] || "Không xác định"}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-white/60 p-4">
          <KnowledgeList
            title="Dấu hiệu quan sát từ ảnh"
            items={diagnosis.observedSymptoms}
          />
          <KnowledgeList title="Triệu chứng" items={result.diseaseInfo?.symptoms} />
          <KnowledgeList title="Nguyên nhân" items={result.diseaseInfo?.causes} />
          <KnowledgeList
            title="Cách xử lý"
            items={result.recommendations?.treatments}
          />
          <KnowledgeList
            title="Phòng ngừa"
            items={result.recommendations?.preventions}
          />
        </div>

        {availableProducts.length > 0 ? (
          <div className="space-y-3">
            <p className="font-semibold">Sản phẩm phù hợp</p>
            {availableProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 rounded-xl border bg-white p-3"
              >
                <Link
                  to={ROUTES.productDetail(product._id)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Xem chi tiết sản phẩm ${product.name}`}
                >
                  <img
                    src={product.thumbnail || product.images?.[0] || DEFAULT_IMAGE}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold transition-colors hover:text-primary">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {Number(product.price || 0).toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Còn {product.stock} sản phẩm
                    </p>
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddToCart(product)}
                  aria-label={`Thêm ${product.name} vào giỏ hàng`}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Phân tích hình ảnh bằng OpenRouter; khuyến nghị từ kho kiến thức Plantify.
        </p>
      </CardContent>
    </Card>
  );
}
