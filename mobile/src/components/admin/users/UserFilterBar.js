import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import SearchField from "../../common/SearchField";
import { FilterMenuButton, filterStyles } from "../../common/FilterControls";
import { Divider, Menu } from "react-native-paper";
import { ROLE_META } from "./theme";

export const USER_ROLES = [
  { key: "all", label: "Tất cả", icon: "grid-outline" },
  {
    key: "customer",
    label: ROLE_META.customer.label,
    icon: ROLE_META.customer.icon,
  },
  {
    key: "manager",
    label: ROLE_META.manager.label,
    icon: ROLE_META.manager.icon,
  },
  { key: "admin", label: ROLE_META.admin.label, icon: ROLE_META.admin.icon },
];

export const USER_STATUSES = [
  { key: "all", label: "Tất cả", icon: "grid-outline" },
  { key: "true", label: "Hoạt động", icon: "water" },
  { key: "false", label: "Đã khóa", icon: "snow" },
];

export default function UserFilterBar({
  search,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  selectedRole,
  onSelectRole,
  selectedStatus,
  onSelectStatus,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterCount =
    Number(selectedRole !== "all") + Number(selectedStatus !== "all");
  return (
    <View style={styles.container}>
      {/* SEARCH BAR - noi len tren header */}
      <View style={styles.searchSection}>
        <SearchField style={filterStyles.search} value={search} onChangeText={onSearchChange}
          onClear={onSearchClear} onSubmitEditing={onSearchSubmit}
          placeholder="Tìm tên, email hoặc số điện thoại…" accessibilityLabel="Tìm kiếm người dùng" />

        <Menu
          visible={filterOpen}
          onDismiss={() => setFilterOpen(false)}
          anchorPosition="bottom"
          contentStyle={filterStyles.menu}
          anchor={<FilterMenuButton count={filterCount} expanded={filterOpen}
            onPress={() => setFilterOpen(true)} accessibilityLabel={`Lọc người dùng: ${filterCount} bộ lọc đang áp dụng`} />}
        >
          <Text style={filterStyles.menuHeading}>Vai trò</Text>
          {USER_ROLES.map((item) => (
            <Menu.Item
              key={`role-${item.key}`}
              title={item.label}
              trailingIcon={selectedRole === item.key ? "check" : undefined}
              titleStyle={
                selectedRole === item.key ? filterStyles.menuSelectedTitle : undefined
              }
              onPress={() => onSelectRole(item.key)}
            />
          ))}
          <Divider />
          <Text style={filterStyles.menuHeading}>Trạng thái</Text>
          {USER_STATUSES.map((item) => (
            <Menu.Item
              key={`status-${item.key}`}
              title={item.label}
              trailingIcon={selectedStatus === item.key ? "check" : undefined}
              titleStyle={
                selectedStatus === item.key ? filterStyles.menuSelectedTitle : undefined
              }
              onPress={() => onSelectStatus(item.key)}
            />
          ))}
          {filterCount > 0 ? <Divider /> : null}
          {filterCount > 0 ? (
            <Menu.Item
              title="Xóa bộ lọc"
              leadingIcon="filter-remove-outline"
              onPress={() => {
                onSelectRole("all");
                onSelectStatus("all");
                setFilterOpen(false);
              }}
            />
          ) : null}
        </Menu>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 4
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 6,
    gap: 10
  },

});
