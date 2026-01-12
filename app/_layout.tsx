import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/components/providers/ThemeProvider";
import { useAuthStore } from "../src/features/auth/auth.store";
import { useThemeStore } from "../src/features/theme/theme.store";
import { SplashScreen as EthioSplash } from "../src/screens/SplashScreen";
import "./safeAreaTrace";

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

// Themed wrapper component
const ThemedSafeArea = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode } = useThemeStore();
  const backgroundColor = isDarkMode ? "#121212" : "#FFFFFF";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
      }}
      edges={["top", "left", "right"]}
    >
      {children}
    </SafeAreaView>
  );
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
    return (
      <SafeAreaProvider>
        <EthioSplash />
      </SafeAreaProvider>
    );
  }

  // After decision, render app stack and perform a single redirect
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedSafeArea>
            <Stack screenOptions={{ headerShown: false }} />
            <Redirect href={initialRoute} />
          </ThemedSafeArea>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
