import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SplashScreen as EthioSplash } from "../src/screens/SplashScreen";
import { useAuthStore } from "../src/stores/auth.store";

type InitialRoute = "/onboarding" | "/(auth)/login" | "/(tabs)";

// Fallback for web platform
const webStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      return localStorage.setItem(key, value);
    }
    return await SecureStore.setItem(key, value);
  },
};

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const onboardingFlag = await webStorage.getItem("seen_onboarding");

        // Small delay to allow auth store to hydrate from persist
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!onboardingFlag) {
          setInitialRoute("/onboarding");
        } else if (!isAuthenticated) {
          setInitialRoute("/(auth)/login");
        } else {
          setInitialRoute("/(tabs)");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setInitialRoute("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isAuthenticated]);

  // While deciding, show splash once
  if (loading || !initialRoute) {
    return <EthioSplash />;
  }

  // After decision, render app stack and perform a single redirect
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Redirect href={initialRoute} />
    </>
  );
}
