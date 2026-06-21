// constants.js
// Route paths va cau hinh dieu huong theo vai tro.
import {
  BarChart3,
  BookOpen,
  Home,
  LayoutDashboard,
  Network,
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
  myPosts: "/my-posts",
  settings: "/settings",
  cart: "/cart",
  checkout: "/checkout",
  dashboard: "/dashboard",
  contentDashboard: "/content/plants",
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
  { path: "/blog", label: "Blog", icon: BookOpen, roles: ["guest"] }
];

const ROLE_SIDEBAR_NAV = {
  customer: [
    { path: "/profile", label: "Hồ sơ", icon: User, roles: ["customer"] },
    { path: "/my-posts", label: "Bài viết của tôi", icon: BookOpen, roles: ["customer"] },
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
