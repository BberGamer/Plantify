import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import useManagerDiseases from "../../src/hooks/useManagerDiseases";
import {
  DiseaseCard,
  DiseaseEmptyState,
  DiseaseFilterBar,
  DiseaseHeader,
} from "../../src/components/manager/diseases";

export default function ManagerDiseasesScreen() {
  const manager = useManagerDiseases();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DiseaseHeader count={manager.diseases.length} total={manager.total} />
      <DiseaseFilterBar
        search={manager.search}
        status={manager.statusFilter}
        onSearchChange={manager.changeSearch}
        onStatusChange={manager.changeStatusFilter}
      />
      {!!manager.listError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText} accessibilityRole="alert">
            {manager.listError}
          </Text>
          <Button textColor={colors.primary} onPress={manager.retry}>
            Thử lại
          </Button>
        </View>
      )}
      {manager.loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách bệnh cây…</Text>
        </View>
      ) : (
        <FlatList
          data={manager.diseases}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <DiseaseCard item={item} />}
          contentContainerStyle={[
            styles.list,
            manager.diseases.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={manager.refreshing}
              onRefresh={manager.refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            !manager.listError && (
              <DiseaseEmptyState
                search={manager.search}
                filtered={Boolean(manager.statusFilter)}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: 18, paddingBottom: 18, gap: 12 },
  emptyList: { flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: colors.textSecondary, marginTop: 12 },
  errorBox: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.warmPeachBg,
    borderRadius: 12,
  },
  errorText: { color: colors.statusError },
});
