// common/components/buttons/styles.ts
import { StyleSheet } from "react-native";

export const buttonStyles = StyleSheet.create({
  // Reusable styles for customizations
  shadow: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shadowLarge: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  pressedEffect: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

export const buttonVariants = {
  primary: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
    color: "#FFFFFF",
  },
  secondary: {
    backgroundColor: "#6B7280",
    borderColor: "#6B7280",
    color: "#FFFFFF",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB",
    color: "#374151",
  },
  text: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    color: "#3B82F6",
  },
};
