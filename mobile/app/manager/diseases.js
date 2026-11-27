import LoadingState from "../../src/components/common/LoadingState";
import { componentStyles } from "../../src/theme/componentStyles";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import useManagerDiseases from "../../src/hooks/useManagerDiseases";
import ListError from "../../src/components/common/ListError";
import ListPagination from "../../src/components/common/ListPagination";
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
      <Button contentStyle={componentStyles.button}
        icon="plus"
        mode="contained"
        style={[{ marginHorizontal: 18, marginBottom: 12 }, componentStyles.buttonShape]}
        onPress={manager.openCreate}
        disabled={manager.saving || manager.deleting}
      >
        Thêm bệnh cây
      </Button>
      <DiseaseFilterBar
        search={manager.search}
        status={manager.statusFilter}
        onSearchChange={manager.changeSearch}
        onStatusChange={manager.changeStatusFilter}
      />
      {!!manager.listError && (
        <ListError
          message={manager.listError}
          onRetry={manager.retry}
          busy={
            manager.loading ||
            manager.refreshing ||
            manager.saving ||
            manager.deleting
          }
        />
      )}
      {manager.loading ? (
        <LoadingState style={{ flex: 1 }} message="Đang tải danh sách bệnh cây…" />
      ) : (
        <FlatList
          data={manager.diseases}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <DiseaseCard
              item={item}
              onEdit={manager.openEdit}
              onDelete={manager.requestDelete}
              disabled={manager.saving || manager.deleting}
            />
          )}
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
          ListFooterComponent={
            <ListPagination
              pagination={manager.pagination}
              onPageChange={manager.changePage}
              disabled={
                manager.refreshing || manager.saving || manager.deleting
              }
            />
          }
        />
      )}
      <DiseaseFormModal
        ai={manager.ai}
        visible={manager.visible}
        editing={manager.editing}
        form={manager.form}
        choosingPhoto={manager.choosingPhoto}
        loading={manager.formLoading}
        ready={manager.formReady}
        saving={manager.saving}
        error={manager.formError}
        plants={manager.plantOptions}
        plantsLoading={manager.plantsLoading}
        plantsError={manager.plantsError}
        onClose={manager.closeForm}
        onSave={manager.save}
        onChange={manager.changeField}
        onChoosePhoto={manager.choosePhoto}
        onTogglePlant={manager.togglePlant}
        onRetryPlants={manager.retryPlants}
        onRetryDetail={manager.retryEdit}
      />
      <DiseaseDeleteModal
        disease={manager.deleteTarget}
        deleting={manager.deleting}
        error={manager.deleteError}
        onClose={manager.closeDelete}
        onConfirm={manager.confirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  list: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 12
  },
  emptyList: {
    flexGrow: 1
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12
  }
});
