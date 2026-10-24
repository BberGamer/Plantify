import { MD3LightTheme } from "react-native-paper";
import { colors } from "./colors";
import { radius, typography } from "./tokens";

export const paperTheme = {
  ...MD3LightTheme,
  roundness: radius.sm,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.lightMint,
    onPrimaryContainer: colors.textPrimary,
    secondary: colors.primaryLight,
    background: colors.background,
    surface: colors.white,
    surfaceVariant: colors.softSproutBg,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.inputBorder,
    error: colors.statusError,
    onError: colors.white,
    errorContainer: colors.errorBackground,
    onErrorContainer: colors.statusError,
    surfaceDisabled: colors.borderLight,
    onSurfaceDisabled: colors.textMuted,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, ...typography.body },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, ...typography.label },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, ...typography.title },
  },
};
