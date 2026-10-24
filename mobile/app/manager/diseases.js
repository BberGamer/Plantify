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
  DiseaseFormModal,
  DiseaseDeleteModal,
} from "../../src/components/manager/diseases";

export default function ManagerDiseasesScreen() {
  const manager = useManagerDiseases();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DiseaseHeader count={manager.diseases.length} total={manager.total} />
      <Button icon="plus" mode="contained" style={{ marginHorizontal: 18, marginBottom: 12 }} onPress={manager.openCreate} disabled={manager.saving || manager.deleting}>Thêm bệnh cây</Button>
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
          renderItem={({ item }) => <DiseaseCard item={item} onEdit={manager.openEdit} onDelete={manager.requestDelete} disabled={manager.saving || manager.deleting} />}
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
      <DiseaseFormModal visible={manager.visible} editing={manager.editing} form={manager.form} loading={manager.formLoading} ready={manager.formReady} saving={manager.saving} error={manager.formError} plants={manager.plantOptions} plantsLoading={manager.plantsLoading} plantsError={manager.plantsError} onClose={manager.closeForm} onSave={manager.save} onChange={manager.changeField} onTogglePlant={manager.togglePlant} onRetryPlants={manager.retryPlants} onRetryDetail={manager.retryEdit} />
      <DiseaseDeleteModal disease={manager.deleteTarget} deleting={manager.deleting} error={manager.deleteError} onClose={manager.closeDelete} onConfirm={manager.confirmDelete} />
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
