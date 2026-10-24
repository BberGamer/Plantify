import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

function ChipRow({ title, items, selected, onSelect }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {items.map((it) => {
          const isActive = selected === it.key;
          return (
            <TouchableOpacity
              key={it.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(it.key)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={it.icon}
                size={13}
                color={isActive ? garden.white : garden.moss}
              />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {it.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
            returnKeyType="search"
            accessibilityLabel="Tìm kiếm người dùng"
          />
          {search?.length > 0 && (
            <TouchableOpacity
              onPress={onSearchClear}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Xóa từ khóa"
            >
              <Ionicons name="close-circle" size={18} color={garden.muted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={onSearchSubmit}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Tìm"
        >
          <Ionicons name="arrow-forward" size={20} color={garden.white} />
        </TouchableOpacity>
      </View>

      <ChipRow
        title="Vai trò"
        items={USER_ROLES}
        selected={selectedRole}
        onSelect={onSelectRole}
      />
      <ChipRow
        title="Trạng thái"
        items={USER_STATUSES}
        selected={selectedStatus}
        onSelect={onSelectStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -22,
    paddingBottom: 4,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: garden.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: garden.line,
    shadowColor: garden.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: garden.ink,
    marginLeft: 8,
    paddingVertical: 0,
  },
  searchBtn: {
    marginLeft: 10,
    backgroundColor: garden.sprout,
    width: 48,
    height: 48,
    borderTopLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: garden.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingVertical: 4,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: garden.inkSoft,
    width: 72,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: garden.white,
    borderWidth: 1,
    borderColor: garden.line,
    marginRight: 8,
    gap: 5,
  },
  chipActive: {
    backgroundColor: garden.forest,
    borderColor: garden.forest,
  },
  chipText: {
    fontSize: 13,
    color: garden.inkSoft,
    fontWeight: "500",
  },
  chipTextActive: {
    color: garden.white,
    fontWeight: "600",
  },
});
