// Dashboard.jsx - Trang dashboard giao diện riêng cho business manager
import { useMemo, useState } from "react";
import { DashboardCard } from "@/components/common/DashboardCard";
import { useDashboardStats } from "@/features/orders/hooks";
import { useCategories, useProducts } from "@/features/products/hooks";




import { Wallet, Package, Tags } from "lucide-react";

import { BusinessDashboardOverview } from "@/features/orders/components/business-dashboard/BusinessDashboardOverview";
import { BusinessDashboardInventory } from "@/features/orders/components/business-dashboard/BusinessDashboardInventory";

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
  const {
    dashboardStats,
    loading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const [productPage, setProductPage] = useState(1);

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

      <BusinessDashboardOverview
        categories={categories}
        error={error}
        formatRevenueValue={formatRevenueValue}
        isLoading={isLoading}
        productCategoryData={productCategoryData}
        revenueBadge={revenueBadge}
        revenueData={revenueData}
        statsError={statsError}
        statsLoading={statsLoading}
      />

      <BusinessDashboardInventory
        getStockLabel={getStockLabel}
        productItems={productItems}
        products={products}
        productsError={productsError}
        productsLoading={productsLoading}
        safeProductPage={safeProductPage}
        setProductPage={setProductPage}
        totalProductPages={totalProductPages}
      />
    </div>
  );
}

export { Dashboard };
