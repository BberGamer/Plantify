import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import useManagerChats from "../../src/hooks/useManagerChats";
import ListPagination from "../../src/components/common/ListPagination";
import { colors, spacing } from "../../src/theme";

export default function ManagerChatsScreen() {
  const chat = useManagerChats();
  return <SafeAreaView style={styles.screen}>
    <Text variant="titleLarge">Chat người dùng</Text>
    <Text>{chat.pagination.total} lượt chat</Text>
    <Searchbar placeholder="Tìm câu hỏi hoặc câu trả lời" value={chat.search} onChangeText={chat.changeSearch} maxLength={200} />
    {!!chat.error && <View><Text>{chat.error}</Text><Button onPress={chat.retry}>Thử lại</Button></View>}
    {chat.loading ? <ActivityIndicator /> : <FlatList
      data={chat.items} keyExtractor={(item) => item._id} refreshing={chat.refreshing} onRefresh={chat.refresh}
      contentContainerStyle={styles.list}
      ListEmptyComponent={!chat.error && <Text>Chưa có lượt chat phù hợp.</Text>}
      renderItem={({ item }) => <Card><Card.Content>
        <Text variant="titleMedium">{item.user_name}</Text>
        <Text selectable>{item.question}</Text>
        <Text selectable>{item.answer}</Text>
        <Text>Nguồn trả lời: {item.answer_source === "rag" ? "Kiến thức Plantify + AI" : item.answer_source === "model" ? "AI" : "Dữ liệu cũ"}</Text>
        <Text>{new Date(item.created_at).toLocaleString("vi-VN")}</Text>
      </Card.Content></Card>}
      ListFooterComponent={<ListPagination pagination={chat.pagination} onPageChange={chat.load} disabled={chat.loading || chat.refreshing} />}
    />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
});
