import BottomActionBar from "../common/BottomActionBar";
// PlantDetailActions.js - Khối giao diện PlantDetailActions.

import { StyleSheet, TouchableOpacity } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";


export default function PlantDetailActions({ onAdd }) {
  return (
    <BottomActionBar style={{ width: "100%", maxWidth: 760, alignSelf: "center" }}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={onAdd}
        activeOpacity={0.88}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.addBtnText}>Thêm vào vườn cây</Text>
      </TouchableOpacity>
    </BottomActionBar>
  );
}

const styles = StyleSheet.create({
  // Bottom bar
  bottomBar: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    elevation: 0,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0,
    shadowRadius: 6,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
