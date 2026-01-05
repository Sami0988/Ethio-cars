import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import HomeScreen from "../../screens/HomeScreen";

const MainLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainLayout;
