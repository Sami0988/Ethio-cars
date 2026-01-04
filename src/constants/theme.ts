import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

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

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#60A5FA",
    secondary: "#34D399",
    background: "#111827",
    surface: "#1F2937",
    onSurface: "#F9FAFB",
    onBackground: "#F9FAFB",
    text: "#F9FAFB",
    onPrimary: "#111827",
    onSecondary: "#111827",
    error: "#F87171",
    outline: "#374151",
    outlineVariant: "#4B5563",
    surfaceVariant: "#374151",
    onSurfaceVariant: "#D1D5DB",
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
  dark: {
    cardBg: "#1F2937",
    borderColor: "#374151",
    placeholderBg: "#374151",
    placeholderText: "#6B7280",
    urgentBadge: "#DC2626",
    verifiedBadge: "#059669",
    priceTagBg: "rgba(0, 0, 0, 0.9)",
    welcomeBannerBg: "rgba(31, 41, 55, 0.9)",
  },
};
