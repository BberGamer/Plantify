import React from "react";
import { useRouter } from "expo-router";
import ProfileContent from "../../src/components/profile/ProfileContent";

export default function AdminProfileRoute() {
  const router = useRouter();
  return (
    <ProfileContent
      onBack={() => router.navigate("/admin")}
      showNavbar={false}
    />
  );
}
