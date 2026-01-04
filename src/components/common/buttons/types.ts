// common/components/buttons/types.ts
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "text"
  | "danger"
  | "success"
  | "warning"
  | "ghost";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonShape = "square" | "rounded" | "pill" | "circle";

export interface BaseButtonProps {
  // Content
  children?: React.ReactNode;
  label?: string;
  icon?: IconSource;
  iconPosition?: "left" | "right";

  // Styling
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;

  // Custom styles
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<TextStyle>;

  // States
  pressed?: boolean;

  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;

  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
}

export interface IconButtonProps extends Omit<
  BaseButtonProps,
  "children" | "label"
> {
  icon: IconSource;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface FloatingButtonProps extends Omit<
  BaseButtonProps,
  "children" | "label"
> {
  icon: IconSource;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export interface ActionButtonProps extends BaseButtonProps {
  actions?: Array<{
    icon: IconSource;
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
  }>;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}
