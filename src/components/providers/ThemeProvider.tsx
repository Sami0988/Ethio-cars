import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { useThemeStore } from "../../features/theme/theme.store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themeMode, setThemeMode, getTheme } = useThemeStore();

  useEffect(() => {
    // Set initial theme based on stored preference
    if (themeMode === "system") {
      // You can use Appearance API here to detect system theme
      // For now, default to light
      setThemeMode("light");
    }
  }, [themeMode, setThemeMode]);

  const theme = getTheme();

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
