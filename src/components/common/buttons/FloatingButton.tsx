// common/components/buttons/FloatingButton.tsx
import React from "react";
import { StyleSheet, ViewStyle, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";

import { FloatingButtonProps } from "./types";
import IconButton from "./IconButton";

const { width, height } = Dimensions.get("window");

const FloatingButton: React.FC<FloatingButtonProps> = ({
  position = "bottom-right",
  style,
  ...props
}) => {
  const theme = useTheme();

  const getPositionStyle = (): ViewStyle => {
    const margin = 20;

    switch (position) {
      case "bottom-right":
        return {
          position: "absolute",
          bottom: margin,
          right: margin,
        };
      case "bottom-left":
        return {
          position: "absolute",
          bottom: margin,
          left: margin,
        };
      case "top-right":
        return {
          position: "absolute",
          top: margin,
          right: margin,
        };
      case "top-left":
        return {
          position: "absolute",
          top: margin,
          left: margin,
        };
      default:
        return {
          position: "absolute",
          bottom: margin,
          right: margin,
        };
    }
  };

  return (
    <IconButton
      size="lg"
      variant="primary"
      shape="circle"
      style={[styles.floatingButton, getPositionStyle(), style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default FloatingButton;
