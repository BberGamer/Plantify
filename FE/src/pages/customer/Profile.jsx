import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  Package,
  Heart,
  Calendar,
  Leaf
} from "lucide-react";
import { motion } from "motion/react";

const mockOrders = [
  {
    id: "ORD-001",
    date: "2026-05-15",
    status: "Đã giao",
    total: "450,000đ",
    items: 2
  },
  {
    id: "ORD-002",
    date: "2026-05-10",
    status: "Đang vận chuyển",
    total: "280,000đ",
    items: 1
  },
  {
    id: "ORD-003",
    date: "2026-05-05",
    status: "Đã giao",
    total: "650,000đ",
    items: 3
  }
];

const mockSavedPlants = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    image: "https://images.unsplash.com/photo-1614887410788-e158d6efb3be?w=400",
    savedDate: "2026-05-12"
  },
  {
    id: 2,
    name: "Sen Đá",
    image: "https://images.unsplash.com/photo-1614425467998-8a7249179a53?w=400",
    savedDate: "2026-05-08"
  },
  {
    id: 3,
    name: "Kim Tiền",
    image: "https://images.unsplash.com/photo-1611383856597-aae8f0cfd9e6?w=400",
    savedDate: "2026-05-01"
  }
];

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM"
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Tài khoản của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và lịch sử mua hàng
          </p>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 overflow-hidden border-2 border-green-100">
            <div className="h-32 bg-gradient-to-r from-primary to-green-600" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src="/avatar.jpg" />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-green-600 text-white">
                      {profileData.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white border-2 border-primary shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 mt-4 md:mt-0">
                  <h2 className="text-2xl font-bold mb-1">{profileData.fullName}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Thành viên
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Tham gia 05/2026
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Cây yêu thích
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Thông tin cá nhân</CardTitle>
                      <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => setIsEditing(false)} variant="outline">
                          Hủy
                        </Button>
                        <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-primary to-green-600">
                          Lưu
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value
                            })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value
                            })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="bg-gradient-to-r from-primary to-green-600">
                      Đổi mật khẩu
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {mockOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-semibold">{order.id}</span>
                          <Badge variant={order.status === "Đã giao" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {order.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {order.items} sản phẩm
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Tổng tiền</p>
                          <p className="text-xl font-bold text-primary">{order.total}</p>
                        </div>
                        <Button variant="outline">Xem chi tiết</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Saved Plants Tab */}
          <TabsContent value="saved" className="space-y-4">
            {mockSavedPlants.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Chưa có cây yêu thích"
                description="Bạn chưa lưu cây nào. Khám phá và lưu những cây cảnh yêu thích của bạn!"
                action={{
                  label: "Khám phá cây cảnh",
                  onClick: () => navigate("/browse")
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockSavedPlants.map((plant, index) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1">{plant.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Đã lưu: {plant.savedDate}
                        </p>
                        <Button className="w-full mt-4" variant="outline">
                          Xem chi tiết
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export { Profile };
