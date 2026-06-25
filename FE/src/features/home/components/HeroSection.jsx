/**
 * HeroSection.jsx - Hero section với search form và weather widget
 */
import { motion } from "motion/react";
import { Link } from "react-router";
import { Search, Sparkles, Leaf } from "lucide-react";
import { useHomeSearch } from "../hooks";
import { WeatherWidget } from "./WeatherWidget";

export function HeroSection() {
  const { searchQuery, setSearchQuery, handleSearch } = useHomeSearch();

  return (
    <section className="relative overflow-hidden pt-16 lg:pt-20">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20 text-primary mb-6 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by AI & Neo4j Knowledge Graph</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 gradient-text lg:text-7xl">
            Plantify - Nền tảng tri thức cây cảnh
          </h1>

          <p className="text-xl text-muted-foreground mb-10">
            Tra cứu, chăm sóc và hiểu cây cảnh bằng AI
          </p>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-green-200/50">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <input
                  placeholder="Tìm tên cây hoặc bệnh cây..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-lg bg-transparent outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-green-600 text-white font-medium"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
