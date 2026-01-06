// features/theme/theme.service.ts
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { ThemeMode } from "./theme.types";

// Custom black/white light theme
export const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#000000",
    onPrimary: "#FFFFFF",
    primaryContainer: "#000000",
    onPrimaryContainer: "#FFFFFF",
    secondary: "#000000",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#000000",
    onSecondaryContainer: "#FFFFFF",
    tertiary: "#000000",
    onTertiary: "#FFFFFF",
    surface: "#FFFFFF",
    onSurface: "#000000",
    surfaceVariant: "#F5F5F5",
    onSurfaceVariant: "#000000",
    background: "#FFFFFF",
    onBackground: "#000000",
    error: "#000000",
    onError: "#FFFFFF",
    errorContainer: "#000000",
    onErrorContainer: "#FFFFFF",
    outline: "#CCCCCC",
    outlineVariant: "#DDDDDD",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#000000",
    inverseOnSurface: "#FFFFFF",
    inversePrimary: "#FFFFFF",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#FFFFFF",
      level3: "#FFFFFF",
      level4: "#FFFFFF",
      level5: "#FFFFFF",
    },
  },
};

// Custom black/white dark theme
export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FFFFFF",
    onPrimary: "#000000",
    primaryContainer: "#FFFFFF",
    onPrimaryContainer: "#000000",
    secondary: "#FFFFFF",
    onSecondary: "#000000",
    secondaryContainer: "#FFFFFF",
    onSecondaryContainer: "#000000",
    tertiary: "#FFFFFF",
    onTertiary: "#000000",
    surface: "#4a4a4a",
    onSurface: "#FFFFFF",
    surfaceVariant: "#5a5a5a",
    onSurfaceVariant: "#FFFFFF",
    background: "#3a3a3a",
    onBackground: "#FFFFFF",
    error: "#FFFFFF",
    onError: "#000000",
    errorContainer: "#FFFFFF",
    onErrorContainer: "#000000",
    outline: "#333333",
    outlineVariant: "#222222",
    shadow: "#FFFFFF",
    scrim: "#FFFFFF",
    inverseSurface: "#FFFFFF",
    inverseOnSurface: "#000000",
    inversePrimary: "#000000",
    elevation: {
      level0: "transparent",
      level1: "#4a4a4a",
      level2: "#4a4a4a",
      level3: "#4a4a4a",
      level4: "#4a4a4a",
      level5: "#4a4a4a",
    },
  },
};

export const getTheme = (mode: ThemeMode) => {
  if (mode === "dark") return CustomDarkTheme;
  if (mode === "light") return CustomLightTheme;

  // For system mode, check device preference
  // For now, default to light
  return CustomLightTheme;
};
