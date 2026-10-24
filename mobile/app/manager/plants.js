// plants.js - Ghép giao diện quản lý cây từ hook và các component.

import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách cây…</Text>
        </View>
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
        style={styles.addButton}
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
        saving={manager.saving}
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
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: 18, paddingBottom: 16, gap: 12 },
  emptyList: { flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: colors.textSecondary, marginTop: 12 },
  addButton: {
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 13,
  },
  addContent: { minHeight: 50 },
});
