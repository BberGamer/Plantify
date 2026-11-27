import { Platform } from "react-native";
import { configureFonts, MD3LightTheme } from "react-native-paper";
import { colors } from "./colors";
import { radius, typography } from "./tokens";

const fonts = Platform.OS === "web"
  ? configureFonts({ config: { fontFamily: 'system-ui, "Segoe UI", Roboto, Arial, sans-serif' } })
  : MD3LightTheme.fonts;

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
    secondaryContainer: colors.lightMint,
    onSecondaryContainer: colors.primary,
    tertiary: colors.info,
    tertiaryContainer: colors.infoBackground,
    onTertiaryContainer: colors.info,
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
    backdrop: colors.overlay,
    elevation: {
      level0: "transparent",
      level1: colors.white,
      level2: colors.white,
      level3: colors.white,
      level4: colors.softSproutBg,
      level5: colors.softSproutBg,
    },
  },
  fonts: {
    ...fonts,
    bodyLarge: { ...fonts.bodyLarge, ...typography.body },
    labelLarge: { ...fonts.labelLarge, ...typography.label },
    titleLarge: { ...fonts.titleLarge, ...typography.title },
    bodyMedium: { ...fonts.bodyMedium, ...typography.body },
    bodySmall: { ...fonts.bodySmall, ...typography.caption },
    titleMedium: { ...fonts.titleMedium, ...typography.section },
    labelSmall: { ...fonts.labelSmall, ...typography.caption },
  },
};
