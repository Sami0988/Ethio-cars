// common/components/buttons/ActionButton.tsx
import React, { useState } from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import FloatingButton from "./FloatingButton";
import IconButton from "./IconButton";
import { ActionButtonProps } from "./types";

const { width, height } = Dimensions.get("window");

const ActionButton: React.FC<ActionButtonProps> = ({
  icon = "plus",
  actions = [],
  position = "bottom-right",
  isOpen: controlledIsOpen,
  onToggle,
  ...props
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : isOpen;

  const toggle = () => {
    const newState = !open;

    if (!isControlled) {
      setIsOpen(newState);
    }

    onToggle?.(newState);

    Animated.timing(animation, {
      toValue: newState ? 1 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const renderActions = () => {
    return actions.map((action, index) => {
      const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -(index + 1) * 60],
      });

      const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.actionItem,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <View style={styles.actionLabelContainer}>
            <View style={styles.actionLabel}>
              <Animated.Text style={[styles.actionLabelText, { opacity }]}>
                {action.label}
              </Animated.Text>
            </View>
          </View>
          <IconButton
            icon={action.icon}
            variant={action.variant || "primary"}
            shape="circle"
            size="md"
            onPress={action.onPress}
            style={styles.actionButton}
          />
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {renderActions()}
      <FloatingButton
        icon={open ? "close" : icon}
        position={position}
        onPress={toggle}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "flex-end",
  },
  actionItem: {
    position: "absolute",
    right: 0,
    bottom: 60,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabelContainer: {
    marginRight: 8,
  },
  actionLabel: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  actionButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ActionButton;
