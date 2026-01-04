// common/components/buttons/SocialButton.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Button from "./Button";
import { BaseButtonProps } from "./types";

export type SocialProvider = "google" | "facebook" | "apple" | "twitter";

interface SocialButtonProps extends Omit<BaseButtonProps, "icon"> {
  provider: SocialProvider;
  iconName?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  iconName,
  variant = "outline",
  label,
  style,
  ...props
}) => {
  const theme = useTheme();

  const getProviderConfig = () => {
    const configs = {
      google: {
        label: label || "Continue with Google",
        iconName: iconName || "google",
        color: "#4285F4",
        textColor: "#3C4043",
      },
      facebook: {
        label: label || "Continue with Facebook",
        iconName: iconName || "facebook",
        color: "#1877F2",
        textColor: "#FFFFFF",
      },
      apple: {
        label: label || "Continue with Apple",
        iconName: iconName || "apple",
        color: "#000000",
        textColor: "#FFFFFF",
      },
      twitter: {
        label: label || "Continue with Twitter",
        iconName: iconName || "twitter",
        color: "#1DA1F2",
        textColor: "#FFFFFF",
      },
    };

    return configs[provider];
  };

  const config = getProviderConfig();

  const renderIcon = () => {
    return (
      <MaterialCommunityIcons
        name={config.iconName}
        size={20}
        color={variant === "outline" ? config.color : config.textColor}
        style={styles.socialIcon}
      />
    );
  };

  return (
    <Button
      variant={variant}
      icon={renderIcon as any}
      iconPosition="left"
      label={config.label}
      style={[
        styles.socialButton,
        variant === "outline" && { borderColor: config.color },
        variant === "primary" && { backgroundColor: config.color },
        style,
      ]}
      labelStyle={[
        styles.socialLabel,
        variant === "primary" && { color: config.textColor },
        variant === "outline" && { color: config.textColor || config.color },
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  socialButton: {
    marginVertical: 4,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialLabel: {
    flex: 1,
    textAlign: "center",
  },
});

export default SocialButton;
