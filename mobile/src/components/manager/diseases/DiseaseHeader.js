import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

export default function DiseaseHeader({ count, total }) {
  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>QUẢN LÝ</Text>
          <Text style={styles.title}>Bệnh cây</Text>
        </View>
        <View
          style={styles.countBadge}
          accessibilityLabel={`${total} bệnh cây`}
        >
          <Ionicons name="bug-outline" size={16} color={colors.primaryLight} />
          <Text style={styles.countText}>{total}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Hiển thị {count}/{total} bệnh cây
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 21,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 29,
    fontWeight: "800",
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 21,
    marginTop: 5,
    marginBottom: 15,
  },
  countBadge: {
    minWidth: 48,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.lightMint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  countText: { color: colors.primaryLight, fontSize: 15, fontWeight: "800" },
});
