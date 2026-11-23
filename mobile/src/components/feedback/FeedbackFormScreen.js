import { FlatList, Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, IconButton, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import useFeedbackForm from "../../hooks/useFeedbackForm";
import useFormBack from "../../hooks/useFormBack";
import usePaginatedList from "../../hooks/usePaginatedList";
import { useFinanceSummary } from "../../hooks/useFinance";
import diagnosisService from "../../services/diagnosisService";
import DiagnosisHistoryPhoto from "../diagnosis/DiagnosisHistoryPhoto";
import ListPagination from "../common/ListPagination";
import ListError from "../common/ListError";
import { historyKindLabel } from "./LinkedFeedbackHistory";
import FeedbackFrame, { FeedbackMessage, feedbackStyles as styles, feedbackTime } from "./FeedbackFrame";

export function DiagnosisSummary({ diagnosis }) {
  return (
    <View style={styles.row}>
      <DiagnosisHistoryPhoto diagnosisId={diagnosis._id} hasImage={diagnosis.has_image} />
      <View style={local.summary}>
        <Text variant="titleMedium">{diagnosis.disease_name || diagnosis.plant_name || "Kết quả đã lưu"}</Text>
        {!!diagnosis.disease_name && !!diagnosis.plant_name && <Text>{diagnosis.plant_name}</Text>}
        <Text style={styles.muted}>{historyKindLabel(diagnosis)} · {feedbackTime(diagnosis.created_at)}</Text>
      </View>
    </View>
  );
}

function HistoryPicker({ onSelect, onClose }) {
  const [kind, setKind] = useState("all");
  const fetchHistory = useCallback(
    (params) => diagnosisService.history({ ...params, result_kind: kind === "all" ? undefined : kind }),
    [kind],
  );
  const list = usePaginatedList(fetchHistory, { limit: 8 });
  return (
    <FlatList data={list.loading || list.error ? [] : list.items} keyExtractor={item => item._id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<>
        <Button onPress={onClose}>Quay lại bản nháp</Button>
        <SegmentedButtons value={kind} onValueChange={setKind} buttons={[
          { value: "all", label: "Tất cả" },
          { value: "plant", label: "Nhận diện cây" },
          { value: "disease", label: "Bệnh cây" },
        ]} />
      </>}
      ListEmptyComponent={list.loading ? <ActivityIndicator /> : list.error
        ? <ListError message={list.error} onRetry={list.retry} />
        : <Text>Chưa có kết quả đã lưu.</Text>}
      renderItem={({ item }) => (
        <Card style={styles.card} onPress={() => onSelect(item)} accessibilityLabel="Chọn kết quả đã lưu">
          <Card.Content><DiagnosisSummary diagnosis={item} /></Card.Content>
        </Card>
      )}
      ListFooterComponent={list.loading || list.error ? null :
        <ListPagination pagination={list.pagination} onPageChange={list.load} />}
    />
  );
}

export default function FeedbackFormScreen({ diagnosisId }) {
  const router = useRouter();
  const form = useFeedbackForm(diagnosisId);
  const finance = useFinanceSummary();
  const [choosing, setChoosing] = useState(false);
  const blocked = finance && !(finance.isproaccount && new Date(finance.vip_expires_at) > new Date());
  useFormBack(() => {
    if (choosing) setChoosing(false);
    else if (router.canGoBack()) router.back();
    else router.replace("/customer/feedback");
  }, form.busy);

  return (
    <FeedbackFrame title={choosing ? "Chọn kết quả đã lưu" : "Tạo đóng góp"}
      busy={form.busy} fallback={choosing ? null : "/customer/feedback"}>
      {choosing ? <HistoryPicker onClose={() => setChoosing(false)}
        onSelect={item => { form.selectDiagnosis(item); setChoosing(false); }} />
        : <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {blocked ? <>
            <Text>Bạn cần gói VIP còn hạn để gửi đóng góp.</Text>
            <Button mode="contained" onPress={() => router.push("/customer/vip")}>Xem gói VIP</Button>
          </> : <>
            <TextInput mode="outlined" label="Mô tả" value={form.description} multiline maxLength={250}
              onChangeText={form.changeDescription} disabled={form.busy} style={local.description} />
            <Text style={styles.muted}>{form.description.length} / 250 ký tự</Text>
            <Text variant="titleMedium">Ảnh đính kèm ({form.images.length}/5)</Text>
            <Text style={styles.muted}>Chọn 1–5 ảnh JPG, PNG hoặc WebP. Tối đa 10 MB mỗi ảnh.</Text>
            <View style={styles.row}>
              {form.images.map((image, index) => (
                <View key={`${image.uri}:${index}`} style={local.preview}>
                  <Image source={{ uri: image.uri }} style={local.image} accessibilityLabel={`Ảnh đính kèm ${index + 1}`} />
                  <IconButton icon="close" size={16} style={local.remove} mode="contained"
                    accessibilityLabel={`Bỏ ảnh ${index + 1}`} onPress={() => form.removeImage(index)} disabled={form.busy} />
                </View>
              ))}
            </View>
            <Button mode="outlined" icon="image-plus" onPress={form.pickImages}
              disabled={form.busy || form.images.length >= 5}>Thêm ảnh</Button>
            <Text variant="titleMedium">Kết quả đã lưu (không bắt buộc)</Text>
            {form.loadingDiagnosis && <ActivityIndicator />}
            {!!form.diagnosis && <DiagnosisSummary diagnosis={form.diagnosis} />}
            <View style={styles.row}>
              <Button onPress={() => setChoosing(true)} disabled={form.busy || form.loadingDiagnosis}>
                {form.diagnosis ? "Đổi lịch sử" : "Chọn lịch sử"}
              </Button>
              {!!form.diagnosis && <Button disabled={form.busy} onPress={() => form.selectDiagnosis(null)}>Bỏ chọn</Button>}
            </View>
            <Button mode="contained" onPress={form.submit} loading={form.busy}
              disabled={form.busy || form.loadingDiagnosis}>Gửi đóng góp</Button>
          </>}
        </ScrollView>}
      <FeedbackMessage message={form.message} onClose={form.clearMessage} />
    </FeedbackFrame>
  );
}

const local = StyleSheet.create({
  description: { minHeight: 110 },
  preview: { width: 84, height: 84 },
  image: { width: "100%", height: "100%", borderRadius: 10 },
  remove: { position: "absolute", right: 0, top: 0 },
  summary: { flex: 1, gap: 4 },
});
