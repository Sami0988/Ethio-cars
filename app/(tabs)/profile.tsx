import { useAuthStore } from "@/src/features/auth/auth.store";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EditProfilePage from "../editProfile";

export default function ProfileTab() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Sign up first</Text>
      </View>
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
});
