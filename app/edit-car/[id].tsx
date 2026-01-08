import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import EditCarScreen from "../../src/screens/EditCarScreen";

export default function EditCarRoute() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <EditCarScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
