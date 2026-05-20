import { useState } from "react";
import { Link } from "react-router";
import { PlantCard } from "@/components/common/PlantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const allPlants = [
  {
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    difficulty: "Dễ",
    water: "Vừa phải",
    light: "Bóng râm",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1614887410788-e158d6efb3be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Trầu Bà Nam Mỹ",
    scientificName: "Philodendron hederaceum",
    difficulty: "Dễ",
    water: "Vừa phải",
    light: "Bóng râm",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1641977563529-7b617571393d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Sen Đá",
    scientificName: "Echeveria elegans",
    difficulty: "Dễ",
    water: "Ít",
    light: "Nhiều ánh sáng",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1614425467998-8a7249179a53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Kim Tiền",
    scientificName: "Zamioculcas zamiifolia",
    difficulty: "Dễ",
    water: "Ít",
    light: "Bóng râm",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1611383856597-aae8f0cfd9e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Cây Lưỡi Hổ",
    scientificName: "Sansevieria trifasciata",
    difficulty: "Dễ",
    water: "Ít",
    light: "Bóng râm",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1609906250026-11abd4c014cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Cây Trầu Bà Lá Tim",
    scientificName: "Philodendron scandens",
    difficulty: "Trung bình",
    water: "Vừa phải",
    light: "Ánh sáng gián tiếp",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1644820864412-2e08f6f7c975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Cây Trầu Bà Đỏ",
    scientificName: "Philodendron erubescens",
    difficulty: "Trung bình",
    water: "Vừa phải",
    light: "Ánh sáng gián tiếp",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1630393178216-7a0bd27bc990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Sen Đá Xanh",
    scientificName: "Echeveria Blue Prince",
    difficulty: "Dễ",
    water: "Ít",
    light: "Nhiều ánh sáng",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1498251095152-27c0ddd22aae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  },
  {
    name: "Cây Kim Tiền Lá Nhỏ",
    scientificName: "Zamioculcas zamiifolia Raven",
    difficulty: "Dễ",
    water: "Ít",
    light: "Bóng râm",
    indoor: true,
    imageUrl: "https://images.unsplash.com/photo-1611211233623-1b1e2162633f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
  }
];

const categories = [
  "Tất cả",
  "Dễ chăm sóc",
  "Cây chịu bóng",
  "Sen đá",
  "Trầu bà",
  "Thanh lọc không khí"
];

function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">Khám phá cây cảnh</h1>
          <p className="text-xl text-muted-foreground">
            Tìm kiếm và lọc từ hàng nghìn loại cây cảnh
          </p>
        </div>
        <div className="mb-10 space-y-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, tên khoa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
            <Button size="lg" variant="outline" className="gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Ánh sáng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bóng râm</SelectItem>
                <SelectItem value="medium">Ánh sáng gián tiếp</SelectItem>
                <SelectItem value="high">Nhiều ánh sáng</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tưới nước" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Ít</SelectItem>
                <SelectItem value="medium">Vừa phải</SelectItem>
                <SelectItem value="high">Nhiều</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
                <SelectItem value="difficulty">Độ khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{allPlants.length}</span> kết quả
          </p>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Xóa bộ lọc
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPlants.map((plant) => (
            <Link key={plant.scientificName} to={`/plant/${plant.scientificName}`}>
              <PlantCard {...plant} />
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Tải thêm cây
          </Button>
        </div>
      </div>
    </div>
  );
}

export {
  Browse
};
