import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const blogPosts = [
  {
    id: 1,
    title: "10 loại cây dễ trồng cho người mới bắt đầu",
    excerpt: "Khám phá những loại cây cảnh dễ chăm sóc, phù hợp cho người mới bắt đầu với không gian sống hiện đại.",
    category: "Hướng dẫn",
    image: "https://images.unsplash.com/photo-1623325944200-bf6ce5743612?w=800",
    author: "Mai Anh",
    date: "10 Tháng 5, 2026",
    readTime: "5 phút đọc"
  },
  {
    id: 2,
    title: "Cách xử lý lá vàng trên cây Monstera",
    excerpt: "Lá vàng là vấn đề phổ biến nhất khi trồng Monstera. Tìm hiểu nguyên nhân và cách khắc phục hiệu quả.",
    category: "Bệnh & Điều trị",
    image: "https://images.unsplash.com/photo-1587717366614-d23cfe1cca83?w=800",
    author: "Tuấn Anh",
    date: "8 Tháng 5, 2026",
    readTime: "8 phút đọc"
  },
  {
    id: 3,
    title: "Phòng ngừa sâu bệnh theo mùa",
    excerpt: "Mỗi mùa có những loại sâu bệnh đặc trưng. Hướng dẫn phòng ngừa và xử lý hiệu quả cho từng mùa.",
    category: "Phòng ngừa",
    image: "https://images.unsplash.com/photo-1498251095152-27c0ddd22aae?w=800",
    author: "Hương Giang",
    date: "5 Tháng 5, 2026",
    readTime: "6 phút đọc"
  },
  {
    id: 4,
    title: "Bí quyết tưới nước đúng cách cho sen đá",
    excerpt: "Sen đá cần rất ít nước nhưng nhiều người vẫn tưới sai cách. Khám phá kỹ thuật tưới nước đúng.",
    category: "Chăm sóc",
    image: "https://images.unsplash.com/photo-1614425467998-8a7249179a53?w=800",
    author: "Minh Tú",
    date: "3 Tháng 5, 2026",
    readTime: "4 phút đọc"
  },
  {
    id: 5,
    title: "Tạo vườn mini trong nhà với cây chịu bóng",
    excerpt: "Không gian thiếu sáng vẫn có thể tạo vườn xanh mát với những loại cây chịu bóng đẹp này.",
    category: "Thiết kế",
    image: "https://images.unsplash.com/photo-1566836610819-aae407b0813a?w=800",
    author: "Phương Anh",
    date: "1 Tháng 5, 2026",
    readTime: "7 phút đọc"
  },
  {
    id: 6,
    title: "Nhân giống trầu bà bằng cành - Hướng dẫn chi tiết",
    excerpt: "Nhân giống trầu bà rất đơn giản nếu biết cách. Tỷ lệ thành công gần 100% với phương pháp này.",
    category: "Kỹ thuật",
    image: "https://images.unsplash.com/photo-1641977563529-7b617571393d?w=800",
    author: "Đức Minh",
    date: "28 Tháng 4, 2026",
    readTime: "10 phút đọc"
  }
];

const categories = [
  "Tất cả",
  "Hướng dẫn",
  "Bệnh & Điều trị",
  "Phòng ngừa",
  "Chăm sóc",
  "Thiết kế",
  "Kỹ thuật"
];

function Blog() {
  const featuredPost = blogPosts[0];

  if (!featuredPost) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">Blog & Cộng đồng</h1>
          <p className="text-xl text-muted-foreground">
            Kiến thức, kinh nghiệm và câu chuyện từ cộng đồng yêu cây cảnh
          </p>
        </div>

        {/* Search & Categories */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              className="pl-12 h-12 text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-primary">Nổi bật</Badge>
                <Badge variant="secondary" className="w-fit mb-4">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <span>• {featuredPost.readTime}</span>
                </div>
                <Button size="lg" className="w-fit">
                  Đọc bài viết
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.id}`}>
                <Card className="overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {post.category}
                    </Badge>
                    <h3 className="font-bold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">Xem thêm bài viết</Button>
        </div>

        {/* Newsletter */}
        <Card className="mt-16 bg-gradient-to-br from-primary/5 to-green-100/20 border-2 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Nhận bài viết mới qua email</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Đăng ký để nhận những bài viết hữu ích, mẹo chăm sóc cây và cập nhật mới nhất từ cộng đồng
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <Input placeholder="Email của bạn" className="h-12" />
              <Button size="lg" className="bg-gradient-to-r from-primary to-green-600">
                Đăng ký
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { Blog };
