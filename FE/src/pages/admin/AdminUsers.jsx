import { Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

function AdminUsers() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Quản lý người dùng</h1>
      <EmptyState
        icon={Users}
        title="Danh sách người dùng"
        description="Module quản lý user sẽ được kết nối với API. Hiện tại hiển thị placeholder theo thiết kế Figma."
        action={{ label: "Thêm người dùng", onClick: () => void 0 }}
      />
    </div>
  );
}

export { AdminUsers };
