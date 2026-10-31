import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeader from "./ProfileHeader";
import ProfileIdentity from "./ProfileIdentity";
import ProfileDetails from "./ProfileDetails";
import ProfileLogout from "./ProfileLogout";
import Navbar from "../navigation/Navbar";
import useProfile from "../../hooks/useProfile";
import { colors } from "../../theme/colors";

export default function ProfileContent({ onBack, showNavbar = false }) {
  const profile = useProfile();

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={showNavbar ? ["top", "left", "right"] : ["top", "left", "right", "bottom"]}
    >
      <ProfileHeader onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, showNavbar && styles.navContent]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileIdentity user={profile.user} />
        <ProfileDetails user={profile.user} editing={profile.editing}
          isLoggingOut={profile.isLoggingOut} startEditing={profile.startEditing}
          message={profile.message} form={profile.form} changeField={profile.changeField}
          saving={profile.saving} cancelEditing={profile.cancelEditing} saveProfile={profile.saveProfile} />
        <ProfileLogout isLoggingOut={profile.isLoggingOut} saving={profile.saving}
          logoutError={profile.logoutError} handleLogout={profile.handleLogout} />
      </ScrollView>
      {showNavbar && <Navbar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  navContent: { paddingBottom: 40 },
  content: { padding: 18, paddingBottom: 28, backgroundColor: "#FAFCFA" },
});
