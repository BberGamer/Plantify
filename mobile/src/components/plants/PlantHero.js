// PlantHero.js - Khối giao diện PlantHero.

import { View, StyleSheet } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import PlantImage from "./PlantImage";

export default function PlantHero({ plant }) {
  const categoryName = plant.category_id?.category_name || "";

  return (
    <View style={styles.heroWrapper}>
      <PlantImage
        uri={plant.plant_image}
        style={styles.heroImage}
        accessibilityLabel={`Ảnh ${plant.common_name}`}
      />
      {categoryName ? (
        <View style={styles.heroCategoryChip}>
          <Ionicons name="pricetag-outline" size={12} color="#FFFFFF" />
          <Text style={styles.heroCategoryText}>{categoryName}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Hero
  heroWrapper: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroCategoryChip: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,77,55,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  heroCategoryText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
});
