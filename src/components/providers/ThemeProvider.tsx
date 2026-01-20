import React from "react";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

// Custom black/white light theme
const CustomLightTheme = {
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

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <PaperProvider theme={CustomLightTheme}>{children}</PaperProvider>;
};
