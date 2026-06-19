import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const roleOptions = [
  { value: "all", label: "Tất cả" },
  { value: "admin", label: "Admin" },
  { value: "business manager", label: "Business Manager" },
  { value: "content manager", label: "Content Manager" },
  { value: "customer", label: "Khách hàng" }
];

function AdminUsersFilters({ searchTerm, onSearchChange, roleFilter, onRoleFilterChange }) {
  return (
    <section className="admin-users-filters">
      <div className="admin-users-filters-inner">
        <div className="admin-users-search">
          <Search className="admin-users-search-icon" />
          <Input
            placeholder="Tìm theo họ và tên"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="admin-users-search-input"
          />
        </div>

        <div className="admin-users-role-filters">
          {roleOptions.map((option) => {
            const isActive = roleFilter === option.value;

            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "outline"}
                onClick={() => onRoleFilterChange(option.value)}
                className={isActive ? "admin-users-role-filter admin-users-role-filter--active" : "admin-users-role-filter admin-users-role-filter--inactive"}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { AdminUsersFilters };
