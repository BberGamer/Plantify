import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, Search, ShieldCheck, ShoppingCart, Star, Store } from "lucide-react";
import { motion } from "motion/react";
import { ShopTermsDialog } from "@/features/products/components/shop/ShopTermsDialog";
import { ShopFilters } from "@/features/products/components/shop/ShopFilters";
import { ShopProductGrid } from "@/features/products/components/shop/ShopProductGrid";

function ShopContent({ MARKETPLACE_TERMS, acceptTerms, categories, error, handleAddToCart, handleApplyPrice, handleClearPriceFilter, handleMaxPriceChange, handleMinPriceChange, handleSearch, loading, maxPrice, maxPriceInput, minPrice, minPriceInput, page, pages, products, searchQuery, selectedCategory, selectedRating, setPage, setSearchQuery, setSelectedCategory, setSelectedRating, setSortBy, setTermsOpen, sortBy, termsOpen, total }) {
  return (
<div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white">
      <ShopTermsDialog MARKETPLACE_TERMS={MARKETPLACE_TERMS} acceptTerms={acceptTerms} setTermsOpen={setTermsOpen} termsOpen={termsOpen} />

      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Store className="w-4 h-4" />
              <span className="text-sm font-medium">Marketplace</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Gian hàng Plantify</h1>
            <p className="text-xl text-white/90 mb-8">
              Mua sắm mọi sản phẩm chăm sóc cây cảnh tại một nơi
            </p>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2">
                <Search className="absolute left-6 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-lg pl-12 text-black"
                />
                <Button type="submit" size="lg" className="rounded-xl bg-gradient-to-r from-primary to-green-600 text-white">
                  Tìm kiếm
                </Button>
              </form>
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                asChild
              >
                <Link to="/cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Giỏ hàng
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <ShopFilters categories={categories} handleApplyPrice={handleApplyPrice} handleClearPriceFilter={handleClearPriceFilter} handleMaxPriceChange={handleMaxPriceChange} handleMinPriceChange={handleMinPriceChange} maxPrice={maxPrice} maxPriceInput={maxPriceInput} minPrice={minPrice} minPriceInput={minPriceInput} selectedCategory={selectedCategory} selectedRating={selectedRating} setPage={setPage} setSelectedCategory={setSelectedCategory} setSelectedRating={setSelectedRating} />

          <ShopProductGrid error={error} handleAddToCart={handleAddToCart} loading={loading} page={page} pages={pages} products={products} setPage={setPage} setSortBy={setSortBy} sortBy={sortBy} total={total} />
        </div>
      </section>
    </div>
  );
}

export { ShopContent };
