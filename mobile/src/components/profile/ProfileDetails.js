import SectionCard from "../common/SectionCard";
import { componentStyles } from "../../theme/componentStyles";

import { spacing } from "../../theme/tokens";

import { StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import ProfileInfoRow from "./ProfileInfoRow";
import ProfileEditForm from "./ProfileEditForm";
import NotificationPreferences from "./NotificationPreferences";
import { colors } from "../../theme/colors";

export default function ProfileDetails({
  user,
  editing,
  isLoggingOut,
  startEditing,
  message,
  form,
  changeField,
  saving,
  cancelEditing,
  saveProfile,
}) {
  const fullName = user?.fullName?.trim() || "";
  const email = user?.email?.trim() || "";
  const phone = user?.phone?.trim() || "";
  const showReminders = user?.role === "customer";
  return (
    <>
      <SectionCard title="Thông tin cá nhân" icon="person-outline" action={!editing ? (
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} icon="pencil-outline"
          onPress={startEditing} disabled={isLoggingOut}>Chỉnh sửa</Button>
      ) : null}>
        {editing ? (
          <ProfileEditForm
            form={form}
            changeField={changeField}
            saving={saving}
            cancelEditing={cancelEditing}
            saveProfile={saveProfile}
          />
        ) : (
          <>
            <ProfileInfoRow
              icon="person-outline"
              label="Họ và tên"
              value={fullName || "Chưa cập nhật họ tên"}
            />
            <ProfileInfoRow
              icon="mail-outline"
              label="Địa chỉ email"
              value={email || "Chưa cập nhật email"}
            />
            <ProfileInfoRow
              icon="call-outline"
              label="Số điện thoại"
              value={phone || "Chưa cập nhật"}
              last={!showReminders}
            />
          </>
        )}
        {showReminders && <NotificationPreferences disabled={isLoggingOut} />}
      </SectionCard>
      {!!message && (
        <Text style={styles.formMessage} accessibilityRole="alert">
          {message}
        </Text>
      )}
    </>
  );
}

// Style riêng của component.
const styles = StyleSheet.create({
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: spacing.sm
  },
  formMessage: {
    marginTop: spacing.md,
    color: colors.primaryText,
    fontSize: 13
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primaryText
  },
  card: {
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border
  }
});
