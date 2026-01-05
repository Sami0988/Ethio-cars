// components/ThemeWrapper.tsx
import React, { ReactNode } from "react";
import { PaperProvider } from "react-native-paper";
import { useThemeStore } from "../../features/theme/theme.store";

interface ThemeWrapperProps {
  children: ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { theme } = useThemeStore();

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
