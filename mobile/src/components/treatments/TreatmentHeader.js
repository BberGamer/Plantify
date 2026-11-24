import { IconButton } from "react-native-paper";
import ScreenHeader from "../common/ScreenHeader";
export default function TreatmentHeader({ title, onBack, actionIcon, onAction }) {
  return <ScreenHeader title={title} onBack={onBack}>
    {actionIcon ? <IconButton size={20} icon={actionIcon} onPress={onAction} accessibilityLabel="Tùy chọn" /> : null}
  </ScreenHeader>;
}
