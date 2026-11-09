import { ScrollView, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeader from "./ProfileHeader";
import ProfileIdentity from "./ProfileIdentity";
import ProfileDetails from "./ProfileDetails";
import ProfileLogout from "./ProfileLogout";
import Navbar from "../navigation/Navbar";
import useProfile from "../../hooks/useProfile";
import { colors } from "../../theme/colors";

export default function ProfileContent({ onBack, showNavbar = false, onOpenFavorites }) {
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
        {onOpenFavorites && <View style={styles.favorites}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Cây yêu thích</Text>
          <List.Item title="Cây yêu thích của tôi" onPress={onOpenFavorites}
            disabled={profile.isLoggingOut} style={styles.favoriteLink}
            left={(props) => <List.Icon {...props} icon="heart-outline" color={colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.primary} />} />
        </View>}
        <ProfileLogout isLoggingOut={profile.isLoggingOut} saving={profile.saving}
          logoutError={profile.logoutError} handleLogout={profile.handleLogout} />
      </ScrollView>
      {showNavbar && <Navbar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  favorites: { marginTop: 20, marginBottom: 8, gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontWeight: "700" },
  favoriteLink: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  safeArea: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  navContent: { paddingBottom: 40 },
  content: { padding: 18, paddingBottom: 28, backgroundColor: "#FAFCFA" },
});
