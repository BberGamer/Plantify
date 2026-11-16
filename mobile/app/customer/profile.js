import React from "react";
import { useRouter } from "expo-router";
import ProfileContent from "../../src/components/profile/ProfileContent";

export default function CustomerProfileRoute() {
  const router = useRouter();
  return (
    <ProfileContent onBack={() => router.navigate("/customer/home")} showNavbar
      onOpenFavorites={() => router.push("/customer/favorites")}
      onOpenDiagnosisHistory={() => router.push("/customer/diagnosis-history")}
      onOpenFinance={(section) => router.push({ vip: "/customer/vip", wallet: "/customer/wallet", history: "/customer/transactions" }[section])} />
  );
}
