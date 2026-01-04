import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "./auth.service";
import {
  AppUser,
  AuthActions,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "./auth.types";

// Platform detection for web vs native
const isWeb = typeof window !== "undefined" && window.localStorage;

// Storage configuration for Zustand persistence
const storage = {
  getItem: async (name: string) => {
    try {
      // Use localStorage on web, SecureStore on native platforms
      if (isWeb) {
        const value = localStorage.getItem(name);
        return value ? JSON.parse(value) : null;
      } else {
        // Check if SecureStore is available (native platforms)
        try {
          const value = await SecureStore.getItemAsync(name);
          return value ? JSON.parse(value) : null;
        } catch (secureStoreError) {
          // Fallback to localStorage if SecureStore fails
          console.warn(
            "SecureStore not available, falling back to localStorage:",
            secureStoreError
          );
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        }
      }
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  },
  setItem: async (name: string, value: any) => {
    try {
      // Use localStorage on web, SecureStore on native platforms
      if (isWeb) {
        localStorage.setItem(name, JSON.stringify(value));
      } else {
        // Check if SecureStore is available (native platforms)
        try {
          await SecureStore.setItemAsync(name, JSON.stringify(value));
        } catch (secureStoreError) {
          // Fallback to localStorage if SecureStore fails
          console.warn(
            "SecureStore not available, falling back to localStorage:",
            secureStoreError
          );
          localStorage.setItem(name, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error("Error writing to storage:", error);
    }
  },
  removeItem: async (name: string) => {
    try {
      // Use localStorage on web, SecureStore on native platforms
      if (isWeb) {
        localStorage.removeItem(name);
      } else {
        // Check if SecureStore is available (native platforms)
        try {
          await SecureStore.deleteItemAsync(name);
        } catch (secureStoreError) {
          // Fallback to localStorage if SecureStore fails
          console.warn(
            "SecureStore not available, falling back to localStorage:",
            secureStoreError
          );
          localStorage.removeItem(name);
        }
      }
    } catch (error) {
      console.error("Error removing from storage:", error);
    }
  },
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return Promise.resolve();
          } else {
            const errorMsg =
              response.error || response.message || "Login failed";
            set({
              isLoading: false,
              error: errorMsg,
            });
            return Promise.reject(new Error(errorMsg));
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Login failed",
          });
          return Promise.reject(error);
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return Promise.resolve();
          } else {
            const errorMsg =
              response.error || response.message || "Registration failed";
            set({
              isLoading: false,
              error: errorMsg,
            });
            return Promise.reject(new Error(errorMsg));
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Registration failed",
          });
          return Promise.reject(error);
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      logoutAllDevices: async () => {
        try {
          set({ isLoading: true });
          await authService.logout(true); // true = all_devices
        } catch (error) {
          console.error("Logout all devices error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (userData: Partial<AppUser>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      initializeAuth: async () => {
        try {
          const [storedUser, storedToken, isValid] = await Promise.all([
            authService.getStoredUser(),
            authService.getStoredToken(),
            authService.validateToken(),
          ]);

          if (storedUser && storedToken && isValid) {
            set({
              user: storedUser,
              token: storedToken,
              isAuthenticated: true,
            });
          } else {
            // Clear invalid auth data
            if (storedToken && !isValid) {
              await authService.logout();
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              });
            }
          }
        } catch (error) {
          console.error("Failed to initialize auth:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      storage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        // Called after rehydration
        return (state, error) => {
          if (error) {
            console.error("Auth store rehydration error:", error);
          }
        };
      },
    }
  )
);

// Hook to initialize and validate auth state
export const useAuthInit = () => {
  const initializeAuth = async () => {
    try {
      const [storedUser, storedToken, isValid] = await Promise.all([
        authService.getStoredUser(),
        authService.getStoredToken(),
        authService.validateToken(),
      ]);

      if (storedUser && storedToken && isValid) {
        useAuthStore.setState({
          user: storedUser,
          token: storedToken,
          isAuthenticated: true,
        });
      } else {
        // Clear invalid auth data
        if (storedToken && !isValid) {
          await authService.logout();
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    }
  };

  return { initializeAuth };
};

// Hook to check auth status
export const useCheckAuth = () => {
  const checkAuth = async () => {
    const isValid = await authService.validateToken();
    if (!isValid) {
      await authService.logout();
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
    return isValid;
  };

  return { checkAuth };
};
