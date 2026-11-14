import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Divider, Menu } from "react-native-paper";
import { garden, ROLE_META } from "./theme";

export const USER_ROLES = [
  { key: "all", label: "Tất cả", icon: "grid-outline" },
  { key: "customer", label: ROLE_META.customer.label, icon: ROLE_META.customer.icon },
  { key: "manager", label: ROLE_META.manager.label, icon: ROLE_META.manager.icon },
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
  const filterCount = Number(selectedRole !== "all") + Number(selectedStatus !== "all");
  return (
    <View style={styles.container}>
      {/* SEARCH BAR - noi len tren header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={garden.moss} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email, SĐT..."
            placeholderTextColor={garden.muted}
            value={search}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Tìm kiếm người dùng"
          />
          {search?.length > 0 && (
            <TouchableOpacity
              onPress={onSearchClear}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Xóa từ khóa"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} color={garden.muted} />
            </TouchableOpacity>
          )}
        </View>

        <Menu
          visible={filterOpen}
          onDismiss={() => setFilterOpen(false)}
          anchorPosition="bottom"
          contentStyle={styles.filterMenu}
          anchor={
            <TouchableOpacity
              style={[styles.filterButton, filterCount > 0 && styles.filterButtonActive]}
              onPress={() => setFilterOpen(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Lọc người dùng: ${filterCount} bộ lọc đang áp dụng`}
              accessibilityState={{ expanded: filterOpen }}
            >
              <Ionicons name="options-outline" size={23} color={filterCount > 0 ? garden.white : garden.forest} />
              {filterCount > 0 ? <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{filterCount}</Text></View> : null}
            </TouchableOpacity>
          }
        >
          <Text style={styles.menuHeading}>VAI TRÒ</Text>
          {USER_ROLES.map(item => <Menu.Item
            key={`role-${item.key}`}
            title={item.label}
            trailingIcon={selectedRole === item.key ? "check" : undefined}
            titleStyle={selectedRole === item.key ? styles.selectedTitle : undefined}
            onPress={() => onSelectRole(item.key)}
          />)}
          <Divider />
          <Text style={styles.menuHeading}>TRẠNG THÁI</Text>
          {USER_STATUSES.map(item => <Menu.Item
            key={`status-${item.key}`}
            title={item.label}
            trailingIcon={selectedStatus === item.key ? "check" : undefined}
            titleStyle={selectedStatus === item.key ? styles.selectedTitle : undefined}
            onPress={() => onSelectStatus(item.key)}
          />)}
          {filterCount > 0 ? <Divider /> : null}
          {filterCount > 0 ? <Menu.Item title="Xóa bộ lọc" leadingIcon="filter-remove-outline" onPress={() => { onSelectRole("all"); onSelectStatus("all"); setFilterOpen(false); }} /> : null}
        </Menu>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: garden.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    borderWidth: 1,
    borderColor: garden.line,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: garden.ink,
    marginLeft: 8,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: garden.white, borderWidth: 1, borderColor: garden.line,
    justifyContent: "center", alignItems: "center",
  },
  filterButtonActive: { backgroundColor: garden.forest, borderColor: garden.forest },
  filterBadge: {
    position: "absolute", top: -4, right: -4, width: 18, height: 18,
    borderRadius: 9, backgroundColor: garden.mint, borderWidth: 1, borderColor: garden.white,
    alignItems: "center", justifyContent: "center",
  },
  filterBadgeText: { fontSize: 10, fontWeight: "700", color: garden.forest },
  filterMenu: { borderRadius: 16, backgroundColor: garden.white, minWidth: 230 },
  menuHeading: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, color: garden.muted, fontSize: 11, fontWeight: "700" },
  selectedTitle: { color: garden.forest, fontWeight: "700" },
});
