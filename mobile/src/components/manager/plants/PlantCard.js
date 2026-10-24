// PlantCard.js - Giao diện PlantCard của màn hình quản lý cây.
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function PlantCard({ item, disabled, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.leafIcon}>
          <Ionicons name="leaf" size={21} color={colors.primaryLight} />
        </View>
        <View style={styles.plantInfo}>
          <Text style={styles.commonName}>{item.common_name}</Text>
          <Text style={styles.scientificName}>{item.scientific_name}</Text>
          <Text style={styles.meta}>
            {item.botanical_family || "Chưa cập nhật họ thực vật"} ·{" "}
            {item.category_id?.category_name || "Chưa có danh mục"}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            item.is_published ? styles.published : styles.draft,
          ]}
        >
          <Text
            style={[styles.badgeText, !item.is_published && styles.draftText]}
          >
            {item.is_published ? "Đã đăng" : "Bản nháp"}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(item)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Sửa ${item.common_name}`}
        >
          <Ionicons name="create-outline" size={19} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Xóa ${item.common_name}`}
        >
          <Ionicons name="trash-outline" size={19} color={colors.statusError} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 13,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  leafIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: colors.lightMint,
    justifyContent: "center",
    alignItems: "center",
  },
  plantInfo: { flex: 1, paddingHorizontal: 11 },
  commonName: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  scientificName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  meta: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 },
  published: { backgroundColor: colors.lightMint },
  draft: { backgroundColor: colors.borderLight },
  badgeText: {
    color: colors.primaryLight,
    textTransform: "uppercase",
    fontSize: 8,
    fontWeight: "800",
  },
  draftText: { color: colors.textSecondary },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    marginTop: 13,
    paddingTop: 11,
    gap: 9,
  },
  editButton: {
    width: 38,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
  },
  deleteButton: {
    width: 38,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmPeachBg,
    borderRadius: 9,
  },
});
