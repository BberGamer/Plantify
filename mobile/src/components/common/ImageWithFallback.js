import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

// Chỉ dùng cho ảnh công khai/local; luồng tải ảnh riêng tư giữ ở domain.
export default function ImageWithFallback({ uri, style, accessibilityLabel, resizeMode = "cover",
  placeholderIcon = "image-outline", placeholderLabel = "Ảnh chưa khả dụng" }) {
  const [failedUri, setFailedUri] = useState(null);
  if (!uri || failedUri === uri) return <View style={[style, styles.placeholder]} accessible accessibilityLabel={placeholderLabel}>
    <Ionicons name={placeholderIcon} size={32} color={colors.primaryLight} />
  </View>;
  return <Image source={{ uri }} style={style} resizeMode={resizeMode}
    accessibilityLabel={accessibilityLabel} onError={() => setFailedUri(uri)} />;
}
const styles = StyleSheet.create({ placeholder: { backgroundColor: colors.lightMint,
  alignItems: "center", justifyContent: "center" } });
