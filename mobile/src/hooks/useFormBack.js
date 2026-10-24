import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";

// Nút back của hệ thống và nút trong form có cùng chính sách bước/pending.
export default function useFormBack(onBack, pending) {
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!pending) onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack, pending]));
}
