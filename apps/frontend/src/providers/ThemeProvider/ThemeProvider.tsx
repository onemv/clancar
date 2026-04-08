"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useThemeStore } from "@/store/theme/theme.store";

// Провайдер темы:
// читает активную тему из Zustand и переключает data-theme на <html>.
// Сами токены уже описаны в styles/tokens.scss, поэтому runtime не дублирует их в JS.
export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
  }, [theme]);

  return <>{children}</>;
}
