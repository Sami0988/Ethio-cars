// features/theme/theme.store.ts
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTheme } from "./theme.service";
import { ThemeMode } from "./theme.types";

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  theme: ReturnType<typeof getTheme>;
  isDarkMode: boolean;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get): ThemeStore => ({
      themeMode: "system" as ThemeMode,
      theme: getTheme("system"),

      get isDarkMode() {
        const { themeMode } = get();
        if (themeMode === "system") {
          // For system mode, you might want to check the actual system preference
          // For now, default to light mode for system
          return false;
        }
        return themeMode === "dark";
      },

      setThemeMode: (mode: ThemeMode) => {
        const theme = getTheme(mode);
        set({ themeMode: mode, theme });
      },

      toggleTheme: () => {
        const { themeMode } = get();
        const newMode = themeMode === "dark" ? "light" : "dark";
        const theme = getTheme(newMode);
        set({ themeMode: newMode, theme });
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
