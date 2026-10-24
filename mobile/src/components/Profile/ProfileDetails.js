import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import ProfileInfoRow from "./ProfileInfoRow";
import ProfileEditForm from "./ProfileEditForm";
import { colors } from "../../theme/colors";
import { profileTheme } from "./profileTheme";

export default function ProfileDetails({ user, ...actions }) {
  const { editing, isLoggingOut, startEditing, message } = actions;
  const fullName = user?.fullName?.trim() || "";
  const email = user?.email?.trim() || "";
  const phone = user?.phone?.trim() || "";
  return (<>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          {!editing && (
            <Button
              theme={profileTheme}
              icon="pencil-outline"
              onPress={startEditing}
              disabled={isLoggingOut}
            >
              Chỉnh sửa
            </Button>
          )}
        </View>
        <View style={styles.card}>
          {editing ? (
            <ProfileEditForm {...actions} />
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
                last
              />
            </>
          )}
        </View>
        {!!message && (
          <Text style={styles.formMessage} accessibilityRole="alert">
            {message}
          </Text>
        )}
  </>);
}

// Style riêng của component.
const styles = StyleSheet.create({
sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
formMessage: { marginTop: 12, color: colors.primaryText, fontSize: 13 },
sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primaryText,
  },
card: {
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
