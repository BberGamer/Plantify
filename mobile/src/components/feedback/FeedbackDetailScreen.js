import { componentStyles } from "../../theme/componentStyles";
import { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Text,
  TextInput,
} from "react-native-paper";
import { useRouter } from "expo-router";
import useAuthStore from "../../../store/authStore";
import useFeedbackDetail from "../../hooks/useFeedbackDetail";
import useFormBack from "../../hooks/useFormBack";
import feedbackService from "../../services/feedbackService";
import {
  getSessionContext,
  isSessionCurrent,
} from "../../services/sessionAccess";
import { colors } from "../../theme";
import { FilterOptions } from "../common/FilterControls";
import { FeedbackField, FeedbackSection, FeedbackStatusBadge, feedbackStatusTone, presentation } from "./FeedbackPresentation";
import ListError from "../common/ListError";
import LinkedFeedbackHistory from "./LinkedFeedbackHistory";
import FeedbackFrame, {
  FeedbackMessage,
  feedbackStyles as styles,
  feedbackTime,
  typeLabels,
} from "./FeedbackFrame";

function FeedbackPhoto({ id, index, manager }) {
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const key = `${id}:${index}:${manager}:${sessionVersion}`;
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const session = getSessionContext();
    const current = () =>
      !controller.signal.aborted && isSessionCurrent(session);
    let objectUrl;
    async function load() {
      try {
        let source;
        if (Platform.OS === "web") {
          const blob = await feedbackService.image(
            id,
            index,
            manager,
            controller.signal,
          );
          if (!current()) return;
          objectUrl = URL.createObjectURL(blob);
          source = { uri: objectUrl };
        } else {
          source = {
            uri: feedbackService.imageUrl(id, index, manager),
            headers: { Authorization: `Bearer ${session.token}` },
          };
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
  return (
    <Image
      source={photo.source}
      resizeMode="contain"
      style={local.photo}
      accessibilityLabel={`Ảnh đóng góp ${index + 1}`}
      onError={() =>
        setPhoto((previous) =>
          previous?.key === key ? { key, failed: true } : previous,
        )
      }
    />
  );
}

function ReviewPanel({ item, busy, onReview }) {
  const [status, setStatus] = useState(
    item.status === "pending" ? "accepted" : item.status,
  );
  const [response, setResponse] = useState(item.response || "");
  const disabled = busy;
  return (
    <FeedbackSection title={item.status === "pending" ? "Xử lý đóng góp" : "Cập nhật kết quả xử lý"} icon="create-outline">
      <View style={presentation.field}>
        <Text style={presentation.label}>Trạng thái hiện tại</Text>
        <View style={{ alignItems: "flex-start" }}><FeedbackStatusBadge status={item.status} /></View>
      </View>
      <View style={presentation.field}>
        <Text style={presentation.label}>Kết quả xử lý mới</Text>
        <FilterOptions value={status} onChange={setStatus} disabled={disabled} options={[
          { value: "accepted", label: "Tiếp nhận", icon: "checkmark-circle-outline" },
          { value: "rejected", label: "Từ chối", icon: "close-circle-outline" },
        ]} />
      </View>
      <TextInput mode="outlined" label="Nội dung phản hồi" multiline maxLength={1000}
        value={response} onChangeText={setResponse} disabled={disabled} style={local.responseInput} />
      <Text style={presentation.hint}>{response.length}/1.000 ký tự · Kết quả chỉ được cập nhật sau khi lưu.</Text>
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
        mode="contained" onPress={() => onReview(status, response)} loading={busy} disabled={disabled}>
        Lưu kết quả
      </Button>
    </FeedbackSection>
  );
}

export default function FeedbackDetailScreen({
  id,
  manager = false,
  sent = false,
}) {
  const router = useRouter();
  const result = useFeedbackDetail(id, manager);
  const [showSent, setShowSent] = useState(sent);
  const fallback = manager ? "/manager/feedback" : "/customer/feedback";
  const pending = result.busy;
  useFormBack(
    () => (router.canGoBack() ? router.back() : router.replace(fallback)),
    pending,
  );
  const { item } = result;
  return (
    <FeedbackFrame
      title="Chi tiết đóng góp"
      fallback={fallback}
      busy={pending}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {result.loading ? (
          <ActivityIndicator />
        ) : result.error ? (
          <ListError message={result.error} onRetry={result.load} />
        ) : (
          item && (
            <>
              <FeedbackSection title="Thông tin đóng góp" icon="document-text-outline"
                action={<FeedbackStatusBadge status={item.status} />}
                style={{ borderLeftWidth: 4, borderLeftColor: feedbackStatusTone(item.status).color }}>
                <View style={presentation.fields}>
                  <View style={presentation.fieldColumn}><FeedbackField label="Loại đóng góp" value={typeLabels[item.type]} /></View>
                  <View style={presentation.fieldColumn}><FeedbackField label="Thời gian gửi" value={item.created_at ? feedbackTime(item.created_at) : "Chưa có thời gian"} /></View>
                </View>
                {manager && <View style={presentation.fields}>
                  <View style={presentation.fieldColumn}><FeedbackField label="Người gửi" value={item.sender?.fullName || "Tài khoản không còn khả dụng"} /></View>
                  <View style={presentation.fieldColumn}><FeedbackField label="Email người gửi" value={item.sender?.email} /></View>
                </View>}
                <View style={presentation.description}>
                  <FeedbackField label="Nội dung đóng góp" value={item.description} />
                </View>
              </FeedbackSection>
              {!!item.diagnosis_id && (
                <LinkedFeedbackHistory
                  key={item._id}
                  history={item.diagnosis}
                  managerFeedbackId={manager ? item._id : undefined}
                />
              )}
              <FeedbackSection title="Ảnh đính kèm" icon="images-outline">
                <Text style={presentation.hint}>{item.image_count || 0} ảnh do người gửi cung cấp</Text>
                {Array.from({ length: item.image_count }, (_, index) => (
                  <View key={`${item._id}:${index}`} style={presentation.field}>
                    <Text style={presentation.label}>Ảnh {index + 1}</Text>
                    <FeedbackPhoto id={item._id} index={index} manager={manager} />
                  </View>
                ))}
                {!item.image_count && <Text style={presentation.hint}>Không có ảnh đính kèm.</Text>}
              </FeedbackSection>
              {item.status !== "pending" && (
                <FeedbackSection title="Phản hồi của quản lý" icon="chatbubble-ellipses-outline"
                  action={<FeedbackStatusBadge status={item.status} />}>
                  {item.status === "accepted" && !manager && (
                    <Text>Chúng tôi đã tiếp nhận và xem xét cho sử dụng ảnh để cải thiện mô hình AI.</Text>
                  )}
                  <View style={presentation.description}><FeedbackField label="Nội dung phản hồi" value={item.response} /></View>
                  {!!item.reviewed_at && <FeedbackField label="Thời gian xử lý" value={feedbackTime(item.reviewed_at)} />}
                </FeedbackSection>
              )}
              {manager && (
                <>
                  <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
                    icon="refresh"
                    onPress={result.load}
                    disabled={pending}
                  >
                    Tải lại kết quả xử lý
                  </Button>
                  <ReviewPanel
                    key={`${item._id}:${item.review_count}`}
                    item={item}
                    busy={result.busy}
                    onReview={result.review}
                  />
                  {!!item.review_history?.length && (
                    <>
                      <Text variant="titleMedium">Lịch sử xử lý</Text>
                      {[...item.review_history]
                        .reverse()
                        .map((entry, index) => (
                          <FeedbackSection key={`${entry.reviewed_at}:${index}`}
                            title={`Lần xử lý ${item.review_history.length - index}`} icon="time-outline"
                            action={<FeedbackStatusBadge status={entry.status} />}>
                            <View style={presentation.fields}>
                              <View style={presentation.fieldColumn}><FeedbackField label="Người xử lý" value={entry.manager_name || "Quản lý"} /></View>
                              <View style={presentation.fieldColumn}><FeedbackField label="Thời gian xử lý" value={entry.reviewed_at ? feedbackTime(entry.reviewed_at) : "Chưa có thời gian"} /></View>
                            </View>
                            <View style={presentation.description}><FeedbackField label="Nội dung phản hồi" value={entry.response} /></View>
                          </FeedbackSection>
                        ))}
                    </>
                  )}
                </>
              )}
            </>
          )
        )}
      </ScrollView>
      <FeedbackMessage
        message={
          showSent
            ? "Đã gửi đóng góp. Trạng thái hiện tại là Chờ xử lý."
            : result.message
        }
        onClose={() => {
          setShowSent(false);
          result.clearMessage();
        }}
      />
    </FeedbackFrame>
  );
}
const local = StyleSheet.create({
  responseInput: { minHeight: 120, backgroundColor: colors.white },
  photo: {
    width: "100%",
    aspectRatio: 1.35,
    backgroundColor: colors.lightMint,
    borderRadius: 12
  }
});
