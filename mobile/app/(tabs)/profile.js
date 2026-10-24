import React from "react";
import { useRouter } from "expo-router";
import ProfileContent from "../../src/components/profile/ProfileContent";

export default function CustomerProfileRoute() {
  const router = useRouter();
  return <ProfileContent onBack={() => router.navigate("/(tabs)")} showNavbar />;
}
