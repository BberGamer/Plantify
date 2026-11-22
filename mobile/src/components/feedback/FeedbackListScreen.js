import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import usePaginatedList from "../../hooks/usePaginatedList";
import useAuthStore from "../../../store/authStore";
import { useFinanceSummary } from "../../hooks/useFinance";
import feedbackService from "../../services/feedbackService";
import ListPagination from "../common/ListPagination";
import ListError from "../common/ListError";
import FeedbackFrame, { feedbackStyles as styles, feedbackTime, statusLabels, typeLabels } from "./FeedbackFrame";

const emptyFilters = { type: "", status: "", email: "", from: "", to: "" };

function ManagerFilters({ onApply }) {
  const [draft, setDraft] = useState(emptyFilters);
  const change = (field, value) => setDraft(previous => ({ ...previous, [field]: value }));
  const chips = (field, labels) => (
    <View style={styles.row}>
      {Object.entries({ "": "Tất cả", ...labels }).map(([value, label]) => (
        <Chip key={value} accessibilityRole="button" selected={draft[field] === value}
          onPress={() => change(field, value)}>{label}</Chip>
      ))}
    </View>
  );
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.group}>
        <Text variant="titleMedium">Bộ lọc</Text>
        <Text>Loại đóng góp</Text>
        {chips("type", typeLabels)}
        <Text>Trạng thái</Text>
        {chips("status", statusLabels)}
        <TextInput mode="outlined" label="Email người gửi" value={draft.email} autoCapitalize="none"
          keyboardType="email-address" onChangeText={value => change("email", value)} />
        <TextInput mode="outlined" label="Từ ngày (YYYY-MM-DD)" value={draft.from}
          maxLength={10} onChangeText={value => change("from", value)} />
        <TextInput mode="outlined" label="Đến ngày (YYYY-MM-DD)" value={draft.to}
          maxLength={10} onChangeText={value => change("to", value)} />
        <View style={styles.row}>
          <Button mode="contained" onPress={() => onApply(draft)}>Áp dụng</Button>
          <Button onPress={() => { setDraft(emptyFilters); onApply(emptyFilters); }}>Xóa bộ lọc</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function FeedbackListScreen({ manager = false }) {
  const router = useRouter();
  const [filters, setFilters] = useState(emptyFilters);
  const active = useAuthStore(state => state.isAuthenticated && state.user?.role === (manager ? "manager" : "customer"));
  const finance = useFinanceSummary(active && !manager);
  const vip = finance?.isproaccount && new Date(finance.vip_expires_at) > new Date();
  const fetchPage = useCallback(paging => feedbackService.list({
    ...paging,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim()).map(([key, value]) => [key, value.trim()])),
  }, manager), [filters, manager]);
  const list = usePaginatedList(fetchPage, { limit: 15, enabled: active });
  const open = id => router.push({ pathname: manager ? "/manager/feedback/[id]" : "/customer/feedback/[id]", params: { id } });

  return (
    <FeedbackFrame title={manager ? "Quản lý đóng góp" : "Đóng góp ý kiến"} fallback={manager ? null : "/customer/profile"}>
      <FlatList data={list.loading || list.error ? [] : list.items} keyExtractor={item => item._id}
        keyboardShouldPersistTaps="handled" refreshing={list.refreshing} onRefresh={list.refresh}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.group}>
            {manager ? <ManagerFilters onApply={setFilters} /> : <>
              <Button mode="contained" icon="plus" onPress={() => router.push(finance && !vip ? "/customer/vip" : "/customer/feedback/new")}>
                {finance && !vip ? "Nâng VIP để gửi đóng góp" : "Tạo đóng góp"}
              </Button>
              <Text variant="titleMedium">Đóng góp đã gửi</Text>
            </>}
          </View>
        }
        ListEmptyComponent={list.loading ? <ActivityIndicator /> : list.error
          ? <ListError message={list.error} onRetry={list.retry} />
          : <Text style={styles.center}>Chưa có đóng góp nào.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => open(item._id)} accessibilityLabel="Xem chi tiết đóng góp">
            <Card.Content style={styles.group}>
              <Text variant="titleMedium">{typeLabels[item.type]}</Text>
              <Text numberOfLines={2}>{item.description}</Text>
              {manager && <Text>{item.sender?.fullName || "Tài khoản không còn khả dụng"}{item.sender?.email ? ` · ${item.sender.email}` : ""}</Text>}
              <Text style={styles.muted}>{statusLabels[item.status]} · {feedbackTime(item.created_at)}</Text>
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={list.loading || list.error ? null :
          <ListPagination pagination={list.pagination} onPageChange={list.load} disabled={list.refreshing} />}
      />
    </FeedbackFrame>
  );
}
