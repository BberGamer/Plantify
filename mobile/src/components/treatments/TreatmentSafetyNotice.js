import { Text } from "react-native-paper";
import NoticeBanner from "../common/NoticeBanner";
import { typography, colors } from "../../theme";
export default function TreatmentSafetyNotice({ children }) {
  return <NoticeBanner tone="warning" title="Lưu ý an toàn" icon="shield-checkmark-outline">
    <Text style={{ ...typography.body, color: colors.textPrimary }}>{children}</Text>
  </NoticeBanner>;
}
