/**
 * Home.jsx - Trang chủ Plantify
 * Hien thi hero, cac section gioi thieu va modal chi tiet blog inline.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import BlogPostDetail, {
  BlogPostDetailError,
  BlogPostDetailSkeleton,
} from "@/components/common/BlogPostDetail";
import { PlantCard } from "@/components/common/PlantCard";
import { usePlants } from "@/features/plants/hooks";
import { getCareGuides } from "@/features/care-guides/api";
import { getPlantDiseases } from "@/features/plant-diseases/api";
import { usePostDetail, usePosts } from "@/features/posts/hooks";
import { getWeatherByCity } from "@/features/weather/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Sparkles,
  Bug,
  Calendar,
  Upload,
  Leaf,
  Store,
  ShoppingCart,
  Package,
  CloudSun,
  Droplets,
  Gauge,
  Wind
} from "lucide-react";
import { motion } from "motion/react";


const DISEASE_KEYWORDS = ["bệnh", "lá", "đốm", "vàng", "héo", "thối", "sâu", "nấm", "rệp", "triệu chứng", "điều trị", "phòng ngừa"];
const CARE_GUIDE_KEYWORDS = ["chăm sóc", "tưới", "cắt tỉa", "thay chậu", "nhân giống", "repot", "pruning", "watering", "propagation"];

const extractItems = (response, arrayKey) => {
  const data = response?.data || response?.result || response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[arrayKey])) return data[arrayKey];
  return [];
};

const getPlantId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || null;
};

const detectSearchIntent = (query) => {
  const normalizedQuery = query.toLocaleLowerCase("vi");

  if (DISEASE_KEYWORDS.some((keyword) => normalizedQuery.includes(keyword))) {
    return "diseases";
  }

  if (CARE_GUIDE_KEYWORDS.some((keyword) => normalizedQuery.includes(keyword))) {
    return "care-guides";
  }

  return "browse";
};

const matchesQuery = (value, normalizedQuery) =>
  String(value || "").toLocaleLowerCase("vi").includes(normalizedQuery);

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherCity, setWeatherCity] = useState("Ho Chi Minh");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [selectedPostHome, setSelectedPostHome] = useState(null);
  const [showDetailHome, setShowDetailHome] = useState(false);
  const navigate = useNavigate();
  const { plants: apiPlants, loading, error } = usePlants({ page: 1, limit: 6 });
  const { posts: apiPosts } = usePosts({ page: 1, limit: 3 });
  const {
    post: detailPostHome,
    comments: detailCommentsHome,
    loading: detailLoadingHome,
    error: detailErrorHome,
  } = usePostDetail(showDetailHome ? selectedPostHome?._id || selectedPostHome?.id : null);

  const resolveDirectPlantMatch = async (query, intent) => {
    const normalizedQuery = query.toLocaleLowerCase("vi");

    if (intent === "diseases") {
      const response = await getPlantDiseases({ page: 1, limit: 200 });
      const diseases = extractItems(response, "diseases");
      const matchedDiseases = diseases.filter((disease) => (
        matchesQuery(disease.name, normalizedQuery)
        || matchesQuery(disease.symptoms, normalizedQuery)
        || matchesQuery(disease.causes, normalizedQuery)
        || matchesQuery(disease.treatment, normalizedQuery)
        || matchesQuery(disease.prevention, normalizedQuery)
        || matchesQuery(disease.plantId?.name, normalizedQuery)
      ));
      const plantIds = [...new Set(matchedDiseases.map((disease) => getPlantId(disease.plantId)).filter(Boolean))];
      return plantIds.length === 1 ? plantIds[0] : null;
    }

    if (intent === "care-guides") {
      const response = await getCareGuides({ page: 1, limit: 200 });
      const careGuides = extractItems(response, "careGuides");
      const matchedCareGuides = careGuides.filter((guide) => (
        matchesQuery(guide.watering, normalizedQuery)
        || matchesQuery(guide.pruning, normalizedQuery)
        || matchesQuery(guide.propagation, normalizedQuery)
        || matchesQuery(guide.repotting, normalizedQuery)
        || matchesQuery(guide.plantId?.name, normalizedQuery)
      ));
      const plantIds = [...new Set(matchedCareGuides.map((guide) => getPlantId(guide.plantId)).filter(Boolean))];
      return plantIds.length === 1 ? plantIds[0] : null;
    }

    return null;
  };

  // === Search handlers: form submit hoặc Enter → navigate với ?q= ===
  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      navigate("/browse");
      return;
    }

    const intent = detectSearchIntent(trimmedQuery);

    if (intent === "browse") {
      navigate(`/browse?q=${encodeURIComponent(trimmedQuery)}`);
      return;
    }

    try {
      const plantId = await resolveDirectPlantMatch(trimmedQuery, intent);

      if (plantId) {
        navigate(`/plant/${plantId}?tab=${intent}`);
        return;
      }
    } catch (error) {
      console.error("Không thể resolve kết quả tìm kiếm trực tiếp:", error);
    }

    navigate(`/browse?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const fetchWeather = async (city) => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setWeatherError("Vui lòng nhập tên thành phố");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await getWeatherByCity(trimmedCity);
      setWeather(response.data);
    } catch (error) {
      setWeather(null);
      setWeatherError(
        error.response?.data?.message
          || error.message
          || "Không thể tải thông tin thời tiết"
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleWeatherSearch = (event) => {
    event.preventDefault();
    fetchWeather(weatherCity);
  };

  const difficultyLabel = { low: "Dễ", medium: "Trung bình", high: "Khó" };
  const levelLabel = { low: "Ít", medium: "Trung bình", high: "Nhiều" };

  const plantCards = apiPlants.map((plant) => ({
    id: plant._id || plant.id,
    name: plant.name,
    scientificName: plant.scientificName,
    difficulty: difficultyLabel[plant.difficultyLevel] || plant.difficultyLevel,
    humidity: plant.humidity,
    light: levelLabel[plant.sunlight] || plant.sunlight,
    indoor: plant.isIndoor,
    imageUrl: plant.thumbnail || plant.images?.[0],
  }));

  const blogCards = apiPosts.map((post) => ({
    ...post,
    id: post.id || post._id,
    title: post.title,
    category: post.category,
    image: post.thumbnail || post.images?.[0],
  }));
  const activePostHome = detailPostHome || selectedPostHome;
  const activeCommentsHome = detailPostHome ? detailCommentsHome : selectedPostHome?.comments || [];

  function handleOpenPostHome(post) {
    setSelectedPostHome(post);
    setShowDetailHome(true);
  }

  function handleClosePostHome() {
    setShowDetailHome(false);
  }

  useEffect(() => {
    if (!showDetailHome) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClosePostHome();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetailHome]);

  useEffect(() => {
    fetchWeather("Ho Chi Minh");
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">     
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-green-200/20 blur-2xl"
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
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-green-300/20 blur-3xl"
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
        <div className="absolute top-32 right-12 opacity-10">
          <Leaf className="w-24 h-24 text-primary rotate-12" />
        </div>
        <div className="absolute bottom-24 left-16 opacity-10">
          <Leaf className="w-32 h-32 text-green-600 -rotate-45" />
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-6 pt-6 lg:absolute lg:right-8 lg:top-6 lg:mx-0 lg:w-80 lg:px-0 lg:pt-0">
          <Card className="border border-green-200/70 bg-white/95 shadow-lg backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold text-primary">
                <CloudSun className="h-4 w-4" />
                <span className="text-sm">Thời tiết chăm cây</span>
              </div>
              <form onSubmit={handleWeatherSearch} className="mb-3 flex gap-2">
                <Input
                  value={weatherCity}
                  onChange={(event) => setWeatherCity(event.target.value)}
                  placeholder="Thành phố..."
                  className="h-9 min-w-0 text-sm"
                />
                <Button type="submit" size="sm" className="h-9 px-3" disabled={weatherLoading}>
                  {weatherLoading ? "..." : "Xem"}
                </Button>
              </form>
              {weatherError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {weatherError}
                </div>
              )}
              {weather && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {weather.iconUrl && (
                      <img
                        src={weather.iconUrl}
                        alt={weather.description || "Weather icon"}
                        className="h-12 w-12"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {weather.cityName}, {weather.country}
                      </div>
                      <div className="text-2xl font-bold leading-tight">
                        {Math.round(weather.temperature)}°C
                      </div>
                      <div className="truncate text-xs capitalize text-muted-foreground">
                        {weather.description}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md bg-blue-50 p-2">
                      <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                        <Droplets className="h-3.5 w-3.5 text-blue-600" />
                        Ẩm
                      </div>
                      <div className="font-semibold">{weather.humidity}%</div>
                    </div>
                    <div className="rounded-md bg-sky-50 p-2">
                      <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                        <Wind className="h-3.5 w-3.5 text-sky-600" />
                        Gió
                      </div>
                      <div className="font-semibold">{weather.windSpeed} m/s</div>
                    </div>
                    <div className="rounded-md bg-amber-50 p-2">
                      <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                        <Gauge className="h-3.5 w-3.5 text-amber-600" />
                        hPa
                      </div>
                      <div className="font-semibold">{weather.pressure}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
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
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-br from-primary via-green-600 to-green-700 bg-clip-text text-transparent">
              Plantify - Nền tảng tri thức cây cảnh
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Tra cứu, chăm sóc và hiểu cây cảnh bằng AI
            </p>
            <div className="max-w-2xl mx-auto">
              {/* === Search Form: navigate sang browse === */}
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-green-200/50">
                  <Search className="w-5 h-5 text-muted-foreground ml-4" />
                  <Input
                    placeholder="Tìm cây cảnh, bệnh lá, cách chăm sóc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-lg"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-primary to-green-600"
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-bold mb-2">Cơ sở tri thức cây cảnh</h2>
            <p className="text-muted-foreground">
              Khám phá hàng nghìn loại cây cảnh với hướng dẫn chi tiết
            </p>
          </div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/browse">Xem tất cả</Link>
          </Button>
        </div>
        {loading && (
          <div className="py-12 text-center text-muted-foreground">
            Đang tải danh sách cây...
          </div>
        )}
        {error && (
          <div className="py-12 text-center text-destructive">
            Không thể tải danh sách cây: {error}
          </div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantCards.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/plant/${plant.id}`}>
                  <PlantCard {...plant} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-green-50/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(45, 106, 79, 0.1) 1px, transparent 0)`,
            backgroundSize: "40px 40px"
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Bác sĩ cây cảnh AI</h2>
            <p className="text-muted-foreground text-lg">
              Chẩn đoán bệnh và nhận tư vấn chăm sóc chỉ bằng một bức ảnh
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tải ảnh lá cây lên</h3>
                <p className="text-muted-foreground mb-6">
                  Chụp hoặc tải ảnh lá cây cần chẩn đoán
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-green-600"
                  asChild
                >
                  <Link to="/ai-doctor">Chọn ảnh</Link>
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Bug className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Phát hiện bệnh</h4>
                      <p className="text-sm text-muted-foreground">
                        AI phân tích và nhận diện các dấu hiệu bệnh trên lá cây
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[95%] bg-gradient-to-r from-primary to-green-600" />
                        </div>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Đề xuất điều trị</h4>
                      <p className="text-sm text-muted-foreground">
                        Nhận hướng dẫn chi tiết về cách chăm sóc và điều trị
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Lịch chăm sóc</h4>
                      <p className="text-sm text-muted-foreground">
                        Nhận nhắc nhở tưới nước, bón phân theo lịch trình
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Store className="w-4 h-4" />
            <span className="text-sm font-medium">Marketplace</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Gian hàng Plantify</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mua sắm mọi sản phẩm chăm sóc cây cảnh - từ phân bón, dụng cụ đến chậu cây
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Đa dạng sản phẩm</h3>
              <p className="text-muted-foreground text-sm">
                Hàng nghìn sản phẩm từ nhiều shop uy tín
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Mở gian hàng miễn phí</h3>
              <p className="text-muted-foreground text-sm">Bán sản phẩm của bạn dễ dàng</p>
            </CardContent>
          </Card>
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Giao hàng nhanh chóng</h3>
              <p className="text-muted-foreground text-sm">Nhận hàng tận nơi, an toàn</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-primary to-green-600" asChild>
            <Link to="/marketplace">
              <Store className="w-5 h-5 mr-2" />
              Khám phá gian hàng
            </Link>
          </Button>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">Cộng đồng & Blog</h2>
            <p className="text-muted-foreground">
              Chia sẻ kinh nghiệm và kiến thức chăm sóc cây cảnh
            </p>
          </div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/blog">Xem tất cả</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {blogCards.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                type="button"
                className="block h-full w-full text-left"
                onClick={() => handleOpenPostHome(article)}
              >
                <Card className="h-full overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold mb-2">{article.title}</h3>
                    <span className="inline-flex h-auto p-0 text-sm font-medium text-primary">
                      Đọc thêm →
                    </span>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      </section>
      {showDetailHome && detailLoadingHome && !detailPostHome && (
        <BlogPostDetailSkeleton onClose={handleClosePostHome} />
      )}

      {showDetailHome && detailErrorHome && !detailLoadingHome && !detailPostHome && (
        <BlogPostDetailError message={detailErrorHome} onClose={handleClosePostHome} />
      )}

      {showDetailHome && activePostHome && (!detailLoadingHome || detailPostHome) && (
        <BlogPostDetail
          post={activePostHome}
          comments={activeCommentsHome}
          onClose={handleClosePostHome}
        />
      )}
    </div>
  );
}

export {
  Home
};

