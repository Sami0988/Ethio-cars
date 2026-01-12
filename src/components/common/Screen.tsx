import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentContainerStyle?: ViewStyle | ViewStyle[];
  edges?: Array<"top" | "bottom" | "left" | "right">;
};

const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  contentContainerStyle,
  edges = ["top", "bottom", "left", "right"],
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={edges}
    >
      <View style={[styles.container, style]}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { flex: 1 },
});

export default Screen;
