import * as SecureStore from "expo-secure-store";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  getTheme: () => typeof MD3LightTheme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get): ThemeStore => ({
      themeMode: "system" as ThemeMode,
      isDarkMode: false,

      setThemeMode: (mode: ThemeMode) => {
        let isDark = false;

        if (mode === "dark") {
          isDark = true;
        } else if (mode === "light") {
          isDark = false;
        } else {
          // system mode - check device preference
          // For now, default to light, but you can use Appearance API here
          isDark = false;
        }

        set({ themeMode: mode, isDarkMode: isDark });
      },

      toggleTheme: () => {
        const { isDarkMode } = get();
        const newMode = isDarkMode ? "light" : "dark";
        get().setThemeMode(newMode);
      },

      getTheme: () => {
        const { isDarkMode } = get();
        return isDarkMode ? MD3DarkTheme : MD3LightTheme;
      },
    }),
    {
      name: "theme-storage",
      storage: {
        getItem: async (name) => {
          try {
            const value = await SecureStore.getItemAsync(name);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await SecureStore.setItemAsync(name, JSON.stringify(value));
          } catch {
            // Silent fail for storage
          }
        },
        removeItem: async (name) => {
          try {
            await SecureStore.deleteItemAsync(name);
          } catch {
            // Silent fail for storage
          }
        },
      },
    }
  )
);
