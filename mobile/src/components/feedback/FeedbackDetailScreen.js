import { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Card, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import useAuthStore from "../../../store/authStore";
import useFeedbackDetail from "../../hooks/useFeedbackDetail";
import useFormBack from "../../hooks/useFormBack";
import feedbackService from "../../services/feedbackService";
import { getSessionContext, isSessionCurrent } from "../../services/sessionAccess";
import { colors } from "../../theme";
import ListError from "../common/ListError";
import LinkedFeedbackHistory from "./LinkedFeedbackHistory";
import FeedbackFrame, { FeedbackMessage, feedbackStyles as styles, feedbackTime, statusLabels, typeLabels } from "./FeedbackFrame";

function FeedbackPhoto({ id, index, manager }) {
  const sessionVersion = useAuthStore(state => state.sessionVersion);
  const key = `${id}:${index}:${manager}:${sessionVersion}`;
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const session = getSessionContext();
    const current = () => !controller.signal.aborted && isSessionCurrent(session);
    let objectUrl;
    async function load() {
      try {
        let source;
        if (Platform.OS === "web") {
          const blob = await feedbackService.image(id, index, manager, controller.signal);
          if (!current()) return;
          objectUrl = URL.createObjectURL(blob);
          source = { uri: objectUrl };
        } else {
          source = { uri: feedbackService.imageUrl(id, index, manager), headers: { Authorization: `Bearer ${session.token}` } };
        }
        if (current()) setPhoto({ key, source });
      } catch {
        if (current()) setPhoto({ key, failed: true });
      }
    }
    if (session.token) load();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, index, manager, key]);
  if (photo?.key !== key) return <ActivityIndicator />;
  if (photo.failed) return <Text>Ảnh đóng góp không còn khả dụng.</Text>;
  return <Image source={photo.source} resizeMode="contain" style={local.photo}
    accessibilityLabel={`Ảnh đóng góp ${index + 1}`}
    onError={() => setPhoto(previous => previous?.key === key ? { key, failed: true } : previous)} />;
}

function ReviewPanel({ item, busy, onReview }) {
  const [status, setStatus] = useState(item.status === "pending" ? "accepted" : item.status);
  const [response, setResponse] = useState(item.response || "");
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.group}>
        <Text variant="titleMedium">{item.status === "pending" ? "Xử lý đóng góp" : "Cập nhật kết quả xử lý"}</Text>
        <SegmentedButtons value={status} onValueChange={setStatus} buttons={[
          { value: "accepted", label: "Tiếp nhận", disabled: busy },
          { value: "rejected", label: "Từ chối", disabled: busy },
        ]} />
        <TextInput mode="outlined" label="Nội dung phản hồi" multiline maxLength={1000}
          value={response} onChangeText={setResponse} disabled={busy} />
        <Button mode="contained" onPress={() => onReview(status, response)} loading={busy} disabled={busy}>
          Lưu kết quả
        </Button>
      </Card.Content>
    </Card>
  );
}

export default function FeedbackDetailScreen({ id, manager = false, sent = false }) {
  const router = useRouter();
  const result = useFeedbackDetail(id, manager);
  const [showSent, setShowSent] = useState(sent);
  const fallback = manager ? "/manager/feedback" : "/customer/feedback";
  useFormBack(() => router.canGoBack() ? router.back() : router.replace(fallback), result.busy);
  const { item } = result;
  return (
    <FeedbackFrame title="Chi tiết đóng góp" fallback={fallback} busy={result.busy}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {result.loading ? <ActivityIndicator /> : result.error
          ? <ListError message={result.error} onRetry={result.load} />
          : item && <>
            <Card style={styles.card}>
              <Card.Content style={styles.group}>
                <Text variant="titleMedium">{typeLabels[item.type]}</Text>
                <Text style={styles.muted}>{feedbackTime(item.created_at)}</Text>
                {manager && <Text>{item.sender?.fullName || "Tài khoản không còn khả dụng"}{item.sender?.email ? ` · ${item.sender.email}` : ""}</Text>}
                <Text variant="labelLarge">{statusLabels[item.status]}</Text>
                <Text>{item.description}</Text>
              </Card.Content>
            </Card>
            {!!item.diagnosis_id && <LinkedFeedbackHistory key={item._id}
              history={item.diagnosis} managerFeedbackId={manager ? item._id : undefined} />}
            <Text variant="titleMedium">Ảnh đính kèm</Text>
            {Array.from({ length: item.image_count }, (_, index) => (
              <FeedbackPhoto key={`${item._id}:${index}`} id={item._id} index={index} manager={manager} />
            ))}
            {item.status !== "pending" && <Card style={styles.card}>
              <Card.Content style={styles.group}>
                <Text variant="titleMedium">Phản hồi của quản lý</Text>
                {item.status === "accepted" && !manager && (
                  <Text>Chúng tôi đã tiếp nhận và xem xét cho sử dụng ảnh để cải thiện mô hình AI.</Text>
                )}
                <Text>{item.response}</Text>
                {!!item.reviewed_at && <Text style={styles.muted}>{feedbackTime(item.reviewed_at)}</Text>}
              </Card.Content>
            </Card>}
            {manager && <>
              <Button icon="refresh" onPress={result.load} disabled={result.busy}>Tải lại kết quả xử lý</Button>
              <ReviewPanel key={`${item._id}:${item.review_count}`} item={item} busy={result.busy} onReview={result.review} />
              {!!item.review_history?.length && <>
                <Text variant="titleMedium">Lịch sử xử lý</Text>
                {[...item.review_history].reverse().map((entry, index) => (
                  <Card key={`${entry.reviewed_at}:${index}`} style={styles.card}>
                    <Card.Content style={styles.group}>
                      <Text variant="labelLarge">{statusLabels[entry.status]} · {entry.manager_name || "Quản lý"}</Text>
                      <Text>{entry.response}</Text>
                      <Text style={styles.muted}>{feedbackTime(entry.reviewed_at)}</Text>
                    </Card.Content>
                  </Card>
                ))}
              </>}
            </>}
          </>}
      </ScrollView>
      <FeedbackMessage message={showSent ? "Đã gửi đóng góp. Trạng thái hiện tại là Chờ xử lý." : result.message}
        onClose={() => { setShowSent(false); result.clearMessage(); }} />
    </FeedbackFrame>
  );
}
const local = StyleSheet.create({
  photo: { width: "100%", aspectRatio: 1.35, backgroundColor: colors.lightMint, borderRadius: 12 },
});
