import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ManagerDiseasesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.eyebrow}>QUẢN LÝ</Text>
      <Text style={styles.title}>Bệnh cây</Text>
      <View style={styles.empty}>
        <View style={styles.icon}>
          <Ionicons name="bug-outline" size={29} color="#28744C" />
        </View>
        <Text style={styles.heading}>Quản lý bệnh cây</Text>
        <Text style={styles.body}>
          Chưa có dữ liệu bệnh cây.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 22, paddingTop: 24, backgroundColor: "#F7F9F7" },
  eyebrow: {
    color: "#7D8B80",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: { color: "#183B2B", fontSize: 29, fontWeight: "800", marginTop: 4 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  icon: {
    height: 58,
    width: 58,
    borderRadius: 19,
    backgroundColor: "#E7F3EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heading: { color: "#26372B", fontWeight: "800", fontSize: 17 },
  body: {
    color: "#849087",
    textAlign: "center",
    lineHeight: 21,
    fontSize: 13,
    marginTop: 8,
  },
});
