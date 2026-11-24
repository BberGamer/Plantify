import { componentStyles } from "../../theme/componentStyles";
import { radius } from "../../theme";
// PlantDirectoryCard.js - Khối giao diện PlantDirectoryCard.

import { View, StyleSheet, TouchableOpacity } from "react-native";

import { ActivityIndicator, Button, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import PlantImage from "./PlantImage";

export default function PlantDirectoryCard({
  item,
  onOpen,
  showFavorite = false,
  isFavorite = false,
  favoriteBusy = false,
  onToggleFavorite,
  onAddToGarden,
  style,
}) {
  const catName = item.category_id?.category_name || "";

  return (
    <View style={[styles.card, style]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onOpen(item._id)}
        accessibilityLabel={`Xem chi tiết ${item.common_name}`}
      >
        <View style={styles.imageWrapper}>
          <PlantImage
            uri={item.plant_image}
            style={styles.cardImage}
            accessibilityLabel={`Ảnh ${item.common_name}`}
          />
          {catName ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText} numberOfLines={1}>
                {catName}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.common_name}</Text>
          <Text style={styles.cardScientific}>{item.scientific_name}</Text>
          <View
            style={[
              styles.cardFooter,
              showFavorite && styles.footerWithFavorite,
            ]}
          >
            <Ionicons
              name="water-outline"
              size={12}
              color={colors.primaryLight}
            />
            <Text style={styles.cardWater} numberOfLines={1}>
              {item.care_requirements?.water || ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {showFavorite && (
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            onAddToGarden && styles.favoriteAboveAction,
          ]}
          disabled={favoriteBusy}
          accessibilityRole="button"
          accessibilityLabel={`${isFavorite ? "Bỏ yêu thích" : "Yêu thích"} ${item.common_name}`}
          accessibilityState={{
            disabled: favoriteBusy,
            selected: isFavorite,
            busy: favoriteBusy,
          }}
          onPress={() => onToggleFavorite(item._id)}
        >
          {favoriteBusy ? (
            <ActivityIndicator size={20} color={colors.primary} />
          ) : (
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.statusError : colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      )}
      {onAddToGarden && (
        <Button
          style={componentStyles.buttonShape}
          contentStyle={componentStyles.button}
          icon="plus"
          compact
          onPress={() => onAddToGarden(item._id)}
        >
          Thêm vào vườn
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteAboveAction: {
    bottom: 40,
  },
  footerWithFavorite: {
    paddingRight: 36,
    minHeight: 22,
  },
  // Card
  card: {
    width: "48.5%",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    elevation: 0,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 6,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1.6,
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
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cardContent: {
    padding: 11,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 24,
  },
  cardScientific: {
    fontSize: 13,
    lineHeight: 20,
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
    fontSize: 13,
    lineHeight: 20,
    color: colors.primaryLight,
    fontWeight: "600",
    flex: 1,
  },
});
