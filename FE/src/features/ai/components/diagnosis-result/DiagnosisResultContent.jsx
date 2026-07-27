import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/constants";
import { CheckCircle, Leaf, ShoppingCart } from "lucide-react";
import { Link } from "react-router";

function DiagnosisResultContent({
  DEFAULT_IMAGE,
  DISPLAY_LABELS,
  KnowledgeList,
  availableProducts,
  confidence,
  diagnosis,
  imageUrl,
  onAddToCart,
  result,
  statusContent,
}) {
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

export { DiagnosisResultContent };
