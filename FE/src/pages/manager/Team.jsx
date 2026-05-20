import { Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

function Team() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Đội ngũ</h1>
      <EmptyState
        icon={Users}
        title="Quản lý đội ngũ"
        description="Theo dõi hiệu suất nhân viên bán hàng và phân công khu vực."
      />
    </div>
  );
}

export { Team };
