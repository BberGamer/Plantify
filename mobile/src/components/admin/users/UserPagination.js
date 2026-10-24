import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { garden } from "./theme";

export default function UserPagination({
  pagination,
  onPageChange,
  disabled = false,
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <View style={styles.paginationBar}>
      <TouchableOpacity
        style={[
          styles.pageBtn,
          (disabled || !hasPrevPage) && styles.pageBtnDisabled,
        ]}
        disabled={disabled || !hasPrevPage}
        onPress={() => onPageChange(page - 1)}
        accessibilityRole="button"
        accessibilityLabel="Trang trước"
      >
        <Ionicons name="chevron-back" size={20} color={garden.forest} />
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Ionicons name="leaf" size={14} color={garden.sprout} />
        <Text style={styles.pageInfoText}>
          Trang <Text style={styles.pageInfoStrong}>{page}</Text> / {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.pageBtn,
          (disabled || !hasNextPage) && styles.pageBtnDisabled,
        ]}
        disabled={disabled || !hasNextPage}
        onPress={() => onPageChange(page + 1)}
        accessibilityRole="button"
        accessibilityLabel="Trang sau"
      >
        <Ionicons name="chevron-forward" size={20} color={garden.forest} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  pageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: garden.mint,
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: garden.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: garden.line,
  },
  pageInfoText: {
    fontSize: 13,
    color: garden.inkSoft,
  },
  pageInfoStrong: {
    fontWeight: "800",
    color: garden.forest,
  },
});
