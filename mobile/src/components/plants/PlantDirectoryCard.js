// PlantDirectoryCard.js - Khối giao diện PlantDirectoryCard.

import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PlantDirectoryCard(
  {
    item,
    onOpen,
  },
) {
  const catName = item.category_id?.category_name || "";

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={() => onOpen(item._id)}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: item.plant_image,
          }}
          style={styles.cardImage}
          resizeMode="cover" />
        {catName ? <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {catName}
          </Text>
        </View> : null}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.common_name}
        </Text>
        <Text style={styles.cardScientific} numberOfLines={1}>
          {item.scientific_name}
        </Text>
        <View style={styles.cardFooter}>
          <Ionicons name="water-outline" size={12} color={colors.primaryLight} />
          <Text style={styles.cardWater} numberOfLines={1}>
            {item.care_requirements?.water || ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Card
  card: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#144D37",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  imageWrapper: {
    width: "100%",
    height: 148,
    position: "relative",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  // Badge goc tren ben PHAI
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(20,77,55,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: "80%",
  },

  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  cardContent: {
    padding: 11,
  },

  cardName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 19,
  },

  cardScientific: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: "italic",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },

  cardWater: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: "600",
    flex: 1,
  },
});
