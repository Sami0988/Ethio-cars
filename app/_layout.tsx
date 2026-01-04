import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { ThemeProvider } from "../src/components/providers/ThemeProvider";
import { useAuthStore } from "../src/features/auth/auth.store";
import { SplashScreen as EthioSplash } from "../src/screens/SplashScreen";

type InitialRoute = "/onboarding" | "/(auth)/login" | "/(tabs)";

// Create a client
const queryClient = new QueryClient();

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
        } else {
          // After onboarding, go directly to home tabs
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Redirect href={initialRoute} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
