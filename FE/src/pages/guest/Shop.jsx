// Shop.jsx - Hiển thị cửa hàng với tìm kiếm, bộ lọc và danh sách sản phẩm
import { useState } from "react";
import {
  useCategories,
  useMarketplaceSearch,
  useProducts,
} from "@/features/products/hooks";
import { useAuth } from "@/features/auth/hooks";
import { useCartMutations } from "@/features/cart/hooks";
import { toast } from "sonner";
import { ShopTermsDialog } from "@/features/products/components/shop/ShopTermsDialog";
import { ShopFilters } from "@/features/products/components/shop/ShopFilters";
import { ShopHero } from "@/features/products/components/shop/ShopHero";
import { ShopProductGrid } from "@/features/products/components/shop/ShopProductGrid";
import "@/styles/Shop.css";

const MARKETPLACE_TERMS = [
  "Khách hàng cung cấp đầy đủ và chính xác thông tin khi đặt hàng.",
  "Đơn hàng chỉ được xác nhận sau khi hệ thống hoặc nhân viên xác nhận.",
  "Giá sản phẩm là giá hiển thị tại thời điểm đặt hàng.",
  "Khách hàng có trách nhiệm thanh toán đầy đủ theo phương thức đã chọn.",
  "Đơn hàng có thể bị hủy nếu phát hiện thông tin không chính xác hoặc vi phạm chính sách của cửa hàng.",
  "Trường hợp hoàn tiền vui lòng liên hệ riêng với chúng tôi cung cấp thông tin để được hoàn tiền.",
];

/**
 * Điều phối bộ lọc, phân trang, điều khoản và thao tác thêm giỏ tại Shop.
 * @returns {JSX.Element} Trang cửa hàng.
 */
function Shop() {
  const { isAuthenticated } = useAuth();
  const [termsOpen, setTermsOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.localStorage.getItem("plantify:marketplace-terms-accepted");
  });
  const acceptTerms = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("plantify:marketplace-terms-accepted", "1");
    }
    setTermsOpen(false);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("popular");

  // Price states
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Rating state
  const [selectedRating, setSelectedRating] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);

  const { categories: categoryItems } = useCategories();
  const categories = ["Tất cả", ...categoryItems.map((category) => category.name)];
  const { addProduct } = useCartMutations();

  const { searchParam, submitSearch } = useMarketplaceSearch(
    searchQuery,
    setPage
  );

  // Fetch products using custom hook
  const { products, total, pages, currentPage, loading, error } = useProducts({
    search: searchParam,
    category: selectedCategory,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minRating: selectedRating || undefined,
    sortBy,
    page,
    limit: 6
  });

  const handleSearch = (e) => {
    submitSearch(e);
  };

  /** Chuẩn hóa giá nhập thành chuỗi phân tách hàng nghìn và giới hạn một tỷ. @param {string|number} value - Giá trị input. @returns {string} Giá hiển thị. */
  const formatPrice = (value) => {
    // Chỉ giữ lại số
    const clean = value.replace(/\D/g, "");
    if (!clean) return "";
    const num = parseInt(clean, 10);
    if (num <= 0) return "";
    const capped = Math.min(num, 1000000000);
    return capped.toLocaleString("vi-VN");
  };

  const handleMinPriceChange = (e) => {
    setMinPriceInput(formatPrice(e.target.value));
  };

  const handleMaxPriceChange = (e) => {
    setMaxPriceInput(formatPrice(e.target.value));
  };

  /** Áp dụng khoảng giá, tự đảo min/max nếu người dùng nhập ngược. @returns {void} */
  const handleApplyPrice = () => {
    let rawMin = minPriceInput ? parseInt(minPriceInput.replace(/\./g, ""), 10) : "";
    let rawMax = maxPriceInput ? parseInt(maxPriceInput.replace(/\./g, ""), 10) : "";

    if (rawMin && rawMax && rawMin > rawMax) {
      const temp = rawMin;
      rawMin = rawMax;
      rawMax = temp;
      setMinPriceInput(rawMin.toLocaleString("vi-VN"));
      setMaxPriceInput(rawMax.toLocaleString("vi-VN"));
    }

    setMinPrice(rawMin);
    setMaxPrice(rawMax);
    setPage(1);
  };

  const handleClearPriceFilter = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  /** Thêm một sản phẩm vào giỏ và hiển thị kết quả giới hạn tồn kho. @param {Event} event - Sự kiện click. @param {Object} product - Sản phẩm cần thêm. @returns {Promise<void>} */
  const handleAddToCart = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product) return;

    try {
      const result = await addProduct({
        product,
        quantity: 1,
        isAuthenticated,
      });

      if (result.status === "limited") {
        toast.warning(`Chỉ có thể thêm tối đa ${result.stock} sản phẩm này.`);
      } else if (result.status === "updated") {
        toast.success("Đã cập nhật số lượng giỏ hàng!");
      } else {
        toast.success("Đã thêm vào giỏ hàng thành công!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào giỏ hàng.");
    }
  };


  return (
    <div className="shop-page">
      <ShopTermsDialog
        MARKETPLACE_TERMS={MARKETPLACE_TERMS}
        acceptTerms={acceptTerms}
        setTermsOpen={setTermsOpen}
        termsOpen={termsOpen}
      />

      <ShopHero
        onSearch={handleSearch}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      <section className="shop-marketplace">
        <div className="shop-marketplace-grid">
          <ShopFilters
            categories={categories}
            handleApplyPrice={handleApplyPrice}
            handleClearPriceFilter={handleClearPriceFilter}
            handleMaxPriceChange={handleMaxPriceChange}
            handleMinPriceChange={handleMinPriceChange}
            maxPrice={maxPrice}
            maxPriceInput={maxPriceInput}
            minPrice={minPrice}
            minPriceInput={minPriceInput}
            selectedCategory={selectedCategory}
            selectedRating={selectedRating}
            setPage={setPage}
            setSelectedCategory={setSelectedCategory}
            setSelectedRating={setSelectedRating}
          />

          <ShopProductGrid
            error={error}
            handleAddToCart={handleAddToCart}
            loading={loading}
            page={page}
            pages={pages}
            products={products}
            setPage={setPage}
            setSortBy={setSortBy}
            sortBy={sortBy}
            total={total}
          />
        </div>
      </section>
    </div>
  );
}

export {
  Shop
};
