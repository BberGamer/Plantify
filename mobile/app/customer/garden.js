import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Navbar from "../../src/components/navigation/Navbar";
import ListError from "../../src/components/common/ListError";
import useGarden from "../../src/hooks/useGarden";
import { colors, radius, spacing, typography } from "../../src/theme";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "healthy", label: "Khỏe mạnh" },
  { id: "treatment", label: "Đang điều trị" },
];

function GardenCard({ plant, onOpenPlant, onOpenTreatment }) {
  const treatment = plant.active_treatment;
  return <View style={styles.card}>
    <View style={styles.plantRow}>
      {plant.display_image_url ? <Image source={{ uri: plant.display_image_url }} style={styles.thumbnail} /> : <View style={[styles.thumbnail, styles.placeholder]}><Ionicons name="leaf-outline" size={32} color={colors.primaryLight} /></View>}
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{plant.plant_nickname}</Text>
        <Text style={styles.metadata}>{plant.species_name || "Chưa xác định"} · {plant.placement_location || "Chưa có vị trí"}</Text>
        <View style={[styles.badge, treatment && styles.treatmentBadge]}>
          <View style={[styles.dot, treatment && styles.treatmentDot]} />
          <Text style={[styles.badgeText, treatment && styles.treatmentText]}>{treatment ? `Đang điều trị · Ngày ${treatment.current_day}/${treatment.duration_days}` : "Khỏe mạnh"}</Text>
        </View>
        <Text style={styles.task}><Text style={styles.taskPrefix}>{treatment ? "Tiếp theo: " : "Lịch chăm sóc: "}</Text>{treatment?.next_task?.title || "Chưa có công việc sắp tới"}</Text>
      </View>
    </View>
    <View style={styles.actions}>
      <Button mode="text" onPress={() => onOpenPlant(plant._id)}>Xem chi tiết</Button>
      {treatment && <Button mode="outlined" icon="clipboard-pulse-outline" onPress={() => onOpenTreatment(treatment._id)}>Xem điều trị</Button>}
    </View>
  </View>;
}

export default function GardenScreen() {
  const garden = useGarden();
  const router = useRouter();
  return <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
    <View style={styles.header}><View style={styles.headerSide} /><Text accessibilityRole="header" style={styles.title}>Vườn cây của tôi</Text><View style={styles.headerSide} /></View>
    <View style={styles.controls}>
      <View style={styles.filters}>{FILTERS.map((item) => <Pressable key={item.id} onPress={() => garden.selectHealthStatus(item.id)} accessibilityRole="button" accessibilityState={{ selected: garden.healthStatus === item.id }} style={[styles.filter, garden.healthStatus === item.id && styles.selectedFilter]}><Text style={[styles.filterLabel, garden.healthStatus === item.id && styles.selectedFilterLabel]}>{item.label}</Text></Pressable>)}</View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput value={garden.search} onChangeText={garden.changeSearch} placeholder="Tìm cây trong vườn của bạn..." placeholderTextColor={colors.textMuted} accessibilityLabel="Tìm cây trong vườn" style={styles.input} />
        {!!garden.search && <Pressable onPress={garden.clearSearch} accessibilityLabel="Xóa tìm kiếm" style={styles.clear}><Ionicons name="close-circle" size={20} color={colors.textSecondary} /></Pressable>}
      </View>
    </View>
    {garden.loading && !garden.refreshing ? <View style={styles.center}><ActivityIndicator size="large" /><Text>Đang tải vườn cây...</Text></View> : garden.error ? <View style={styles.center}><ListError message={garden.error} onRetry={garden.retry} busy={garden.loading} /></View> : <ScrollView style={styles.list} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={garden.refreshing} onRefresh={garden.refresh} colors={[colors.primary]} />}>
      <Text style={styles.count}>Tổng: {garden.pagination.total} cây trong vườn</Text>
      {garden.plants.map((plant) => <GardenCard key={plant._id} plant={plant} onOpenPlant={(plantId) => router.push({ pathname: "/customer/garden/PlantList", params: { plantId } })} onOpenTreatment={(treatmentId) => router.push({ pathname: "/customer/treatments/TreatmentList", params: { treatmentId } })} />)}
      {!garden.plants.length && <View style={styles.empty}><Ionicons name="leaf-outline" size={44} color={colors.primaryLight} /><Text style={styles.emptyTitle}>Chưa có cây phù hợp</Text><Text style={styles.emptyText}>Thử bộ lọc khác hoặc thêm cây vào vườn.</Text></View>}
    </ScrollView>}
    <Navbar />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: { minHeight: 60, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg },
  headerSide: { width: 44 },
  title: { ...typography.section, flex: 1, textAlign: "center", color: colors.textPrimary },
  controls: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  filter: { minHeight: 44, justifyContent: "center", borderRadius: radius.pill, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  selectedFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  selectedFilterLabel: { color: colors.white },
  search: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: spacing.md },
  input: { flex: 1, color: colors.textPrimary, paddingVertical: spacing.md },
  clear: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { width: "100%", maxWidth: 720, alignSelf: "center", padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  count: { ...typography.caption, color: colors.textSecondary },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: spacing.md, gap: spacing.md },
  plantRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  thumbnail: { width: 76, height: 92, borderRadius: radius.card, backgroundColor: colors.lightMint },
  placeholder: { alignItems: "center", justifyContent: "center" },
  plantInfo: { flex: 1, minWidth: 0, gap: spacing.xs },
  plantName: { ...typography.label, color: colors.textPrimary },
  metadata: { ...typography.caption, color: colors.textSecondary },
  badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, borderRadius: radius.sm, backgroundColor: colors.lightMint, paddingHorizontal: 8, paddingVertical: 5 },
  treatmentBadge: { backgroundColor: colors.warmPeachBg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.statusSuccess },
  treatmentDot: { backgroundColor: colors.statusWarning },
  badgeText: { ...typography.caption, color: colors.primaryLight, fontWeight: "700" },
  treatmentText: { color: "#946017" },
  task: { ...typography.caption, color: colors.textPrimary },
  taskPrefix: { color: colors.textSecondary },
  actions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: spacing.sm },
  empty: { alignItems: "center", padding: 48, gap: spacing.md },
  emptyTitle: { ...typography.section, color: colors.textPrimary },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
