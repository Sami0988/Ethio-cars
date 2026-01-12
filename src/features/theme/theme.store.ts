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
      themeMode: "light" as ThemeMode,
      theme: getTheme("light"),

      isDarkMode: false,

      setThemeMode: (mode: ThemeMode) => {
        const theme = getTheme(mode);
        const isDarkMode = mode === "dark";
        set({ themeMode: mode, theme, isDarkMode });
      },

      toggleTheme: () => {
        const { themeMode } = get();
        const newMode = themeMode === "dark" ? "light" : "dark";
        const theme = getTheme(newMode);
        const isDarkMode = newMode === "dark";
        set({ themeMode: newMode, theme, isDarkMode });
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
