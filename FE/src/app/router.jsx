// router.jsx - Khởi tạo bộ định tuyến trình duyệt từ cấu hình route của ứng dụng
import { createBrowserRouter } from "react-router";
import { routeTree } from "@/app/routes";
const router = createBrowserRouter(routeTree);
export {
  router
};
