import { colors, radius } from "../../theme";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Card, Text } from "react-native-paper";

export default function PlantList({ plants }) {
  const router = useRouter();
  const openGarden = () => router.push("/customer/garden");
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Danh sách cây</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openGarden}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>Xem thêm</Text>
        </TouchableOpacity>
      </View>

      {!plants.length && (
        <Text>
          Vườn của bạn chưa có cây. Thêm cây trong mục Vườn cây để bắt đầu.
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {plants.map((plant) => (
          <Card
            key={plant._id}
            onPress={() =>
              router.push({
                pathname: "/customer/garden/PlantList",
                params: { plantId: plant._id },
              })
            }
            mode="contained"
            style={styles.card}
          >
            <View style={styles.imageWrapper}>
              {plant.display_image_url ? (
                <Card.Cover
                  source={{ uri: plant.display_image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.image,
                    {
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.lightMint,
                    },
                  ]}
                >
                  <Ionicons name="leaf-outline" size={40} color={colors.primaryLight} />
                </View>
              )}
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      plant.health_status === "treatment"
                        ? colors.statusWarning
                        : colors.statusSuccess,
                  },
                ]}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.plantName}>{plant.plant_nickname}</Text>
              <Text style={styles.plantStatus} numberOfLines={1}>
                {plant.health_status === "treatment"
                  ? "Đang điều trị"
                  : "Khỏe mạnh"}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24
  },
  headerRow: {
    flexWrap: "wrap",
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryLight
  },
  scrollList: {
    paddingRight: 8
  },
  card: {
    width: 176,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.card,
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    elevation: 0
  },
  imageWrapper: {
    width: "100%",
    height: 156,
    position: "relative"
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 0
  },
  statusDot: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  cardContent: {
    padding: 12
  },
  plantName: {
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  plantStatus: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 3
  }
});
