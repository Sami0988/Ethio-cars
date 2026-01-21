import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/components/providers/ThemeProvider";
import { useAuthStore } from "../src/features/auth/auth.store";
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

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize auth state first
        await initializeAuth();

        const onboardingFlag = await webStorage.getItem("seen_onboarding");

        // Increased delay to ensure splash screen is visible
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check current auth state after initialization
        const currentState = useAuthStore.getState();

        // Only set initial route if it hasn't been set yet
        if (!initialRoute) {
          if (currentState.isAuthenticated) {
            // User is authenticated, always go to home tabs (priority over onboarding)
            setInitialRoute("/(tabs)");
          } else if (!onboardingFlag) {
            setInitialRoute("/onboarding");
          } else {
            // User not authenticated, go to login
            setInitialRoute("/(auth)/login");
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setInitialRoute("/(auth)/login"); // Default to login on error
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // Remove dependencies - only run once on mount

  // Listen for auth state changes after initial load
  useEffect(() => {
    if (initialRoute && !loading) {
      if (isAuthenticated && initialRoute !== "/(tabs)") {
        // User just logged in, redirect to tabs
        setInitialRoute("/(tabs)");
      } else if (!isAuthenticated && initialRoute === "/(tabs)") {
        // User just logged out, check onboarding status
        const checkOnboarding = async () => {
          const onboardingFlag = await webStorage.getItem("seen_onboarding");
          if (onboardingFlag) {
            setInitialRoute("/(auth)/login");
          } else {
            setInitialRoute("/onboarding");
          }
        };
        checkOnboarding();
      }
    }
  }, [isAuthenticated, initialRoute, loading]);

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
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
            }}
            edges={["top", "left", "right"]}
          >
            <Stack screenOptions={{ headerShown: false }} />
            {initialRoute && <Redirect href={initialRoute} />}
          </SafeAreaView>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
