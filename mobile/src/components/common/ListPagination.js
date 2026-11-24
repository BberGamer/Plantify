import { componentStyles } from "../../theme/componentStyles";
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
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
        disabled={disabled || !hasPrevPage}
        onPress={() => onPageChange(page - 1)}
        accessibilityLabel="Trang trước"
        textColor={colors.primary}
      >
        Trước
      </Button>
      <Text accessibilityLiveRegion="polite" style={styles.page}>
        Trang {page} / {totalPages}
      </Text>
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
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
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12
  },
  page: {
    color: colors.textSecondary,
    fontSize: 13,
    flexShrink: 1,
    textAlign: "center"
  }
});
