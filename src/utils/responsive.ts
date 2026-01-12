import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Screen size breakpoints
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 768;
export const isLargeScreen = width >= 768;
export const isTablet = width >= 768;
export const isPhone = width < 768;

// Dynamic spacing based on screen size
export const getSpacing = (
  small: number,
  medium: number,
  large: number
): number => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Dynamic font size based on screen size
export const getFontSize = (
  small: number,
  medium: number,
  large: number
): number => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Dynamic dimensions
export const getDynamicWidth = (
  small: number,
  medium: number,
  large: number
): number => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

export const getDynamicHeight = (
  small: number,
  medium: number,
  large: number
): number => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Common responsive values
export const commonSpacing = {
  container: getSpacing(16, 20, 24),
  card: getSpacing(12, 16, 20),
  section: getSpacing(20, 24, 32),
  small: getSpacing(8, 12, 16),
  medium: getSpacing(12, 16, 20),
  large: getSpacing(16, 24, 32),
};

export const commonFontSizes = {
  small: getFontSize(12, 14, 16),
  medium: getFontSize(14, 16, 18),
  large: getFontSize(16, 18, 20),
  xlarge: getFontSize(18, 20, 24),
  title: getFontSize(20, 24, 28),
  heading: getFontSize(24, 28, 32),
};
