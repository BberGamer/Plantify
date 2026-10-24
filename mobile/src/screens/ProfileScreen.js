import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileIdentity from "../components/Profile/ProfileIdentity";
import ProfileDetails from "../components/Profile/ProfileDetails";
import ProfileLogout from "../components/Profile/ProfileLogout";
import Navbar from "../components/home/Navbar";
import useProfile from "../hooks/useProfile";
import { colors } from "../theme/colors";

export default function ProfileScreen({ showNavbar = false }) {
  const profile = useProfile();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <ProfileHeader />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
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
  content: { padding: 18, paddingBottom: 28, backgroundColor: "#FAFCFA" },
});

