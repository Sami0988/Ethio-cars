// common/components/buttons/ButtonGroup.tsx
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Button from "./Button";
import { BaseButtonProps } from "./types";

interface ButtonGroupProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

interface ButtonGroupItemProps extends BaseButtonProps {
  selected?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> & {
  Item: React.FC<ButtonGroupItemProps>;
} = ({ children, direction = "horizontal", spacing = 8, style }) => {
  const containerStyle: ViewStyle = {
    flexDirection: direction === "horizontal" ? "row" : "column",
    gap: spacing,
  };

  return <View style={[containerStyle, style]}>{children}</View>;
};

// Button Group Item Component
const ButtonGroupItem: React.FC<ButtonGroupItemProps> = ({
  selected = false,
  variant = selected ? "primary" : "outline",
  style,
  ...props
}) => {
  return (
    <Button variant={variant} style={[styles.groupItem, style]} {...props} />
  );
};

ButtonGroup.Item = ButtonGroupItem;

const styles = StyleSheet.create({
  groupItem: {
    flex: 1,
  },
});

export default ButtonGroup;
