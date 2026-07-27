import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Package, Tags, TrendingUp, Boxes, FolderTree, ChevronLeft, ChevronRight } from "lucide-react";

function BusinessDashboardInventory({ getStockLabel, productItems, products, productsError, productsLoading, safeProductPage, setProductPage, totalProductPages }) {
  return (
<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            Sản phẩm đang quản lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải danh sách sản phẩm...</div>
          ) : productsError ? (
            <div className="text-sm text-destructive">{productsError}</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-muted-foreground">Chưa có sản phẩm nào.</div>
          ) : (
            <div className="space-y-4">
              {productItems.map((item) => {
                const stockStatus = getStockLabel(item.stock);

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{Number(item.price || 0).toLocaleString("vi-VN")}đ</Badge>
                      <Badge className={stockStatus.className}>{stockStatus.label}</Badge>
                    </div>
                  </div>
                );
              })}
              {totalProductPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">
                    Trang {safeProductPage} / {totalProductPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProductPage((page) => Math.max(1, page - 1))}
                      disabled={safeProductPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProductPage((page) => Math.min(totalProductPages, page + 1))}
                      disabled={safeProductPage >= totalProductPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  );
}

export { BusinessDashboardInventory };
