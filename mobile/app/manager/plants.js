import LoadingState from "../../src/components/common/LoadingState";
import { componentStyles } from "../../src/theme/componentStyles";
import { radius } from "../../src/theme";
// plants.js - Ghép giao diện quản lý cây từ hook và các component.

import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import useManagerPlants from "../../src/hooks/useManagerPlants";
import ListPagination from "../../src/components/common/ListPagination";
import ListError from "../../src/components/common/ListError";
import {
  PlantCard,
  PlantDeleteModal,
  PlantEmptyState,
  PlantFormModal,
  PlantHeader,
  PlantSearchBar,
} from "../../src/components/manager/plants";

export default function ManagerPlantsScreen() {
  const manager = useManagerPlants();
  const busy = manager.saving || manager.deleting;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <PlantHeader count={manager.plants.length} total={manager.total} />
      <PlantSearchBar value={manager.search} onChange={manager.changeSearch} />
      {!!manager.listError && (
        <ListError
          message={manager.listError}
          onRetry={manager.retry}
          busy={manager.loading || manager.refreshing || busy}
        />
      )}
      {manager.loading ? (
        <LoadingState style={{ flex: 1 }} message="Đang tải danh sách cây…" />
      ) : (
        <FlatList
          data={manager.plants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PlantCard
              item={item}
              disabled={busy}
              onEdit={manager.openEdit}
              onDelete={manager.requestDelete}
            />
          )}
          contentContainerStyle={[
            styles.list,
            manager.plants.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={manager.refreshing}
              onRefresh={manager.refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={
            <ListPagination
              pagination={manager.pagination}
              onPageChange={manager.changePage}
              disabled={manager.refreshing || busy || !!manager.listError}
            />
          }
          ListEmptyComponent={
            !manager.listError && <PlantEmptyState search={manager.search} />
          }
        />
      )}
      <Button
        mode="contained"
        icon="plus"
        onPress={manager.openCreate}
        disabled={busy}
        buttonColor={colors.primary}
        textColor={colors.white}
        style={[styles.addButton, componentStyles.buttonShape]}
        contentStyle={styles.addContent}
      >
        Thêm cây mới
      </Button>
      <PlantFormModal
        visible={manager.visible}
        editing={Boolean(manager.editing)}
        form={manager.form}
        categories={manager.categories}
        categoriesLoading={manager.categoriesLoading}
        categoriesError={manager.categoriesError}
        saving={manager.saving || manager.choosingPhoto}
        photo={manager.photo}
        onChoosePhoto={manager.choosePhoto}
        onRemovePhoto={manager.removePhoto}
        error={manager.formError}
        onClose={manager.closeForm}
        onSave={manager.save}
        onFieldChange={manager.changeField}
        onCareChange={manager.changeCareField}
        onRetryCategories={manager.retryCategories}
      />
      <PlantDeleteModal
        plant={manager.deleteTarget}
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
    paddingBottom: 16,
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
  },
  addButton: {
    width: "90%",
    maxWidth: 1000,
    alignSelf: "center",
    marginHorizontal: 0,
    marginTop: 6,
    marginBottom: 16,
    borderRadius: radius.input
  },
  addContent: {
    minHeight: 50
  }
});
