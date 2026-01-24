import { Dimensions, Platform } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Screen size breakpoints
export const SCREEN_SIZES = {
  SMALL_PHONE: 320, // iPhone SE
  PHONE: 375, // iPhone 12/13
  LARGE_PHONE: 414, // iPhone 12/13 Pro Max
  SMALL_TABLET: 768, // iPad Mini
  TABLET: 1024, // iPad
  LARGE_TABLET: 1366, // iPad Pro
  DESKTOP: 1920, // Standard desktop
};

// Get current screen size category
export const getScreenSize = (width = screenWidth) => {
  if (width < SCREEN_SIZES.PHONE) return "SMALL_PHONE";
  if (width < SCREEN_SIZES.LARGE_PHONE) return "PHONE";
  if (width < SCREEN_SIZES.SMALL_TABLET) return "LARGE_PHONE";
  if (width < SCREEN_SIZES.TABLET) return "SMALL_TABLET";
  if (width < SCREEN_SIZES.LARGE_TABLET) return "TABLET";
  if (width < SCREEN_SIZES.DESKTOP) return "LARGE_TABLET";
  return "DESKTOP";
};

// Responsive scaling factors
export const getScaleFactors = (width = screenWidth) => {
  const screenSize = getScreenSize(width);

  const baseSize = SCREEN_SIZES.PHONE; // 375 as base
  const scaleFactor = width / baseSize;

  return {
    scaleFactor,
    screenSize,
    isSmallPhone: screenSize === "SMALL_PHONE",
    isPhone: screenSize === "PHONE",
    isLargePhone: screenSize === "LARGE_PHONE",
    isSmallTablet: screenSize === "SMALL_TABLET",
    isTablet: screenSize === "TABLET",
    isLargeTablet: screenSize === "LARGE_TABLET",
    isDesktop: screenSize === "DESKTOP",
    isMobile: ["SMALL_PHONE", "PHONE", "LARGE_PHONE"].includes(screenSize),
    isTabletDevice: ["SMALL_TABLET", "TABLET", "LARGE_TABLET"].includes(
      screenSize,
    ),
  };
};

// Responsive font sizes
export const getResponsiveFontSize = (
  baseSize: number,
  width = screenWidth,
) => {
  const { scaleFactor } = getScaleFactors(width);

  // Scale font sizes but with limits
  const scaledSize = baseSize * scaleFactor;
  const minSize = baseSize * 0.75;
  const maxSize = baseSize * 1.5;

  return Math.min(Math.max(scaledSize, minSize), maxSize);
};

// Responsive spacing
export const getResponsiveSpacing = (
  baseSpacing: number,
  width = screenWidth,
) => {
  const { scaleFactor } = getScaleFactors(width);

  // Scale spacing but with limits
  const scaledSpacing = baseSpacing * scaleFactor;
  const minSpacing = baseSpacing * 0.5;
  const maxSpacing = baseSpacing * 2;

  return Math.min(Math.max(scaledSpacing, minSpacing), maxSpacing);
};

// Responsive dimensions
export const getResponsiveDimension = (
  baseDimension: number,
  width = screenWidth,
) => {
  const { scaleFactor } = getScaleFactors(width);

  // Scale dimensions but with limits
  const scaledDimension = baseDimension * scaleFactor;
  const minDimension = baseDimension * 0.8;
  const maxDimension = baseDimension * 1.5;

  return Math.min(Math.max(scaledDimension, minDimension), maxDimension);
};

// Grid columns for different screen sizes
export const getGridColumns = (width = screenWidth) => {
  const { screenSize } = getScaleFactors(width);

  switch (screenSize) {
    case "SMALL_PHONE":
      return 1;
    case "PHONE":
      return 2;
    case "LARGE_PHONE":
      return 2;
    case "SMALL_TABLET":
      return 3;
    case "TABLET":
      return 4;
    case "LARGE_TABLET":
      return 4;
    case "DESKTOP":
      return 6;
    default:
      return 2;
  }
};

// Card width calculation
export const getCardWidth = (
  columns: number,
  gap: number = 16,
  padding: number = 20,
  width = screenWidth,
) => {
  const totalGap = (columns - 1) * gap;
  const totalPadding = padding * 2;
  const availableWidth = width - totalGap - totalPadding;
  return availableWidth / columns;
};

// Responsive padding
export const getResponsivePadding = (width = screenWidth) => {
  const { screenSize } = getScaleFactors(width);

  switch (screenSize) {
    case "SMALL_PHONE":
      return 12;
    case "PHONE":
      return 16;
    case "LARGE_PHONE":
      return 20;
    case "SMALL_TABLET":
      return 24;
    case "TABLET":
      return 32;
    case "LARGE_TABLET":
      return 40;
    case "DESKTOP":
      return 48;
    default:
      return 16;
  }
};

// Responsive border radius
export const getResponsiveBorderRadius = (
  baseRadius: number,
  width = screenWidth,
) => {
  const { scaleFactor } = getScaleFactors(width);
  return baseRadius * Math.min(scaleFactor, 1.2);
};

// Platform-specific adjustments
export const getPlatformAdjustments = () => ({
  statusBarHeight: Platform.OS === "ios" ? 44 : 24,
  bottomTabHeight: Platform.OS === "ios" ? 83 : 56,
  keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 20,
});

// Export common responsive values
export const useResponsiveValues = (width = screenWidth) => {
  const {
    scaleFactor,
    screenSize,
    isSmallPhone,
    isPhone,
    isLargePhone,
    isSmallTablet,
    isTablet,
    isLargeTablet,
    isDesktop,
    isMobile,
    isTabletDevice,
  } = getScaleFactors(width);

  const padding = getResponsivePadding(width);
  const gridColumns = getGridColumns(width);

  return {
    // Screen info
    width,
    height: screenHeight,
    screenSize,
    scaleFactor,

    // Booleans
    isSmallPhone,
    isPhone,
    isLargePhone,
    isSmallTablet,
    isTablet,
    isLargeTablet,
    isDesktop,
    isMobile,
    isTabletDevice,

    // Common values
    padding,
    gridColumns,

    // Font sizes
    fontSize: {
      xs: getResponsiveFontSize(12, width),
      s: getResponsiveFontSize(14, width),
      m: getResponsiveFontSize(16, width),
      l: getResponsiveFontSize(18, width),
      xl: getResponsiveFontSize(20, width),
      xxl: getResponsiveFontSize(24, width),
      xxxl: getResponsiveFontSize(32, width),
    },

    // Spacing
    spacing: {
      xs: getResponsiveSpacing(4, width),
      s: getResponsiveSpacing(8, width),
      m: getResponsiveSpacing(16, width),
      l: getResponsiveSpacing(24, width),
      xl: getResponsiveSpacing(32, width),
      xxl: getResponsiveSpacing(48, width),
    },

    // Dimensions
    dimension: {
      buttonHeight: getResponsiveDimension(48, width),
      cardMinHeight: getResponsiveDimension(120, width),
      inputHeight: getResponsiveDimension(56, width),
      iconSize: getResponsiveDimension(24, width),
    },

    // Border radius
    borderRadius: {
      small: getResponsiveBorderRadius(8, width),
      medium: getResponsiveBorderRadius(12, width),
      large: getResponsiveBorderRadius(16, width),
      xl: getResponsiveBorderRadius(20, width),
    },
  };
};

// Listen for dimension changes
export const { addEventListener: addDimensionChangeListener } = Dimensions;
