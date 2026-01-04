// common/components/buttons/IconButton.tsx
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Button from "./Button";
import { IconButtonProps } from "./types";

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "md",
  variant = "primary",
  shape = "circle",
  style,
  iconStyle,
  ...props
}) => {
  const theme = useTheme();

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case "xs":
        return 16;
      case "sm":
        return 20;
      case "md":
        return 24;
      case "lg":
        return 28;
      case "xl":
        return 32;
      default:
        return 24;
    }
  };

  // Get button size for circle shape
  const getButtonSize = () => {
    switch (size) {
      case "xs":
        return 32;
      case "sm":
        return 40;
      case "md":
        return 48;
      case "lg":
        return 56;
      case "xl":
        return 64;
      default:
        return 48;
    }
  };

  const iconSize = getIconSize();
  const buttonSize = getButtonSize();

  const circleStyle: ViewStyle = {
    width: buttonSize,
    height: buttonSize,
    padding: 0,
  };

  return (
    <Button
      shape={shape}
      size={size}
      variant={variant}
      icon={icon}
      style={[shape === "circle" && circleStyle, style]}
      iconStyle={[styles.icon, iconStyle]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    margin: 0,
  },
});

export default IconButton;
