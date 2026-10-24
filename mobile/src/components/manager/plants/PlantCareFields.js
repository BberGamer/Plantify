// PlantCareFields.js - Giao diện PlantCareFields của màn hình quản lý cây.
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function PlantCareFields({ value, disabled, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Điều kiện chăm sóc</Text>
      <Text style={styles.fieldHint}>
        Nhập hướng dẫn chăm sóc phù hợp cho cây.
      </Text>
      <View style={styles.careCard}>
        {[
["light", "Ánh sáng", "sunny-outline", "Ví dụ: Ánh sáng gián tiếp"],
["water", "Tưới nước", "water-outline", "Ví dụ: 2–3 lần mỗi tuần"],
["temperature", "Nhiệt độ", "thermometer-outline", "Ví dụ: 20–35°C"],
["humidity", "Độ ẩm", "cloud-outline", "Ví dụ: Trung bình"],
        ].map(([key, label, icon, placeholder], index, fields) => (
<View
  key={key}
  style={[
    styles.careRow,
    index === fields.length - 1 && styles.careRowLast,
  ]}
>
  <View style={styles.careLabel}>
    <Ionicons name={icon} size={17} color={colors.primaryLight} />
    <Text style={styles.careLabelText}>{label}</Text>
  </View>
  <TextInput
    value={typeof value[key] === "string" ? value[key] : ""}
    onChangeText={(text) => onChange(key, text)}
    editable={!disabled}
    accessibilityLabel={label}
    placeholder={placeholder}
    placeholderTextColor={colors.textMuted}
    style={styles.careInput}
  />
</View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 15 },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },
  fieldHint: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: -3,
    marginBottom: 8,
    lineHeight: 16,
  },
  careCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  careRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  careRowLast: { borderBottomWidth: 0 },
  careLabel: { width: 104, flexDirection: "row", alignItems: "center", gap: 7 },
  careLabelText: { color: colors.textPrimary, fontSize: 12, fontWeight: "600" },
  careInput: {
    flex: 1,
    minHeight: 42,
    color: colors.textPrimary,
    fontSize: 12,
  },
});
