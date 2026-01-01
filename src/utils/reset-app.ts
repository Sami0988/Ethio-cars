import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const resetApp = async () => {
  try {
    // Clear all storage keys
    const keys = [
      "seen_onboarding",
      "auth_token",
      "refresh_token",
      "user_data",
      "auth-storage", // Zustand persist key
    ];

    if (Platform.OS === "web") {
      // Clear localStorage on web
      keys.forEach((key) => localStorage.removeItem(key));
    } else {
      // Clear SecureStore on native
      for (const key of keys) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          // Key might not exist, that's okay
          console.log(`Key ${key} not found or already cleared`);
        }
      }
    }

    console.log("App storage cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing app storage:", error);
    return false;
  }
};
