"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ThemeId } from "@/theme/types";

// Хранилище активной темы интерфейса.
// Значение сохраняется в браузере и используется ThemeProvider.
type ThemeState = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "cca.ui.theme";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" })
    }),
    {
      name: THEME_STORAGE_KEY
    }
  )
);
