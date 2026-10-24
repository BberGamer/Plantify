// OtpInput.js - Sáu ô nhập OTP, tự chuyển focus và hỗ trợ dán mã.
import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/tokens";

export default function OtpInput({ value, onChange, disabled = false }) {
  const inputs = useRef([]);
  const [focused, setFocused] = useState(null);
  const digits = Array.from({ length: 6 }, (_, index) =>
    /\d/.test(value[index] || "") ? value[index] : "",
  );
  const changeDigit = (text, index) => {
    if (disabled) return;
    const numeric = text.replace(/\D/g, "");
    if (text && !numeric) return;
    const next = [...digits];
    numeric
      .slice(0, 6 - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    if (!numeric) next[index] = "";
    // Giữ vị trí các chữ số phía sau khi người dùng xóa một ô ở giữa.
    onChange(next.map((digit) => digit || " ").join("").trimEnd());
    if (numeric) inputs.current[Math.min(index + numeric.length, 5)]?.focus();
  };
  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(input) => {
            inputs.current[index] = input;
          }}
          style={[
            styles.input,
            Boolean(digit) && styles.filled,
            focused === index && styles.focused,
            disabled && styles.disabled,
          ]}
          value={digit}
          editable={!disabled}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          onFocus={() => setFocused(index)}
          onBlur={() => setFocused(null)}
          maxLength={6}
          selectTextOnFocus
          accessibilityLabel={`Chữ số mã xác thực ${index + 1}`}
          onChangeText={(text) => changeDigit(text, index)}
          onKeyPress={({ nativeEvent }) => {
            if (disabled) return;
            if (nativeEvent.key === "Backspace" && !digit && index > 0)
              inputs.current[index - 1]?.focus();
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginVertical: spacing.sm,
  },
  input: {
    flex: 1,
    maxWidth: 48,
    minHeight: 50,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: radius.sm,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  filled: { borderColor: colors.primary, backgroundColor: colors.softSproutBg },
  focused: { borderColor: colors.primary, borderWidth: 2 },
  disabled: { backgroundColor: colors.background, color: colors.textMuted },
});
