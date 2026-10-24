// index.js - Ghép giao diện danh mục cây và hook tìm kiếm.

import { View, StyleSheet, FlatList } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import Navbar from "../../src/components/home/Navbar";
import usePlantDirectory from "../../src/hooks/usePlantDirectory";
import PlantDirectoryHeader from "../../src/components/plants/PlantDirectoryHeader";
import PlantDirectoryFilters from "../../src/components/plants/PlantDirectoryFilters";
import PlantDirectoryCard from "../../src/components/plants/PlantDirectoryCard";
import ListPagination from "../../src/components/common/ListPagination";
export default function PlantDirectoryScreen() {
  const directory = usePlantDirectory();
  const router = useRouter();
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <PlantDirectoryHeader onBack={() => router.back()} />
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
          <Button onPress={directory.retryCategories}>Thử lại danh mục</Button>
        </View>
      )}
      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>{directory.total} loài cây</Text>
      </View>
      {directory.loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách cây...</Text>
        </View>
      ) : directory.error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText} accessibilityRole="alert">
            {directory.error}
          </Text>
          <Button onPress={directory.refetch}>Thử lại</Button>
        </View>
      ) : (
        <FlatList
          data={directory.plants}
          refreshing={directory.refreshing}
          onRefresh={directory.refresh}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PlantDirectoryCard
              item={item}
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
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Không tìm thấy cây nào</Text>
            </View>
          }
        />
      )}
      <Navbar />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAF9",
  },
  // Result row
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  resultCount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  // Grid
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  // States
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    color: colors.statusError,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "600",
  },
});
