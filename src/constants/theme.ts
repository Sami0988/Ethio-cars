import { MD3LightTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#3B82F6",
    secondary: "#10B981",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    onSurface: "#1F2937",
    onBackground: "#1F2937",
    text: "#1F2937",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    error: "#EF4444",
    outline: "#E5E7EB",
    outlineVariant: "#F3F4F6",
    surfaceVariant: "#F9FAFB",
    onSurfaceVariant: "#6B7280",
  },
};

export const customColors = {
  light: {
    cardBg: "#FFFFFF",
    borderColor: "#E5E7EB",
    placeholderBg: "#F3F4F6",
    placeholderText: "#9CA3AF",
    urgentBadge: "#EF4444",
    verifiedBadge: "#10B981",
    priceTagBg: "rgba(0, 0, 0, 0.8)",
    welcomeBannerBg: "rgba(255, 255, 255, 0.8)",
  },
};
