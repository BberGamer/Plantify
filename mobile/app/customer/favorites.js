import EmptyState from "../../src/components/common/EmptyState";
import { componentStyles } from "../../src/theme/componentStyles";
import { useState } from "react";
import { FlatList, useWindowDimensions, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useFavoritePlants from "../../src/hooks/useFavoritePlants";
import PlantDirectoryCard from "../../src/components/plants/PlantDirectoryCard";
import ListError from "../../src/components/common/ListError";
import ListPagination from "../../src/components/common/ListPagination";
import Navbar from "../../src/components/navigation/Navbar";
import { colors } from "../../src/theme/colors";

export default function FavoritePlantsScreen() {
  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 3 : width >= 600 ? 2 : 1;
  const cardStyle = { width: `${(100 - (columns - 1) * 2) / columns}%` };
  const favorites = useFavoritePlants();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  if (!favorites.enabled) return null;
  return <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <View style={styles.header}>
      <IconButton icon="arrow-left" accessibilityLabel="Quay lại tài khoản" onPress={() => router.canGoBack() ? router.back() : router.replace("/customer/profile")} />
      <Text variant="titleLarge" style={styles.title}>Cây yêu thích của tôi</Text>
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={() => setEditing((value) => !value)}>{editing ? "Xong" : "Chỉnh sửa"}</Button>
    </View>
    <View style={styles.summary}>
      <Text variant="titleMedium">Đã lưu {favorites.pagination.total} cây</Text>
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} icon="leaf" onPress={() => router.push("/plants")}>Khám phá thêm cây</Button>
    </View>
    {editing && <Text style={styles.hint}>Bấm trái tim để bỏ cây khỏi danh sách yêu thích.</Text>}
    {!!favorites.actions.error && <ListError message={favorites.actions.error} onRetry={favorites.refresh} />}
    {favorites.loading ? <View style={styles.center}><ActivityIndicator /><Text>Đang tải cây yêu thích...</Text></View>
      : favorites.error ? <View style={styles.center}><ListError message={favorites.error} onRetry={favorites.retry} /></View>
      : <FlatList key={columns} data={favorites.plants} extraData={favorites.actions} keyExtractor={(item) => item._id}
        numColumns={columns} columnWrapperStyle={columns > 1 ? styles.row : undefined} contentContainerStyle={styles.content}
        refreshing={favorites.refreshing} onRefresh={favorites.refresh}
        renderItem={({ item }) => <PlantDirectoryCard style={cardStyle} item={item} showFavorite={editing} isFavorite
          favoriteBusy={!!favorites.actions.pending[item._id]} onToggleFavorite={favorites.actions.toggle}
          onAddToGarden={(plantId) => router.push({ pathname: "/customer/garden/add", params: { plantId } })}
          onOpen={(id) => router.push({ pathname: "/plants/PlantList", params: { id } })} />}
        ListEmptyComponent={favorites.refreshing ? <ActivityIndicator /> : <EmptyState icon="heart-outline" title="Chưa có cây yêu thích." description="Bấm nút tim trong danh mục cây để lưu vào đây." />}
        ListFooterComponent={<ListPagination pagination={favorites.pagination} onPageChange={favorites.load} disabled={favorites.refreshing} />} />}
    <Navbar />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    flex: 1,
    color: colors.textPrimary,
    fontWeight: "700",
    paddingRight: 16
  },
  summary: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    padding: 20,
    gap: 8
  },
  center: {
    flex: 1,
    padding: 28,
    gap: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  hint: {
    textAlign: "center",
    color: colors.textSecondary
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12
  },
  content: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    flexGrow: 1
  }
});
