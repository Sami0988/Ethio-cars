import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { authService } from "./auth.service";
import { useAuthStore } from "./auth.store";
import { LoginRequest } from "./auth.types";

// Login Mutation Hook
export const useLogin = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      Alert.alert("Login Error", error.message || "Failed to login");
    },
  });
};

// Logout Mutation Hook
export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      // Show logout success message
      Alert.alert(
        "Success",
        "Logout successful! Redirecting to home screen...",
      );
      setTimeout(() => {
        router.replace("/(tabs)"); // Redirect to home screen instead of login
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      logout();
      router.replace("/(tabs)"); // Redirect to home screen instead of login
    },
  });
};
