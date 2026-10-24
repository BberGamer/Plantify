import { useState } from "react";
import { TextInput } from "react-native-paper";
import FormField from "./FormField";

// Hiện/ẩn thuộc control; giá trị mật khẩu chỉ thuộc draft của caller.
export default function PasswordField({ onChange, disabled, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField
      {...props}
      onChangeText={onChange}
      secureTextEntry={!visible}
      disabled={disabled}
      autoCapitalize="none"
      autoCorrect={false}
      right={
        <TextInput.Icon
          icon={visible ? "eye-off-outline" : "eye-outline"}
          accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          disabled={disabled}
          forceTextInputFocus={false}
          onPress={() => { if (!disabled) setVisible((previous) => !previous); }}
        />
      }
    />
  );
}
