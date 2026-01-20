import { useAuthStore } from "@/src/features/auth/auth.store";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EditProfilePage from "../editProfile";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../../src/components/common/Screen";
import { Button, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";


export default function ProfileTab() {
  const { isAuthenticated } = useAuthStore();
    const theme = useTheme();
      const router = useRouter();
    

  // Early return if not authenticated
  if (!isAuthenticated) {
    return (
      <Screen
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.signInPrompt}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={80}
            color={theme.colors.onBackground}
          />
          <Text
            style={[styles.signInTitle, { color: theme.colors.onBackground }]}
          >
            Please signup or login first
          </Text>
          <Text
            style={[
              styles.signInSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Sign in to manage your account and access all features
          </Text>
          <Button
            mode="contained"
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/(auth)/login")}
            textColor={theme.colors.onPrimary}
          >
            Sign In
          </Button>
        </View>
      </Screen>
    );
  }

  // Show EditProfile component directly within the tab
  return <EditProfilePage />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
  },
  signInPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  signInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  signInButton: {
    borderRadius: 10,
  },
});
