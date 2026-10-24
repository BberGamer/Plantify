// PlantDetailActions.js - Khối giao diện PlantDetailActions.

import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDetailActions(
  {
    onAdd,
  },
) {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.88}>
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.addBtnText}>Thêm vào vườn cây</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    elevation: 4,
    shadowColor: colors.primary,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
