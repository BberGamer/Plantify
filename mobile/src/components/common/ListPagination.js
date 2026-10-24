import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function ListPagination({
  pagination,
  onPageChange,
  disabled = false,
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;
  return (
    <View style={styles.row}>
      <Button
        disabled={disabled || !hasPrevPage}
        onPress={() => onPageChange(page - 1)}
        accessibilityLabel="Trang trước"
        textColor={colors.primary}
      >
        Trước
      </Button>
      <Text>
        Trang {page} / {totalPages}
      </Text>
      <Button
        disabled={disabled || !hasNextPage}
        onPress={() => onPageChange(page + 1)}
        accessibilityLabel="Trang sau"
        textColor={colors.primary}
      >
        Sau
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
});
