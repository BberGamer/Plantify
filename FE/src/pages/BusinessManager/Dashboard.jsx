// Dashboard.jsx - Trang dashboard giao diện riêng cho business manager
import { useEffect, useMemo, useState } from "react";
import { DashboardCard } from "@/components/common/DashboardCard";
import { getDashboardStats } from "@/features/orders/api";
import { useCategories, useProducts } from "@/features/products/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Wallet, Package, Tags, TrendingUp, Boxes, FolderTree, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LabelList
} from "recharts";

const EMPTY_DASHBOARD_STATS = {
  totalRevenue: 0,
  monthlyRevenue: []
};

const PRODUCT_PAGE_SIZE = 3;

function formatRevenueValue(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
}

function getStockLabel(stock) {
  if (stock <= 0) {
    return {
      label: "Hết hàng",
      className: "border-transparent bg-rose-100 text-rose-700 hover:bg-rose-100"
    };
  }

  if (stock <= 10) {
    return {
      label: "Sắp hết",
      className: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100"
    };
  }

  return {
    label: "Còn hàng",
    className: "border-transparent bg-green-100 text-green-700 hover:bg-green-100"
  };
}

function Dashboard() {
  const {
    products,
    total,
    loading: productsLoading,
    error: productsError
  } = useProducts({ limit: 1000, sortBy: "newest" });
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories();
  const [dashboardStats, setDashboardStats] = useState(EMPTY_DASHBOARD_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [productPage, setProductPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    setStatsLoading(true);
    setStatsError(null);

    getDashboardStats()
      .then((res) => {
        if (cancelled) {
          return;
        }

        const stats = res?.data?.data || EMPTY_DASHBOARD_STATS;

        setDashboardStats({
          totalRevenue: Number(stats.totalRevenue || 0),
          monthlyRevenue: Array.isArray(stats.monthlyRevenue)
            ? stats.monthlyRevenue.map((item) => ({
                month: item.month,
                revenue: Number(item.revenue || 0)
              }))
            : [],
          year: stats.year
        });
        setStatsLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatsError(err.response?.data?.message || err.message);
          setStatsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalProductPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / PRODUCT_PAGE_SIZE)),
    [products.length]
  );
  const safeProductPage = Math.min(productPage, totalProductPages);
  const productItems = useMemo(
    () => products.slice((safeProductPage - 1) * PRODUCT_PAGE_SIZE, safeProductPage * PRODUCT_PAGE_SIZE),
    [products, safeProductPage]
  );

  const productCategoryData = useMemo(() => {
    const productCountMap = products.reduce((accumulator, product) => {
      const categoryName = product.categoryId?.name || "Chưa phân loại";
      accumulator[categoryName] = (accumulator[categoryName] || 0) + 1;
      return accumulator;
    }, {});

    return categories
      .map((category) => ({
        name: category.name,
        total: productCountMap[category.name] || 0
      }))
      .sort((firstCategory, secondCategory) => {
        if (secondCategory.total !== firstCategory.total) {
          return secondCategory.total - firstCategory.total;
        }

        return firstCategory.name.localeCompare(secondCategory.name, "vi");
      });
  }, [categories, products]);

  const revenueData = dashboardStats.monthlyRevenue;
  const revenueBadge = dashboardStats.year ? `Năm ${dashboardStats.year}` : "Doanh thu thực";
  const isLoading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Quản lý doanh thu, sản phẩm và loại sản phẩm
        </h1>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Doanh thu tổng quan"
          value={statsLoading ? "..." : statsError ? "--" : formatRevenueValue(dashboardStats.totalRevenue)}
          icon={Wallet}
          trend={{ value: 0, isPositive: true }}
        />
        <DashboardCard
          title="Sản phẩm đang quản lý"
          value={productsLoading ? "..." : total.toString()}
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Loại sản phẩm"
          value={categoriesLoading ? "..." : categories.length.toString()}
          icon={Tags}
          trend={{ value: 0, isPositive: true }}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Doanh thu theo tháng
              </CardTitle>
              <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                {revenueBadge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                Đang tải dữ liệu doanh thu...
              </div>
            ) : statsError ? (
              <div className="flex h-80 items-center justify-center text-sm text-destructive">
                {statsError}
              </div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Doanh thu",
                    color: "#16a34a"
                  }
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatRevenueValue(value)} width={80} />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => formatRevenueValue(value)} />}
                    />
                    <Line
                      type="linear"
                      dataKey="revenue"
                      stroke="#16a34a"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={{ fill: "#16a34a", stroke: "#16a34a", strokeWidth: 1, r: 4 }}
                      activeDot={{ r: 6, fill: "#16a34a", stroke: "#16a34a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" />
                Loại sản phẩm
              </CardTitle>
              <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                {categories.length} danh mục
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                Đang tải dữ liệu danh mục...
              </div>
            ) : error ? (
              <div className="flex h-80 items-center justify-center text-sm text-destructive">
                {error}
              </div>
            ) : (
              <ChartContainer
                config={{
                  total: {
                    label: "Số sản phẩm",
                    color: "hsl(var(--primary))"
                  }
                }}
                className="h-80"
              >
                <BarChart
                  data={productCategoryData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                  barCategoryGap={14}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name || "Loại sản phẩm"}
                      />
                    }
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[0, 10, 10, 0]} maxBarSize={34}>
                    <LabelList
                      dataKey="total"
                      position="right"
                      className="fill-foreground text-xs font-medium"
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

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
    </div>
  );
}

export { Dashboard };
