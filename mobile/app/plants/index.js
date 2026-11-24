import ActionNoticeDialog from "../../src/components/common/ActionNoticeDialog";
import EmptyState from "../../src/components/common/EmptyState";
import LoadingState from "../../src/components/common/LoadingState";
import { componentStyles } from "../../src/theme/componentStyles";
// index.js - Ghép giao diện danh mục cây và hook tìm kiếm.

import { View, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import Navbar from "../../src/components/navigation/Navbar";
import usePlantDirectory from "../../src/hooks/usePlantDirectory";
import useFavoriteActions from "../../src/hooks/useFavoriteActions";
import PlantDirectoryHeader from "../../src/components/plants/PlantDirectoryHeader";
import PlantDirectoryFilters from "../../src/components/plants/PlantDirectoryFilters";
import PlantDirectoryCard from "../../src/components/plants/PlantDirectoryCard";
import ListPagination from "../../src/components/common/ListPagination";
import ListError from "../../src/components/common/ListError";
export default function PlantDirectoryScreen() {
  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 3 : width >= 600 ? 2 : 1;
  const cardStyle = { width: `${(100 - (columns - 1) * 2) / columns}%` };
  const directory = usePlantDirectory();
  const favorite = useFavoriteActions(directory.plants);
  const router = useRouter();
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <PlantDirectoryHeader onBack={() => router.replace("/customer/home")} />
      <PlantDirectoryFilters
        categories={directory.categories}
        activeCategoryId={directory.activeCatId}
        value={directory.inputValue}
        onSearchChange={directory.changeSearch}
        onSearchClear={directory.clearSearch}
        onSelectCategory={directory.selectCategory}
      />
      {directory.categoriesLoading && <Text>Đang tải danh mục…</Text>}
      {!!directory.categoriesError && (
        <View>
          <Text accessibilityRole="alert">{directory.categoriesError}</Text>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={directory.retryCategories}>Thử lại danh mục</Button>
        </View>
      )}
      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>{directory.total} loài cây</Text>
      </View>
      {!!favorite.error && <ListError message={favorite.error} onRetry={favorite.retry} />}
      {directory.loading ? (
        <LoadingState style={{ flex: 1 }} message="Đang tải danh sách cây..." />
      ) : directory.error ? (
        <View style={styles.centerBox}>
          <ListError
            message={directory.error}
            onRetry={directory.refetch}
            busy={directory.refreshing}
          />
        </View>
      ) : (
        <FlatList key={columns}
          style={styles.list}
          data={directory.plants}
          extraData={favorite}
          refreshing={directory.refreshing}
          onRefresh={directory.refresh}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PlantDirectoryCard style={cardStyle}
              item={item}
              showFavorite={favorite.enabled}
              isFavorite={favorite.favorites[item._id] === true}
              favoriteBusy={!!favorite.pending[item._id] || favorite.favorites[item._id] === undefined}
              onToggleFavorite={favorite.toggle}
              onOpen={(id) =>
                router.push({
                  pathname: "/plants/PlantList",
                  params: {
                    id,
                  },
                })
              }
            />
          )}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          ListFooterComponent={
            <ListPagination
              pagination={directory.pagination}
              onPageChange={directory.changePage}
              disabled={directory.refreshing}
            />
          }
          ListEmptyComponent={
            <EmptyState title="Không tìm thấy cây nào" icon="search-outline" />
          }
        />
      )}
      <ActionNoticeDialog {...favorite.noticeDialog} />
      <Navbar />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  list: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  // Result row
  resultRow: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6
  },
  resultCount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600"
  },
  // Grid
  grid: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12
  },
  // States
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "600"
  }
});
