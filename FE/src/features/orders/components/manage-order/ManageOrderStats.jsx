import { Clock3, PackageCheck, ShoppingBag } from "lucide-react";

import { DashboardCard } from "@/components/common/DashboardCard";

function ManageOrderStats({ orders }) {
  const stats = [
    {
      title: "Tổng đơn hàng",
      value: String(orders.length),
      icon: ShoppingBag,
    },
    {
      title: "Đơn chờ xử lý",
      value: String(orders.filter((order) => order.status === "pending").length),
      icon: Clock3,
    },
    {
      title: "Đơn hoàn thành",
      value: String(orders.filter((order) => order.status === "succeeded").length),
      icon: PackageCheck,
    },
  ];

  return (
    <section className="manage-order-stats">
      {stats.map((stat) => (
        <DashboardCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </section>
  );
}

export { ManageOrderStats };
