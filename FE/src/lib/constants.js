// constants.js
// Route paths, navigation theo vai trò
import {
  BarChart3,
  BookOpen,
  Home,
  LayoutDashboard,
  Network,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  User,
  Users
} from "lucide-react";
const ROUTES = {
  home: "/",
  browse: "/browse",
  plantDetail: (id) => `/plant/${id}`,
  marketplace: "/marketplace",
  productDetail: (id) => `/product/${id}`,
  aiDoctor: "/ai-doctor",
  knowledgeGraph: "/knowledge-graph",
  blog: "/blog",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  profile: "/profile",
  settings: "/settings",
  cart: "/cart",
  myShop: "/my-shop",
  addProduct: "/my-shop/add-product",
  dashboard: "/dashboard",
  admin: "/admin",
  adminUsers: "/admin/users",
  unauthorized: "/unauthorized"
};
const PUBLIC_NAV = [
  { path: "/", label: "Trang chủ", icon: Home, roles: ["guest"] },
  { path: "/browse", label: "Khám phá", icon: BookOpen, roles: ["guest"] },
  {
    path: "/marketplace",
    label: "Gian hàng",
    icon: Store,
    roles: ["guest"]
  },
  {
    path: "/ai-doctor",
    label: "Bác sĩ AI",
    icon: Sparkles,
    roles: ["guest"]
  },
  {
    path: "/knowledge-graph",
    label: "Đồ thị tri thức",
    icon: Network,
    roles: ["guest"]
  },
  { path: "/blog", label: "Blog", icon: BookOpen, roles: ["guest"] }
];
const ROLE_SIDEBAR_NAV = {
  customer: [
    { path: "/profile", label: "Hồ sơ", icon: User, roles: ["customer"] },
    {
      path: "/cart",
      label: "Giỏ hàng",
      icon: ShoppingCart,
      roles: ["customer"]
    },
    {
      path: "/settings",
      label: "Cài đặt",
      icon: Settings,
      roles: ["customer"]
    }
  ],
  sales: [
    {
      path: "/my-shop",
      label: "Gian hàng của tôi",
      icon: Store,
      roles: ["sales"]
    },
    {
      path: "/my-shop/add-product",
      label: "Thêm sản phẩm",
      icon: Package,
      roles: ["sales"]
    }
  ],
  manager: [
    {
      path: "/dashboard",
      label: "Thống kê",
      icon: BarChart3,
      roles: ["manager"]
    },
    {
      path: "/dashboard/team",
      label: "Đội ngũ",
      icon: Users,
      roles: ["manager"]
    }
  ],
  admin: [
    {
      path: "/admin",
      label: "Tổng quan",
      icon: LayoutDashboard,
      roles: ["admin"]
    },
    {
      path: "/admin/users",
      label: "Người dùng",
      icon: Users,
      roles: ["admin"]
    }
  ]
};
export {
  PUBLIC_NAV,
  ROLE_SIDEBAR_NAV,
  ROUTES
};
