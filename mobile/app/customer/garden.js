import ScreenHeader from "../../src/components/common/ScreenHeader";
import EmptyState from "../../src/components/common/EmptyState";
import SearchField from "../../src/components/common/SearchField";
import {
  FilterMenuButton,
  filterStyles,
} from "../../src/components/common/FilterControls";
import { componentStyles } from "../../src/theme/componentStyles";
import { useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Button, Menu, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Navbar from "../../src/components/navigation/Navbar";
import ListPagination from "../../src/components/common/ListPagination";
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
  return (
    <View style={styles.card}>
      <View style={styles.plantRow}>
        {plant.display_image_url ? (
          <Image
            source={{ uri: plant.display_image_url }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <Ionicons
              name="leaf-outline"
              size={32}
              color={colors.primaryLight}
            />
          </View>
        )}
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{plant.plant_nickname}</Text>
          <Text style={styles.metadata}>
            {plant.species_name || "Chưa xác định"} ·{" "}
            {plant.placement_location || "Chưa có vị trí"}
          </Text>
          <View style={[styles.badge, treatment && styles.treatmentBadge]}>
            <View style={[styles.dot, treatment && styles.treatmentDot]} />
            <Text style={[styles.badgeText, treatment && styles.treatmentText]}>
              {treatment
                ? `Đang điều trị · Ngày ${treatment.current_day}/${treatment.duration_days}`
                : "Khỏe mạnh"}
            </Text>
          </View>
          <Text style={styles.task}>
            <Text style={styles.taskPrefix}>
              {treatment ? "Tiếp theo: " : "Lịch chăm sóc: "}
            </Text>
            {treatment?.next_task?.title || "Chưa có công việc sắp tới"}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          style={componentStyles.buttonShape}
          contentStyle={componentStyles.button}
          mode="text"
          onPress={() => onOpenPlant(plant._id)}
        >
          Xem chi tiết
        </Button>
        {treatment && (
          <Button
            style={componentStyles.buttonShape}
            contentStyle={componentStyles.button}
            mode="outlined"
            icon="clipboard-pulse-outline"
            onPress={() => onOpenTreatment(treatment._id)}
          >
            Xem điều trị
          </Button>
        )}
      </View>
    </View>
  );
}

export default function GardenScreen() {
  const garden = useGarden();
  const [filterOpen, setFilterOpen] = useState(false);
  const router = useRouter();
  const { addedPlant } = useLocalSearchParams();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScreenHeader title="Vườn cây của tôi" />
      <View style={styles.controls}>
        {!!addedPlant && (
          <Text accessibilityRole="alert">
            Đã thêm cây vào vườn thành công.
          </Text>
        )}
        <View style={styles.primaryActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/customer/garden/add")}
            style={({ pressed }) => [
              styles.actionButton,
              styles.addPlantButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={[styles.actionLabel, styles.addPlantLabel]}>
              Thêm cây
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/customer/care",
                params: { create: "1" },
              })
            }
            style={({ pressed }) => [
              styles.actionButton,
              styles.addScheduleButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.actionLabel}>Thêm lịch chăm sóc</Text>
          </Pressable>
        </View>
        <View style={filterStyles.toolbar}>
          <SearchField
            style={filterStyles.search}
            value={garden.search}
            onChangeText={garden.changeSearch}
            onClear={garden.clearSearch}
            placeholder="Tìm cây trong vườn…"
            accessibilityLabel="Tìm cây trong vườn"
          />
          <Menu
            visible={filterOpen}
            onDismiss={() => setFilterOpen(false)}
            anchorPosition="bottom"
            contentStyle={filterStyles.menu}
            anchor={
              <FilterMenuButton
                count={garden.healthStatus !== "all" ? 1 : 0}
                expanded={filterOpen}
                accessibilityLabel={`Lọc sức khỏe cây: ${FILTERS.find((item) => item.id === garden.healthStatus)?.label || "Tất cả"}`}
                onPress={() => setFilterOpen(true)}
              />
            }
          >
            {FILTERS.map((item) => (
              <Menu.Item
                key={item.id}
                title={item.label}
                leadingIcon={
                  item.id === "all"
                    ? "view-grid-outline"
                    : item.id === "healthy"
                      ? "leaf"
                      : "medical-bag"
                }
                trailingIcon={
                  garden.healthStatus === item.id ? "check" : undefined
                }
                titleStyle={
                  garden.healthStatus === item.id
                    ? filterStyles.menuSelectedTitle
                    : undefined
                }
                onPress={() => {
                  garden.selectHealthStatus(item.id);
                  setFilterOpen(false);
                }}
              />
            ))}
          </Menu>
        </View>
      </View>
      {garden.loading && !garden.refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Đang tải vườn cây...</Text>
        </View>
      ) : garden.error ? (
        <View style={styles.center}>
          <ListError
            message={garden.error}
            onRetry={garden.retry}
            busy={garden.loading}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={garden.refreshing}
              onRefresh={garden.refresh}
              colors={[colors.primary]}
            />
          }
        >
          <Text style={styles.count}>
            Tổng: {garden.pagination.total} cây trong vườn
          </Text>
          {garden.plants.map((plant) => (
            <GardenCard
              key={plant._id}
              plant={plant}
              onOpenPlant={(plantId) =>
                router.push({
                  pathname: "/customer/garden/PlantList",
                  params: { plantId },
                })
              }
              onOpenTreatment={(treatmentId) =>
                router.push({
                  pathname: "/customer/treatments/TreatmentList",
                  params: { treatmentId },
                })
              }
            />
          ))}
          <ListPagination
            pagination={garden.pagination}
            onPageChange={garden.changePage}
            disabled={garden.loading || garden.refreshing}
          />
          {!garden.plants.length && (
            <EmptyState
              title="Chưa có cây phù hợp"
              description="Thử bộ lọc khác hoặc thêm cây vào vườn."
            />
          )}
        </ScrollView>
      )}
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controls: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 20,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  primaryActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
  },
  addPlantButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  addScheduleButton: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  actionLabel: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  addPlantLabel: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.75,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 16,
    gap: spacing.md,
  },
  plantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  thumbnail: {
    width: 76,
    height: 92,
    borderRadius: radius.card,
    backgroundColor: colors.lightMint,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  plantInfo: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  plantName: {
    fontSize: 17,
    lineHeight: 24,
    ...typography.label,
    color: colors.textPrimary,
  },
  metadata: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badge: {
    flexShrink: 1,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.lightMint,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  treatmentBadge: {
    backgroundColor: colors.warmPeachBg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.statusSuccess,
  },
  treatmentDot: {
    backgroundColor: colors.statusWarning,
  },
  badgeText: {
    flexShrink: 1,
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: "700",
  },
  treatmentText: {
    color: colors.statusWarning,
  },
  task: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  taskPrefix: {
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  empty: {
    alignItems: "center",
    padding: 48,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.section,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
