import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
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
  const favorites = useFavoritePlants();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  if (!favorites.enabled) return null;
  return <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <View style={styles.header}>
      <IconButton icon="arrow-left" accessibilityLabel="Quay lại tài khoản" onPress={() => router.canGoBack() ? router.back() : router.replace("/customer/profile")} />
      <Text variant="titleLarge" style={styles.title}>Cây yêu thích của tôi</Text>
      <Button onPress={() => setEditing((value) => !value)}>{editing ? "Xong" : "Chỉnh sửa"}</Button>
    </View>
    <View style={styles.summary}>
      <Text variant="titleMedium">Đã lưu {favorites.pagination.total} cây</Text>
      <Button icon="leaf" onPress={() => router.push("/plants")}>Khám phá thêm cây</Button>
    </View>
    {editing && <Text style={styles.hint}>Bấm trái tim để bỏ cây khỏi danh sách yêu thích.</Text>}
    {!!favorites.actions.error && <ListError message={favorites.actions.error} onRetry={favorites.refresh} />}
    {favorites.loading ? <View style={styles.center}><ActivityIndicator /><Text>Đang tải cây yêu thích...</Text></View>
      : favorites.error ? <View style={styles.center}><ListError message={favorites.error} onRetry={favorites.retry} /></View>
      : <FlatList data={favorites.plants} extraData={favorites.actions} keyExtractor={(item) => item._id}
        numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.content}
        refreshing={favorites.refreshing} onRefresh={favorites.refresh}
        renderItem={({ item }) => <PlantDirectoryCard item={item} showFavorite={editing} isFavorite
          favoriteBusy={!!favorites.actions.pending[item._id]} onToggleFavorite={favorites.actions.toggle}
          onAddToGarden={(plantId) => router.push({ pathname: "/customer/garden/add", params: { plantId } })}
          onOpen={(id) => router.push({ pathname: "/plants/PlantList", params: { id } })} />}
        ListEmptyComponent={favorites.refreshing ? <ActivityIndicator /> : <View style={styles.center}><Text>Chưa có cây yêu thích.</Text><Text style={styles.hint}>Bấm nút tim trong danh mục cây để lưu vào đây.</Text></View>}
        ListFooterComponent={<ListPagination pagination={favorites.pagination} onPageChange={favorites.load} disabled={favorites.refreshing} />} />}
    <Navbar />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { flex: 1, color: colors.textPrimary, fontWeight: "700", paddingRight: 16 },
  summary: { padding: 12, gap: 8 },
  center: { flex: 1, padding: 28, gap: 12, justifyContent: "center", alignItems: "center" },
  hint: { textAlign: "center", color: colors.textSecondary },
  row: { justifyContent: "space-between", marginBottom: 12 },
  content: { padding: 12, paddingBottom: 32, flexGrow: 1 },
});
