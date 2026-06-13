/**
 * routes.jsx - Định nghĩa cấu trúc routing cho ứng dụng Plantify
 * 3 layout chính: Public (khách), Auth (đăng nhập), App (người dùng đã login)
 */

// ============================================================
// Layout Components
// ============================================================
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AppLayout } from "@/components/layout/AppLayout";

// ============================================================
// Constants
// ============================================================
import { ROUTES } from "@/lib/constants";

// ============================================================
// Guest Pages (Khách ghé thăm - không cần đăng nhập)
// ============================================================
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
import { RegisterVerifyOtp } from "@/pages/guest/RegisterVerifyOtp";
import { ForgotPassword } from "@/pages/guest/ForgotPassword";
import { ResetPassword } from "@/pages/guest/ResetPassword";
import { Unauthorized } from "@/pages/guest/Unauthorized";

// ============================================================
// Customer Pages (Người dùng đã đăng nhập - vai trò Customer)
// ============================================================
import { Profile } from "@/pages/customer/Profile";
import { Settings } from "@/pages/customer/Settings";
import { Cart } from "@/pages/customer/Cart";
import { Checkout } from "@/pages/customer/Checkout";

// ============================================================
// Sales Pages (Người dùng đã đăng nhập - vai trò Sales)
// ============================================================
import { MyShop } from "@/pages/sales/MyShop";
import { AddProduct } from "@/pages/sales/AddProduct";

// ============================================================
// Manager Pages (Người dùng đã đăng nhập - vai trò Manager)
// ============================================================
import { Dashboard } from "@/pages/manager/Dashboard";
import { Team } from "@/pages/manager/Team";

// ============================================================
// Admin Pages (Người dùng đã đăng nhập - vai trò Admin)
// ============================================================
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";

// ============================================================
// Route Definitions
// ============================================================

/**
 * Public Routes - Trang công khai, ai cũng xem được
 * Layout: PublicLayout
 */
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
  { path: "checkout", element: <Checkout /> },
  { path: "unauthorized", element: <Unauthorized /> },
];

/**
 * App Routes - Trang yêu cầu đăng nhập
 * Layout: AppLayout (có sidebar, header)
 * Role-based: tự động redirect nếu không có quyền
 */
const appChildRoutes = [
  { path: "my-shop", element: <MyShop /> },
  { path: "my-shop/add-product", element: <AddProduct /> },
  { path: "dashboard", element: <Dashboard /> },
  { path: "dashboard/team", element: <Team /> },
  { path: "admin", element: <AdminDashboard /> },
  { path: "admin/users", element: <AdminUsers /> },
];

/**
 * Auth Routes - Trang xác thực (đăng nhập/đăng ký)
 * Layout: AuthLayout (form centered)
 * Redirect: tự động chuyển đến dashboard nếu đã login
 */
const authChildRoutes = [
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "register/verify-otp", element: <RegisterVerifyOtp /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "reset-password", element: <ResetPassword /> },
];

// ============================================================
// Route Tree - Ghép layout với routes tương ứng
// ============================================================
const routeTree = [
  {
    path: ROUTES.home,
    element: <PublicLayout />,
    children: publicChildRoutes,
  },
  {
    element: <AppLayout />,
    children: appChildRoutes,
  },
  {
    element: <AuthLayout />,
    children: authChildRoutes,
  },
];

export { appChildRoutes, authChildRoutes, publicChildRoutes, routeTree };
