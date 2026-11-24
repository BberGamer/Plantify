import PlantImage from "../../plants/PlantImage";
import { radius } from "../../../theme";
// PlantCard.js - Giao diện PlantCard của màn hình quản lý cây.
import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function PlantCard({ item, disabled, onEdit, onDelete }) {
  const imageUri =
    typeof item.plant_image === "string" ? item.plant_image.trim() : "";
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <PlantImage uri={imageUri} style={styles.leafIcon} accessibilityLabel={`Ảnh ${item.common_name}`} />
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
    borderRadius: radius.card,
    padding: 16
  },
  cardTop: {
    gap: 8,
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start"
  },
  leafIcon: {
    width: 43,
    height: 43,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.lightMint,
    justifyContent: "center",
    alignItems: "center"
  },
  thumbnail: {
    width: "100%",
    height: "100%"
  },
  plantInfo: {
    minWidth: 140,
    flex: 1,
    paddingHorizontal: 11
  },
  commonName: {
    lineHeight: 24,
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700"
  },
  scientificName: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 2
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  published: {
    backgroundColor: colors.lightMint
  },
  draft: {
    backgroundColor: colors.borderLight
  },
  badgeText: {
    color: colors.primaryLight,
    textTransform: "none",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800"
  },
  draftText: {
    color: colors.textSecondary
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    marginTop: 13,
    paddingTop: 11,
    gap: 12
  },
  editButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmPeachBg,
    borderRadius: radius.input
  }
});
