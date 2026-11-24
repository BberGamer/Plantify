import ScreenHeader from "../common/ScreenHeader";
export default function ProfileHeader({ onBack }) {
  return <ScreenHeader title="Hồ sơ của tôi" onBack={onBack} backLabel="Về trang chủ" />;
}
