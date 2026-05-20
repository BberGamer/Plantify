import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  AlertTriangle,
  Calendar,
  BookOpen,
  Bug,
  Sprout
} from "lucide-react";
import { motion } from "motion/react";

function PlantDetail() {
  const { id } = useParams();
  const plantData = {
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    commonNames: ["Cây Monstera", "Trầu Bà Lá Xẻ"],
    difficulty: "Dễ",
    imageUrl: "https://images.unsplash.com/photo-1614887410788-e158d6efb3be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
    description: "Monstera Deliciosa là loại cây cảnh nội thất phổ biến với lá xẻ độc đáo. Cây dễ trồng, thích hợp cho người mới bắt đầu và có khả năng thanh lọc không khí tốt.",
    care: {
      water: {
        frequency: "7-10 ngày/lần",
        amount: "Vừa phải",
        note: "Tưới khi 2-3cm đất mặt khô. Tránh úng nước."
      },
      light: {
        type: "Ánh sáng gián tiếp",
        hours: "4-6 giờ/ngày",
        note: "Tránh ánh sáng trực tiếp mặt trời."
      },
      temperature: {
        min: "18°C",
        max: "30°C",
        optimal: "21-25°C"
      },
      humidity: {
        min: "50%",
        optimal: "60-80%",
        note: "Phun sương lá 2-3 lần/tuần"
      },
      soil: "Đất pha trộn thoát nước tốt (50% đất sân + 30% xơ dừa + 20% perlite)",
      fertilizer: "Phân NPK 20-20-20 loãng, 1 lần/tháng trong mùa sinh trưởng"
    },
    toxicity: {
      level: "Độc nhẹ",
      note: "Chứa calcium oxalate, gây kích ứng nếu ăn phải. Để xa tầm với của trẻ em và thú cưng."
    },
    commonDiseases: [
      {
        name: "Lá vàng",
        cause: "Tưới nước quá nhiều hoặc thiếu ánh sáng",
        solution: "Giảm tần suất tưới, di chuyển đến nơi sáng hơn"
      },
      {
        name: "Lá nâu khô",
        cause: "Độ ẩm thấp hoặc tưới không đủ",
        solution: "Tăng độ ẩm, kiểm tra lịch tưới nước"
      },
      {
        name: "Rệp sáp",
        cause: "Môi trường khô, thiếu thông gió",
        solution: "Lau bằng cồn 70%, tăng độ ẩm không khí"
      }
    ],
    growthStages: [
      { stage: "Tuần 1-4", description: "Mầm mới, lá nhỏ" },
      { stage: "Tháng 2-6", description: "Lá bắt đầu xẻ" },
      { stage: "Tháng 6-12", description: "Phát triển rễ khí" },
      { stage: "Năm 2+", description: "Lá lớn hoàn toàn xẻ" }
    ]
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>
          </Button>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square rounded-2xl overflow-hidden border border-border shadow-lg"
            >
              <img
                src={plantData.imageUrl}
                alt={plantData.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="py-4"
            >
              <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
                {plantData.difficulty}
              </Badge>
              <h1 className="text-5xl font-bold mb-3">{plantData.name}</h1>
              <p className="text-xl text-muted-foreground italic mb-4">
                {plantData.scientificName}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {plantData.commonNames.map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {plantData.description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Droplets className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tưới nước</p>
                      <p className="font-semibold">{plantData.care.water.frequency}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Sun className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ánh sáng</p>
                      <p className="font-semibold">{plantData.care.light.type}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Thermometer className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nhiệt độ</p>
                      <p className="font-semibold">{plantData.care.temperature.optimal}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Wind className="w-8 h-8 text-cyan-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Độ ẩm</p>
                      <p className="font-semibold">{plantData.care.humidity.optimal}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="care" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="care">
              <Droplets className="w-4 h-4 mr-2" />
              Chăm sóc
            </TabsTrigger>
            <TabsTrigger value="diseases">
              <Bug className="w-4 h-4 mr-2" />
              Bệnh thường gặp
            </TabsTrigger>
            <TabsTrigger value="growth">
              <Sprout className="w-4 h-4 mr-2" />
              Giai đoạn phát triển
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="w-4 h-4 mr-2" />
              Lịch chăm sóc
            </TabsTrigger>
          </TabsList>
          <TabsContent value="care" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Tưới nước
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tần suất</p>
                    <p className="font-semibold">{plantData.care.water.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lượng nước</p>
                    <p className="font-semibold">{plantData.care.water.amount}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  💡 {plantData.care.water.note}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  Ánh sáng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loại</p>
                    <p className="font-semibold">{plantData.care.light.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Thời lượng</p>
                    <p className="font-semibold">{plantData.care.light.hours}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  💡 {plantData.care.light.note}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Đất & Phân bón
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Đất</p>
                  <p>{plantData.care.soil}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Phân bón</p>
                  <p>{plantData.care.fertilizer}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  Cảnh báo độc tính
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-2">
                  {plantData.toxicity.level}
                </Badge>
                <p className="text-sm">{plantData.toxicity.note}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="diseases" className="space-y-4">
            {plantData.commonDiseases.map((disease, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-red-500" />
                    {disease.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nguyên nhân</p>
                    <p>{disease.cause}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Giải pháp</p>
                    <p className="text-primary font-medium">{disease.solution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button className="w-full" variant="outline" asChild>
              <Link to="/ai-doctor">Chẩn đoán bằng AI</Link>
            </Button>
          </TabsContent>
          <TabsContent value="growth" className="space-y-4">
            {plantData.growthStages.map((stage, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{stage.stage}</h4>
                      <p className="text-muted-foreground">{stage.description}</p>
                      <Progress value={(index + 1) * 25} className="mt-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Lịch chăm sóc hàng tuần</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Tưới nước</p>
                      <p className="text-sm text-muted-foreground">Thứ 2, Thứ 5</p>
                    </div>
                  </div>
                  <Badge>2 lần/tuần</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sprout className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Phun sương</p>
                      <p className="text-sm text-muted-foreground">Thứ 2, Thứ 4, Thứ 6</p>
                    </div>
                  </div>
                  <Badge>3 lần/tuần</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold">Bón phân</p>
                      <p className="text-sm text-muted-foreground">Cuối mỗi tháng</p>
                    </div>
                  </div>
                  <Badge>1 lần/tháng</Badge>
                </div>
                <Button className="w-full mt-4">Đặt nhắc nhở trên lịch</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export {
  PlantDetail
};
