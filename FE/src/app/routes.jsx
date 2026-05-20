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
  { index: true, element: <Home /> },
  { path: "browse", element: <Browse /> },
  { path: "plant/:id", element: <PlantDetail /> },
  { path: "blog", element: <Blog /> },
  { path: "marketplace", element: <Shop /> },
  { path: "product/:id", element: <ProductDetail /> },
  { path: "ai-doctor", element: <AIDoctor /> },
  { path: "knowledge-graph", element: <KnowledgeGraph /> },
  { path: "profile", element: <Profile /> },
  { path: "settings", element: <Settings /> },
  { path: "cart", element: <Cart /> },
  { path: "unauthorized", element: <Unauthorized /> }
];

const appChildRoutes = [
  { path: "my-shop", element: <MyShop /> },
  { path: "my-shop/add-product", element: <AddProduct /> },
  { path: "dashboard", element: <Dashboard /> },
  { path: "dashboard/team", element: <Team /> },
  { path: "admin", element: <AdminDashboard /> },
  { path: "admin/users", element: <AdminUsers /> }
];

const authChildRoutes = [
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "forgot-password", element: <ForgotPassword /> }
];

const routeTree = [
  {
    path: ROUTES.home,
    element: <PublicLayout />,
    children: publicChildRoutes
  },
  {
    element: <AppLayout />,
    children: appChildRoutes
  },
  {
    element: <AuthLayout />,
    children: authChildRoutes
  }
];

export { appChildRoutes, authChildRoutes, publicChildRoutes, routeTree };
