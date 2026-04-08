import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./Button.module.scss";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "danger" | "outline" | "shadow" | "unactive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  variant = "primary",
  disabled,
  type = "button",
  ...props
}: Readonly<ButtonProps>) {
  const isDisabled = disabled || variant === "unactive";

  return (
    <button
      className={cn(styles.button, styles[variant], isDisabled && styles.disabled, className)}
      type={type}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}
