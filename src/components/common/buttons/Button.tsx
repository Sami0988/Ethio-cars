// common/components/buttons/Button.tsx
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BaseButtonProps } from "./types";

const Button: React.FC<BaseButtonProps & TouchableOpacityProps> = ({
  children,
  label,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  shape = "rounded",
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  labelStyle,
  iconStyle,
  pressed = false,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  testID,
  ...rest
}) => {
  const theme = useTheme();

  // Get variant styles
  const getVariantStyles = () => {
    const base = {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    };

    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.primary,
          borderColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.primary,
          borderWidth: 0,
        };
      case "secondary":
        return {
          backgroundColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.secondary,
          borderColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.secondary,
          borderWidth: 0,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: disabled
            ? theme.colors.surfaceDisabled
            : theme.colors.outline,
          borderWidth: 1,
        };
      case "text":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
        };
      case "danger":
        return {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : "#DC2626",
          borderColor: disabled ? theme.colors.surfaceDisabled : "#DC2626",
          borderWidth: 0,
        };
      case "success":
        return {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : "#10B981",
          borderColor: disabled ? theme.colors.surfaceDisabled : "#10B981",
          borderWidth: 0,
        };
      case "warning":
        return {
          backgroundColor: disabled ? theme.colors.surfaceDisabled : "#F59E0B",
          borderColor: disabled ? theme.colors.surfaceDisabled : "#F59E0B",
          borderWidth: 0,
        };
      case "ghost":
        return {
          backgroundColor: pressed
            ? theme.colors.surfaceVariant
            : "transparent",
          borderColor: "transparent",
          borderWidth: 0,
        };
      default:
        return base;
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case "xs":
        return { paddingVertical: 4, paddingHorizontal: 12, height: 32 };
      case "sm":
        return { paddingVertical: 6, paddingHorizontal: 16, height: 36 };
      case "md":
        return { paddingVertical: 8, paddingHorizontal: 20, height: 44 };
      case "lg":
        return { paddingVertical: 10, paddingHorizontal: 24, height: 48 };
      case "xl":
        return { paddingVertical: 12, paddingHorizontal: 28, height: 56 };
      default:
        return { paddingVertical: 8, paddingHorizontal: 20, height: 44 };
    }
  };

  // Get shape styles
  const getShapeStyles = () => {
    switch (shape) {
      case "square":
        return { borderRadius: 4 };
      case "rounded":
        return { borderRadius: 8 };
      case "pill":
        return { borderRadius: 999 };
      case "circle":
        return { borderRadius: 999, width: getSizeStyles().height };
      default:
        return { borderRadius: 8 };
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case "primary":
      case "secondary":
      case "danger":
      case "success":
      case "warning":
        return disabled ? theme.colors.onSurfaceDisabled : "#FFFFFF";
      case "outline":
      case "text":
      case "ghost":
        return disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary;
      default:
        return disabled
          ? theme.colors.onSurfaceDisabled
          : theme.colors.onPrimary;
    }
  };

  // Get text size
  const getTextSize = () => {
    switch (size) {
      case "xs":
        return 12;
      case "sm":
        return 14;
      case "md":
        return 16;
      case "lg":
        return 18;
      case "xl":
        return 20;
      default:
        return 16;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const shapeStyles = getShapeStyles();
  const textColor = getTextColor();
  const textSize = getTextSize();

  const buttonStyles = [
    styles.button,
    variantStyles,
    sizeStyles,
    shapeStyles,
    fullWidth && styles.fullWidth,
    pressed && styles.pressed,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: textColor,
      fontSize: textSize,
      fontWeight: variant === "text" ? "400" : "500",
    } as TextStyle,
    labelStyle,
  ];

  const iconSizeMap = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };
  const iconSize = iconSizeMap[(size || "md") as keyof typeof iconSizeMap];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "text" || variant === "ghost"
              ? theme.colors.primary
              : "#FFFFFF"
          }
        />
      );
    }

    const content = children || (
      <View style={styles.content}>
        {icon && iconPosition === "left" && (
          <MaterialCommunityIcons
            name={icon as string}
            size={iconSize}
            color={(iconStyle as any)?.color || textColor}
            style={[styles.icon, iconStyle, { marginRight: 8 }]}
          />
        )}
        <Text style={textStyles} numberOfLines={1}>
          {label}
        </Text>
        {icon && iconPosition === "right" && (
          <MaterialCommunityIcons
            name={icon as string}
            size={iconSize}
            color={(iconStyle as any)?.color || textColor}
            style={[styles.icon, iconStyle, { marginLeft: 8 }]}
          />
        )}
      </View>
    );

    return content;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || label}
      testID={testID}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontWeight: "500",
  },
  icon: {
    margin: 0,
  },
});

export default Button;
