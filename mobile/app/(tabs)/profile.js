import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSegments } from "expo-router";
import ProfileHeader from "../../src/components/Profile/ProfileHeader";
import ProfileIdentity from "../../src/components/Profile/ProfileIdentity";
import ProfileDetails from "../../src/components/Profile/ProfileDetails";
import ProfileLogout from "../../src/components/Profile/ProfileLogout";
import Navbar from "../../src/components/home/Navbar";
import useProfile from "../../src/hooks/useProfile";
import { colors } from "../../src/theme/colors";

// Giống Home: màn hình chỉ ghép component, hook chịu trách nhiệm xử lý.
export default function ProfileScreen() {
  const profile = useProfile();
  const segments = useSegments();
  const isManagementProfile = ["admin", "manager"].includes(segments[0]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <ProfileHeader />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileIdentity user={profile.user} />
        <ProfileDetails {...profile} />
        <ProfileLogout {...profile} />
      </ScrollView>
      {!isManagementProfile && <Navbar />}
    </SafeAreaView>
  );
}

// Style đặt riêng ở cuối file, dùng màu từ theme Plantify.
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  content: { padding: 18, paddingBottom: 28, backgroundColor: "#FAFCFA" },
});
