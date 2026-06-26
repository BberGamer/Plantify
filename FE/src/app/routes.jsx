/**
 * routes.jsx - Định nghĩa cấu trúc routing cho ứng dụng Plantify
 * 3 layout chính: Public (khách), Auth (đăng nhập), App (người dùng đã login)
 */

// ============================================================
// Layout Components
// ============================================================
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ManagerLayout from "@/components/layout/ManagerLayout";

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
import { AddressBook } from "@/pages/customer/AddressBook";
import { Settings } from "@/pages/customer/Settings";
import { Cart } from "@/pages/customer/Cart";
import { Checkout } from "@/pages/customer/Checkout";
import { MyPosts } from "@/pages/customer/MyPosts";





// ============================================================
// Manager Pages (Người dùng đã đăng nhập - vai trò Manager)
// ============================================================
import { Dashboard } from "@/pages/BusinessManager/Dashboard";
import { Team } from "@/pages/BusinessManager/Team";
import { ManageCategories as ManageProductCategories } from "@/pages/BusinessManager/ManageCategories";
import { ManageProducts } from "@/pages/BusinessManager/ManageProducts";
import { ProductDetail as BusinessProductDetail } from "@/pages/BusinessManager/ProductDetail";
import { ManagePlants } from "@/pages/ContentManager/ManagePlants";
import { ManageCategories } from "@/pages/ContentManager/ManageCategories";
import { ManageReports } from "@/pages/ContentManager/ManageReports";
import { ManageCareGuides } from "@/pages/ContentManager/ManageCareGuides";
import { ManageDiseases } from "@/pages/ContentManager/ManageDiseases";
import { PlantDetail as PlantDetailManager } from "@/pages/ContentManager/PlantDetail";

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
  { path: "profile", element: <Profile /> },
  { path: "address-book", element: <AddressBook /> },
  { path: "my-posts", element: <MyPosts /> },
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
];

const managerChildRoutes = [
  { path: "business", element: <Dashboard /> },
  { path: "business/team", element: <Team /> },
  { path: "business/products", element: <ManageProducts /> },
  { path: "business/products/:id", element: <BusinessProductDetail /> },
  { path: "business/categories", element: <ManageProductCategories /> },
  { path: "content/plants", element: <ManagePlants /> },
  { path: "content/plants/:id", element: <PlantDetailManager /> },
  { path: "content/care-guides", element: <ManageCareGuides /> },
  { path: "content/diseases", element: <ManageDiseases /> },
  { path: "content/categories", element: <ManageCategories /> },
  { path: "content/reports", element: <ManageReports /> },
];

const adminChildRoutes = [
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
    element: <ManagerLayout />,
    children: managerChildRoutes,
  },
  {
    element: <AdminLayout />,
    children: adminChildRoutes,
  },
  {
    element: <AuthLayout />,
    children: authChildRoutes,
  },
];

export {
  adminChildRoutes,
  appChildRoutes,
  authChildRoutes,
  managerChildRoutes,
  publicChildRoutes,
  routeTree
};
