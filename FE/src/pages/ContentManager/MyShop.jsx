import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Store,
  Package,
  BarChart3,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  ShoppingBag,
  TrendingUp
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "@/components/common/EmptyState";

const mockShopProducts = [
  {
    id: 1,
    name: "Phân bón hữu cơ NPK",
    price: 85e3,
    stock: 150,
    sold: 234,
    status: "active",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
  },
  {
    id: 2,
    name: "Bộ dụng cụ trồng cây mini",
    price: 15e4,
    stock: 45,
    sold: 156,
    status: "active",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400"
  },
  {
    id: 3,
    name: "Đất trồng chuyên dụng 5kg",
    price: 45e3,
    stock: 0,
    sold: 389,
    status: "out-of-stock",
    image: "https://images.unsplash.com/photo-1585571850696-e31f8b6e8c1a?w=400"
  }
];

const mockOrders = [
  {
    id: "ORD-001",
    customer: "Nguyễn Văn A",
    product: "Phân bón hữu cơ NPK",
    quantity: 2,
    total: 17e4,
    status: "pending",
    date: "18/05/2026"
  },
  {
    id: "ORD-002",
    customer: "Trần Thị B",
    product: "Bộ dụng cụ trồng cây mini",
    quantity: 1,
    total: 15e4,
    status: "shipped",
    date: "17/05/2026"
  }
];

function MyShop() {
  const [hasShop, setHasShop] = useState(true);
  const stats = [
    {
      label: "Tổng doanh thu",
      value: "12,450,000đ",
      icon: DollarSign,
      trend: "+23%",
      color: "text-green-600"
    },
    {
      label: "Đơn hàng",
      value: "48",
      icon: ShoppingBag,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      label: "Sản phẩm",
      value: mockShopProducts.length,
      icon: Package,
      trend: "+5%",
      color: "text-purple-600"
    },
    {
      label: "Đánh giá TB",
      value: "4.8",
      icon: Star,
      trend: "+0.2",
      color: "text-yellow-600"
    }
  ];

  if (!hasShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4 flex items-center justify-center">
        <EmptyState
          icon={Store}
          title="Bạn chưa có gian hàng"
          description="Tạo gian hàng của bạn để bắt đầu bán sản phẩm chăm sóc cây cảnh"
          action={{
            label: "Tạo gian hàng",
            onClick: () => setHasShop(true)
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gian hàng của tôi</h1>
              <p className="text-muted-foreground">Quản lý sản phẩm và đơn hàng</p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-green-600"
              asChild
            >
              <Link to="/my-shop/add-product">
                <Plus className="w-5 h-5 mr-2" />
                Thêm sản phẩm
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 overflow-hidden border-2 border-green-100">
            <div className="h-32 bg-gradient-to-r from-primary to-green-600" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src="/shop-avatar.jpg" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-green-600 text-white">
                    GG
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 mt-4 md:mt-0">
                  <h2 className="text-2xl font-bold mb-1">Green Garden Store</h2>
                  <p className="text-muted-foreground flex items-center gap-2 mb-3">
                    <Store className="w-4 h-4" />
                    Đã tham gia từ 01/2026
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      4.8 rating
                    </Badge>
                    <Badge variant="outline">234 người theo dõi</Badge>
                  </div>
                </div>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa gian hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Sản phẩm
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Thống kê
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockShopProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{product.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Giá: {product.price.toLocaleString("vi-VN")}đ
                            </span>
                            <span>Kho: {product.stock}</span>
                            <span>Đã bán: {product.sold}</span>
                          </div>
                        </div>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status === "active" ? "Đang bán" : "Hết hàng"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-semibold">{order.id}</span>
                            <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                              {order.status === "pending" ? "Chờ xử lý" : "Đã gửi"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Khách hàng: {order.customer}</p>
                            <p>Sản phẩm: {order.product}</p>
                            <p>Số lượng: {order.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary mb-1">
                            {order.total.toLocaleString("vi-VN")}đ
                          </p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê bán hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Biểu đồ thống kê sẽ hiển thị tại đây
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export { MyShop };
