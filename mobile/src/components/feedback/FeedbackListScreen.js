import EmptyState from "../common/EmptyState";
import LoadingState from "../common/LoadingState";
import SearchField from "../common/SearchField";
import { FilterOptions } from "../common/FilterControls";
import { componentStyles } from "../../theme/componentStyles";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import useFeedbackList, { emptyFeedbackFilters as emptyFilters } from "../../hooks/useFeedbackList";
import ListPagination from "../common/ListPagination";
import ListError from "../common/ListError";
import ManagerFeedbackCard, { FeedbackCard } from "./ManagerFeedbackCard";
import FeedbackFrame, { feedbackStyles as styles, statusLabels, typeLabels } from "./FeedbackFrame";


const typeOptions = Object.entries({ "": "Tất cả", ...typeLabels }).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries({ "": "Tất cả", ...statusLabels }).map(([value, label]) => ({ value, label }));

function FeedbackFilters({ filters, onChange, children }) {
  return <Card style={styles.card}>
    <Card.Content style={styles.group}>
      <Text variant="titleMedium">Bộ lọc</Text>
      <Text>Loại đóng góp</Text>
      <FilterOptions options={typeOptions} value={filters.type} accessibilityLabel="Lọc theo loại đóng góp"
        onChange={value => onChange("type", value)} />
      <Text>Trạng thái</Text>
      <FilterOptions options={statusOptions} value={filters.status} accessibilityLabel="Lọc theo trạng thái đóng góp"
        onChange={value => onChange("status", value)} />
      {children}
    </Card.Content>
  </Card>;
}

function ManagerFilters({ onApply }) {
  const [draft, setDraft] = useState(emptyFilters);
  const change = (field, value) => setDraft(previous => ({ ...previous, [field]: value }));
  return <FeedbackFilters filters={draft} onChange={change}>
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
  </FeedbackFilters>;
}

export default function FeedbackListScreen({ manager = false }) {
  const router = useRouter();
  const { list, finance, vip, filters, changeFilter, applyFilters: setFilters } = useFeedbackList(manager);
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
              <FeedbackFilters filters={filters} onChange={changeFilter} />
              <Text variant="titleMedium">Đóng góp đã gửi</Text>
            </>}
          </View>
        }
        ListEmptyComponent={list.loading ? <LoadingState /> : list.error
          ? <ListError message={list.error} onRetry={list.retry} />
          : <EmptyState title={filters.type || filters.status ? "Không có đóng góp phù hợp bộ lọc." : "Chưa có đóng góp nào."} icon="chatbubble-outline" />}
        renderItem={({ item }) => manager ? (
          <ManagerFeedbackCard item={item} onPress={() => open(item._id)} />
        ) : (
          <FeedbackCard item={item} onPress={() => open(item._id)} />
        )}
        ListFooterComponent={list.loading || list.error ? null :
          <ListPagination pagination={list.pagination} onPageChange={list.load} disabled={list.refreshing} />}
      />
    </FeedbackFrame>
  );
}
