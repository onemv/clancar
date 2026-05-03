"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { routes } from "@/constants/routes";
import { clearCarsAddDraft } from "@/lib/carsAddDraft";
import { useThemeStore } from "@/store/theme/theme.store";

// Провайдер темы:
// читает активную тему из Zustand и переключает data-theme на <html>.
// Сами токены уже описаны в styles/tokens.scss, поэтому runtime не дублирует их в JS.
export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const theme = useThemeStore((state) => state.theme);
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (previousPath === routes.carsAdd && pathname !== routes.carsAdd) {
      clearCarsAddDraft().catch(() => {});
    }

    previousPathRef.current = pathname;
  }, [pathname]);

  return <>{children}</>;
}
