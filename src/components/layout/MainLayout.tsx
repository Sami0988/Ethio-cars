import React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import HomeScreen from "../../screens/HomeScreen";
import Screen from "../common/Screen";

const MainLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <Screen
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeScreen />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainLayout;
