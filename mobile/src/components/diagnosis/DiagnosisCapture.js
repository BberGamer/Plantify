import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography } from "../../theme";

export default function DiagnosisCapture() {
  return (
    <View style={styles.card}>
      <LinearGradient colors={["#203D32", "#10231D"]} style={styles.preview}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.leafHalo}>
            <Ionicons name="leaf-outline" size={70} color="#ABD6BB" />
          </View>
        </View>
      </LinearGradient>
      <View style={styles.controls}>
        <Pressable
          disabled
          accessibilityRole="button"
          accessibilityLabel="Chọn ảnh từ album"
          accessibilityState={{ disabled: true }}
          style={styles.control}
        >
          <View style={styles.albumIcon}>
            <Ionicons
              name="images-outline"
              size={25}
              color={colors.primaryLight}
            />
          </View>
          <Text style={styles.controlLabel}>Album ảnh</Text>
        </Pressable>
        <Pressable
          disabled
          accessibilityRole="button"
          accessibilityLabel="Chụp ảnh"
          accessibilityState={{ disabled: true }}
          style={styles.control}
        >
          <View style={styles.shutterRing}>
            <LinearGradient
              colors={["#42B986", colors.primaryLight]}
              style={styles.shutter}
            >
              <Ionicons name="camera" size={28} color={colors.white} />
            </LinearGradient>
          </View>
          <Text style={styles.shutterLabel}>Chụp ảnh</Text>
        </Pressable>
        <View style={styles.control} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: colors.white },
  preview: { alignItems: "center", padding: spacing.xl },
  frame: {
    width: "82%",
    maxWidth: 280,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF03",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#8CD5A9",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 18,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 18,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 18,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 18,
  },
  leafHalo: {
    width: "60%",
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8CD5A90D",
    borderWidth: 1,
    borderColor: "#8CD5A91A",
  },
  controls: { padding: spacing.xl, flexDirection: "row", alignItems: "center" },
  control: { flex: 1, alignItems: "center", gap: spacing.sm },
  albumIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightMint,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shutterRing: {
    padding: 4,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A8DCC0",
  },
  shutter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  controlLabel: { ...typography.caption, color: colors.textPrimary },
  shutterLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
});
