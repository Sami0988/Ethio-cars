import React from "react";
import { IconButton } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useThemeStore } from "../../features/theme/theme.store";

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <IconButton
      icon={({ size, color }) => (
        <MaterialCommunityIcons
          name={isDarkMode ? "weather-sunny" : "weather-night"}
          size={size}
          color={color}
        />
      )}
      size={24}
      onPress={toggleTheme}
      mode="contained-tonal"
    />
  );
};
