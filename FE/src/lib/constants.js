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
  { path: "/", label: "Trang chu", icon: Home, roles: ["guest"] },
  { path: "/browse", label: "Kham pha", icon: BookOpen, roles: ["guest"] },
  {
    path: "/marketplace",
    label: "Gian hang",
    icon: Store,
    roles: ["guest"]
  },
  {
    path: "/ai-doctor",
    label: "Bac si AI",
    icon: Sparkles,
    roles: ["guest"]
  },
  {
    path: "/knowledge-graph",
    label: "Do thi tri thuc",
    icon: Network,
    roles: ["guest"]
  },
  { path: "/blog", label: "Blog", icon: BookOpen, roles: ["guest"] }
];

const ROLE_SIDEBAR_NAV = {
  customer: [
    { path: "/profile", label: "Ho so", icon: User, roles: ["customer"] },
    { path: "/my-posts", label: "Bai viet cua toi", icon: BookOpen, roles: ["customer"] },
    {
      path: "/cart",
      label: "Gio hang",
      icon: ShoppingCart,
      roles: ["customer"]
    },
    {
      path: "/settings",
      label: "Cai dat",
      icon: Settings,
      roles: ["customer"]
    }
  ],
  manager: [
    {
      path: "/dashboard",
      label: "Thong ke",
      icon: BarChart3,
      roles: ["manager"]
    },
    {
      path: "/dashboard/team",
      label: "Doi ngu",
      icon: Users,
      roles: ["manager"]
    }
  ],
  admin: [
    {
      path: "/admin",
      label: "Tong quan",
      icon: LayoutDashboard,
      roles: ["admin"]
    },
    {
      path: "/admin/users",
      label: "Nguoi dung",
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
