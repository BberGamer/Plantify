import EmptyState from "../common/EmptyState";
import LoadingState from "../common/LoadingState";
import SearchField from "../common/SearchField";
import { FilterChip, FilterRow } from "../common/FilterControls";
import { componentStyles } from "../../theme/componentStyles";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import useFeedbackList, { emptyFeedbackFilters as emptyFilters } from "../../hooks/useFeedbackList";
import ListPagination from "../common/ListPagination";
import ListError from "../common/ListError";
import ManagerFeedbackCard from "./ManagerFeedbackCard";
import FeedbackFrame, { feedbackStyles as styles, feedbackTime, statusLabels, typeLabels } from "./FeedbackFrame";


function ManagerFilters({ onApply }) {
  const [draft, setDraft] = useState(emptyFilters);
  const change = (field, value) => setDraft(previous => ({ ...previous, [field]: value }));
  const chips = (field, labels) => (
    <FilterRow>
      {Object.entries({ "": "Tất cả", ...labels }).map(([value, label]) => (
        <FilterChip key={value} selected={draft[field] === value}
          onPress={() => change(field, value)}>{label}</FilterChip>
      ))}
    </FilterRow>
  );
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.group}>
        <Text variant="titleMedium">Bộ lọc</Text>
        <Text>Loại đóng góp</Text>
        {chips("type", typeLabels)}
        <Text>Trạng thái</Text>
        {chips("status", statusLabels)}
        <SearchField placeholder="Tìm email người gửi…" accessibilityLabel="Email người gửi" value={draft.email} autoCapitalize="none"
          keyboardType="email-address" onChangeText={value => change("email", value)} />
        <TextInput mode="outlined" label="Từ ngày (YYYY-MM-DD)" value={draft.from}
          maxLength={10} onChangeText={value => change("from", value)} />
        <TextInput mode="outlined" label="Đến ngày (YYYY-MM-DD)" value={draft.to}
          maxLength={10} onChangeText={value => change("to", value)} />
        <View style={styles.row}>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="contained" onPress={() => onApply(draft)}>Áp dụng</Button>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={() => { setDraft(emptyFilters); onApply(emptyFilters); }}>Xóa bộ lọc</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function FeedbackListScreen({ manager = false }) {
  const router = useRouter();
  const { list, finance, vip, applyFilters: setFilters } = useFeedbackList(manager);
  const open = id => router.push({ pathname: manager ? "/manager/feedback/[id]" : "/customer/feedback/[id]", params: { id } });

  return (
    <FeedbackFrame title={manager ? "Quản lý đóng góp" : "Đóng góp ý kiến"} fallback={manager ? null : "/customer/profile"}>
      <FlatList data={list.loading || list.error ? [] : list.items} keyExtractor={item => item._id}
        keyboardShouldPersistTaps="handled" refreshing={list.refreshing} onRefresh={list.refresh}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.group}>
            {manager ? <ManagerFilters onApply={setFilters} /> : <>
              <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="contained" icon="plus" onPress={() => router.push(finance && !vip ? "/customer/vip" : "/customer/feedback/new")}>
                {finance && !vip ? "Nâng VIP để gửi đóng góp" : "Tạo đóng góp"}
              </Button>
              <Text variant="titleMedium">Đóng góp đã gửi</Text>
            </>}
          </View>
        }
        ListEmptyComponent={list.loading ? <LoadingState /> : list.error
          ? <ListError message={list.error} onRetry={list.retry} />
          : <EmptyState title="Chưa có đóng góp nào." icon="chatbubble-outline" />}
        renderItem={({ item }) => manager ? (
          <ManagerFeedbackCard item={item} onPress={() => open(item._id)} />
        ) : (
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
