import React from "react";
import { PaperProvider } from "react-native-paper";
import { useThemeStore } from "../../features/theme/theme.store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get the theme object from your store
  const { theme } = useThemeStore();

  // No need for useEffect - the store already handles the theme mode
  // The theme object is already computed based on themeMode

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
