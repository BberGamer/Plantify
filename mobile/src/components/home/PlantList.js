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
                      backgroundColor: "#EAF5EE",
                    },
                  ]}
                >
                  <Ionicons name="leaf-outline" size={40} color="#247855" />
                </View>
              )}
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      plant.health_status === "treatment"
                        ? "#F59E0B"
                        : "#22C55E",
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
    marginTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#183B2B",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#247855",
  },
  scrollList: {
    paddingRight: 8,
  },
  card: {
    width: 148,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#EBF0EC",
    overflow: "hidden",
    elevation: 2,
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  statusDot: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cardContent: {
    padding: 12,
  },
  plantName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#183B2B",
  },
  plantStatus: {
    fontSize: 11.5,
    color: "#6B7280",
    marginTop: 3,
  },
});
