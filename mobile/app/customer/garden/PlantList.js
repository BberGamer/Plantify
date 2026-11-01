import { Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TreatmentHeader from "../../../src/components/treatments/TreatmentHeader";
import ListError from "../../../src/components/common/ListError";
import useGardenPlant from "../../../src/hooks/useGardenPlant";
import { colors, radius, spacing, typography } from "../../../src/theme";

export default function PlantListScreen() {
  const { plantId: routePlantId } = useLocalSearchParams();
  const plantId = typeof routePlantId === "string" ? routePlantId : "";
  const detail = useGardenPlant(plantId);
  const router = useRouter();
  const plant = detail.plant;
  return <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <TreatmentHeader title="Chi tiết cây trong vườn" onBack={() => router.back()} />
    {detail.loading ? <View style={styles.center}><ActivityIndicator size="large" /><Text>Đang tải thông tin cây...</Text></View> : detail.error || !plant ? <View style={styles.center}><ListError message={detail.error || "Không tìm thấy cây."} onRetry={detail.retry} /></View> : <ScrollView contentContainerStyle={styles.content}>
      {plant.display_image_url ? <Image source={{ uri: plant.display_image_url }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Ionicons name="leaf-outline" size={48} color={colors.primaryLight} /></View>}
      <View style={styles.card}>
        <Text style={styles.title}>{plant.plant_nickname}</Text>
        <Text style={styles.body}>{plant.species_name || "Chưa xác định loài"}</Text>
        <Text style={styles.body}>{plant.placement_location || "Chưa có vị trí đặt cây"}</Text>
      </View>
      {plant.active_treatment ? <View style={styles.treatment}>
        <Text style={styles.sectionTitle}>Đang điều trị</Text>
        <Text style={styles.body}>Ngày {plant.active_treatment.current_day}/{plant.active_treatment.duration_days}</Text>
        <Text style={styles.body}>{plant.active_treatment.completed_tasks}/{plant.active_treatment.total_tasks} công việc đã hoàn thành</Text>
        <Button mode="contained" onPress={() => router.push({ pathname: "/customer/treatments/TreatmentList", params: { treatmentId: plant.active_treatment._id } })}>Xem tiến độ điều trị</Button>
      </View> : <View style={styles.card}><Text style={styles.sectionTitle}>Không có đợt điều trị hoạt động</Text><Text style={styles.body}>Cây hiện không áp dụng phác đồ điều trị.</Text></View>}
    </ScrollView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: spacing.lg, gap: spacing.lg },
  image: { width: "100%", aspectRatio: 1.5, borderRadius: radius.card, backgroundColor: colors.lightMint },
  placeholder: { alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm },
  treatment: { backgroundColor: colors.warmPeachBg, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.textPrimary },
  sectionTitle: { ...typography.section, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
});
