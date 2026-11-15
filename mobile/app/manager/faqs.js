import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Dialog, Portal, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import useManagerFaqs from "../../src/hooks/useManagerFaqs";
import FaqFormModal from "../../src/components/manager/faqs/FaqFormModal";
import ListPagination from "../../src/components/common/ListPagination";
import { colors } from "../../src/theme/colors";

export default function ManagerFaqsScreen() {
  const manager = useManagerFaqs();
  return <SafeAreaView style={styles.screen} edges={["top"]}>
    <View style={styles.header}>
      <Text variant="titleLarge">Quản lý FAQ chat</Text>
      <Text>{manager.pagination.total} {manager.tab === "turns" ? "lượt chat người dùng" : "FAQ · Tiếng Việt"}</Text>
      <Button mode="contained" icon="plus" disabled={manager.busy} onPress={() => manager.open()}>Tạo FAQ</Button>
      <TextInput mode="outlined" label={manager.tab === "turns" ? "Tìm câu hỏi hoặc câu trả lời của người dùng" : "Tìm câu hỏi, câu tương đương hoặc chủ đề"} value={manager.search} editable={!manager.busy} onChangeText={manager.changeSearch} />
      <SegmentedButtons value={manager.tab} onValueChange={manager.changeTab} buttons={[
        { value: "all", label: "Tất cả", disabled: manager.busy },
        { value: "turns", label: "Chat người dùng", disabled: manager.busy },
      ]} />
      {!!manager.message && <Text accessibilityLiveRegion="polite">{manager.message}</Text>}
      {!!manager.listError && <><Text accessibilityRole="alert">{manager.listError}</Text><Button onPress={manager.retry}>Thử tải danh sách lại</Button></>}
      {!!manager.error && !manager.form && !manager.deleteTarget && <><Text accessibilityRole="alert">{manager.error}</Text><Button onPress={manager.retry}>Thử lại</Button></>}
    </View>
    {manager.loading ? <ActivityIndicator /> : <FlatList
      data={manager.items} keyExtractor={item => item._id} contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={manager.refreshing} onRefresh={manager.refresh} />}
      ListEmptyComponent={!manager.listError && <Text>{manager.tab === "turns" ? "Chưa có lượt chat phù hợp." : "Chưa có FAQ phù hợp."}</Text>}
      renderItem={({ item }) => manager.tab === "turns" ? <Card style={styles.card}><Card.Content>
        <Text variant="titleMedium">Câu hỏi: {item.question}</Text>
        <Text selectable>Câu trả lời: {item.answer}</Text>
        {!!item.created_at && <Text>{new Date(item.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</Text>}
        <Text>Người dùng: {item.user_name || "Chưa có tên"}</Text>
      </Card.Content></Card> : <Card style={styles.card}><Card.Content>
        <Text variant="titleMedium">{item.question}</Text>
        <Text>{item.status === "approved" ? "Đã duyệt" : "Bản nháp"} · Phiên bản {item.version}</Text>
        {!!item.topic && <Text>Chủ đề: {item.topic}</Text>}
        <Text numberOfLines={3}>{item.answer}</Text>
        <Text>{item.aliases?.length || 0} câu hỏi tương đương</Text>
      </Card.Content><Card.Actions>
        <Button disabled={manager.busy || manager.refreshing} onPress={() => manager.open(item)}>Sửa</Button>
        <Button mode="contained" buttonColor="#B91C1C" textColor="#FFFFFF" disabled={manager.busy || manager.refreshing} onPress={() => manager.requestDelete(item)}>Xóa</Button>
      </Card.Actions></Card>}
      ListFooterComponent={<ListPagination pagination={manager.pagination} onPageChange={manager.load} disabled={manager.busy || manager.refreshing} />}
    />}
    <FaqFormModal form={manager.form} draft={manager.draft} error={manager.error} busy={manager.busy}
      onClose={manager.close} onChangeField={manager.changeField} onSave={manager.save} onChangeApproval={manager.changeApproval} />
    <Portal><Dialog visible={!!manager.deleteTarget} dismissable={!manager.busy} onDismiss={manager.cancelDelete}>
      <Dialog.Title>Xóa FAQ?</Dialog.Title>
      <Dialog.Content>
        <Text>{manager.deleteTarget?.question}</Text>
        <Text>FAQ sẽ bị xóa vĩnh viễn và không còn được dùng để trả lời chat. Lịch sử chat được giữ nguyên.</Text>
        {!!manager.error && <Text accessibilityRole="alert" style={{ color: colors.statusError }}>{manager.error}</Text>}
      </Dialog.Content>
      <Dialog.Actions>
        <Button disabled={manager.busy} onPress={manager.cancelDelete}>Hủy</Button>
        <Button mode="contained" buttonColor="#B91C1C" textColor="#FFFFFF" disabled={manager.busy} loading={manager.busy} onPress={manager.confirmDelete}>Xóa</Button>
      </Dialog.Actions>
    </Dialog></Portal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: 18, gap: 12 },
  list: { padding: 18, gap: 14 },
  card: { backgroundColor: colors.white },
});
