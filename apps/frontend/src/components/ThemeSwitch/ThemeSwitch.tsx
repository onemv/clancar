"use client";

import type { ButtonHTMLAttributes } from "react";
import { Moon02Icon, Sun02Icon } from "hugeicons-react";

import styles from "./ThemeSwitch.module.scss";
import { cn } from "@/lib/cn";
import { useThemeStore } from "@/store/theme/theme.store";

type ThemeSwitchProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  hideLabel?: boolean;
};

export function ThemeSwitch({
  className,
  hideLabel = false,
  type = "button",
  ...props
}: Readonly<ThemeSwitchProps>) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const label = theme === "dark" ? "Светлая тема" : "Тёмная тема";

  return (
    <button
      className={cn(styles.themeSwitch, hideLabel && styles.compact, className)}
      type={type}
      aria-label={hideLabel ? label : undefined}
      onClick={toggleTheme}
      {...props}
    >
      {theme === "dark" ? <Sun02Icon size={18} /> : <Moon02Icon size={18} />}
      {hideLabel ? null : <span>{label}</span>}
    </button>
  );
}
