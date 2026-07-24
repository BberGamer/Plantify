/**
 * HeroSection.jsx - Hero section với search form và weather widget
 */
import { motion } from "motion/react";
import { Search, Sparkles, Leaf, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { PlantCard } from "@/components/common/PlantCard";
import { useHomeSearch } from "../hooks";
import { WeatherWidget } from "./WeatherWidget";

export function HeroSection() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    loadingSuggestions,
    shouldShowSuggestions,
  } = useHomeSearch();
  const showSuggestions = isSearchFocused && shouldShowSuggestions;

  return (
    <section className="relative overflow-visible pt-16 lg:pt-20">
      {/* Animated blobs */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-green-200/20 blur-2xl hero-blob-1"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-green-300/20 blur-3xl hero-blob-2"
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Decorative leaves */}
      <div className="absolute top-32 right-12 opacity-10">
        <Leaf className="w-24 h-24 text-primary rotate-12" />
      </div>
      <div className="absolute bottom-24 left-16 opacity-10">
        <Leaf className="w-32 h-32 text-green-600 -rotate-45" />
      </div>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Hero content */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >

          <h1 className="text-5xl font-bold mb-6 gradient-text lg:text-7xl">
            Plantify - Nền tảng tri thức cây cảnh
          </h1>

          <p className="text-xl text-muted-foreground mb-10">
            Tra cứu, chăm sóc và hiểu cây cảnh bằng AI
          </p>

          {/* Search Form */}
          <div className="mx-auto max-w-6xl">
            <div className="relative group">
              <div className="relative mx-auto max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative overflow-hidden rounded-2xl border border-green-200/50 bg-white/95 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Search className="ml-4 w-5 h-5 text-muted-foreground" />
                  <input
                    placeholder="Tìm tên cây hoặc bệnh cây..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 border-0 bg-transparent text-lg outline-none focus-visible:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setSearchQuery("")}
                      className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-green-50 hover:text-foreground"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

              </div>
              </div>

              {showSuggestions && (
                <div
                  className="absolute left-0 right-0 top-full z-30 mt-4 rounded-2xl border border-green-100 bg-white/95 p-4 text-left shadow-2xl backdrop-blur-md"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {loadingSuggestions ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      Đang tìm kiếm...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="grid max-h-[520px] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                      {suggestions.map((suggestion) => (
                        <Link
                          key={suggestion.id}
                          to={`/plant/${suggestion.id}`}
                          className="block"
                        >
                          <PlantCard {...suggestion} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      Không tìm thấy gợi ý phù hợp.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
