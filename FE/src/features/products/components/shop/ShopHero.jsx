import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Store } from "lucide-react";
import { motion } from "motion/react";

function ShopHero({ onSearch, onSearchChange, searchQuery }) {
  return (
    <section className="shop-hero">
      <div className="shop-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="shop-hero-badge">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">Marketplace</span>
          </div>
          <h1 className="mb-4 text-5xl font-bold">Gian hàng Plantify</h1>
          <p className="mb-8 text-xl text-white/90">
            Mua sắm mọi sản phẩm chăm sóc cây cảnh tại một nơi
          </p>
          <div className="mx-auto max-w-2xl">
            <form onSubmit={onSearch} className="shop-search-form">
              <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="border-0 pl-12 text-lg text-black focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="lg"
                className="rounded-xl bg-gradient-to-r from-primary to-green-600 text-white"
              >
                Tìm kiếm
              </Button>
            </form>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              className="border-white/40 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Giỏ hàng
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { ShopHero };
