// index.js - Tập trung xuất các hook của domain sản phẩm
export { useCreateCategory, useDeleteCategory, useUpdateCategory } from "./useCategoryActions";
export { useCategories } from "./useCategories";
export { useProduct } from "./useProduct";
export { useCreateProduct, useDeleteProduct, useUpdateProduct } from "./useProductActions";
export { useProducts } from "./useProducts";
export { useMarketplaceSearch } from "@/features/products/hooks/useMarketplaceSearch";

