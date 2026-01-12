import React from "react";
import { StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Screen from "../../components/common/Screen";

const MessagesScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <Screen
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <MaterialCommunityIcons
        name="message-text"
        size={64}
        color={theme.colors.primary}
      />
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Messages
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Chat with buyers and sellers about your listings
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
});

export default MessagesScreen;
