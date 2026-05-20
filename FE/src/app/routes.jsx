import { jsx } from "react/jsx-runtime";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { ROUTES } from "@/lib/constants";
import { Home } from "@/pages/guest/Home";
import { Browse } from "@/pages/guest/Browse";
import { PlantDetail } from "@/pages/guest/PlantDetail";
import { Blog } from "@/pages/guest/Blog";
import { Shop } from "@/pages/guest/Shop";
import { ProductDetail } from "@/pages/guest/ProductDetail";
import { AIDoctor } from "@/pages/guest/AIDoctor";
import { KnowledgeGraph } from "@/pages/guest/KnowledgeGraph";
import { Login } from "@/pages/guest/Login";
import { Register } from "@/pages/guest/Register";
import { ForgotPassword } from "@/pages/guest/ForgotPassword";
import { Unauthorized } from "@/pages/guest/Unauthorized";
import { Profile } from "@/pages/customer/Profile";
import { Settings } from "@/pages/customer/Settings";
import { Cart } from "@/pages/customer/Cart";
import { MyShop } from "@/pages/sales/MyShop";
import { AddProduct } from "@/pages/sales/AddProduct";
import { Dashboard } from "@/pages/manager/Dashboard";
import { Team } from "@/pages/manager/Team";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";
const publicChildRoutes = [
  { index: true, element: /* @__PURE__ */ jsx(Home, {}) },
  { path: "browse", element: /* @__PURE__ */ jsx(Browse, {}) },
  { path: "plant/:id", element: /* @__PURE__ */ jsx(PlantDetail, {}) },
  { path: "blog", element: /* @__PURE__ */ jsx(Blog, {}) },
  { path: "marketplace", element: /* @__PURE__ */ jsx(Shop, {}) },
  { path: "product/:id", element: /* @__PURE__ */ jsx(ProductDetail, {}) },
  { path: "ai-doctor", element: /* @__PURE__ */ jsx(AIDoctor, {}) },
  { path: "knowledge-graph", element: /* @__PURE__ */ jsx(KnowledgeGraph, {}) },
  { path: "profile", element: /* @__PURE__ */ jsx(Profile, {}) },
  { path: "settings", element: /* @__PURE__ */ jsx(Settings, {}) },
  { path: "cart", element: /* @__PURE__ */ jsx(Cart, {}) },
  { path: "unauthorized", element: /* @__PURE__ */ jsx(Unauthorized, {}) }
];
const appChildRoutes = [
  { path: "my-shop", element: /* @__PURE__ */ jsx(MyShop, {}) },
  { path: "my-shop/add-product", element: /* @__PURE__ */ jsx(AddProduct, {}) },
  { path: "dashboard", element: /* @__PURE__ */ jsx(Dashboard, {}) },
  { path: "dashboard/team", element: /* @__PURE__ */ jsx(Team, {}) },
  { path: "admin", element: /* @__PURE__ */ jsx(AdminDashboard, {}) },
  { path: "admin/users", element: /* @__PURE__ */ jsx(AdminUsers, {}) }
];
const authChildRoutes = [
  { path: "login", element: /* @__PURE__ */ jsx(Login, {}) },
  { path: "register", element: /* @__PURE__ */ jsx(Register, {}) },
  { path: "forgot-password", element: /* @__PURE__ */ jsx(ForgotPassword, {}) }
];
const routeTree = [
  {
    path: ROUTES.home,
    element: /* @__PURE__ */ jsx(PublicLayout, {}),
    children: publicChildRoutes
  },
  {
    element: /* @__PURE__ */ jsx(AppLayout, {}),
    children: appChildRoutes
  },
  {
    element: /* @__PURE__ */ jsx(AuthLayout, {}),
    children: authChildRoutes
  }
];
export {
  appChildRoutes,
  authChildRoutes,
  publicChildRoutes,
  routeTree
};
