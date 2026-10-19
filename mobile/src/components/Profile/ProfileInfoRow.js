import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.divider]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

// Style riêng của component.
const styles = StyleSheet.create({
infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
divider: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightMint,
    marginRight: 12,
  },
rowContent: { flex: 1, minWidth: 0 },
fieldLabel: { fontSize: 12, color: colors.primaryText },
fieldValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryText,
  }
});
