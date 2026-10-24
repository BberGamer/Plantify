// PlantHeader.js - Giao diện PlantHeader của màn hình quản lý cây.
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../../theme/colors";

export default function PlantHeader({ count, total }) {
  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>QUẢN LÝ</Text>
          <Text style={styles.title}>Cây trồng</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{total}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Hiển thị {count}/{total} cây trồng
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
    marginBottom: 17,
  },
  countBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.lightMint,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { color: colors.primaryLight, fontSize: 15, fontWeight: "800" },
});
