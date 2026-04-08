"use client";

import type { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "hugeicons-react";

import styles from "./Input.module.scss";
import { cn } from "@/lib/cn";

export type InputVariant = "classic" | "password";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  variant?: InputVariant;
  type?: HTMLInputTypeAttribute;
};

export function Input({
  className,
  disabled,
  variant = "classic",
  type = "text",
  ...props
}: Readonly<InputProps>) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = variant === "password";
  const inputType = isPassword ? (passwordVisible ? "text" : "password") : type;

  return (
    <div className={cn(styles.field, isPassword && styles.password, disabled && styles.disabled, className)}>
      <input
        className={cn(styles.input, isPassword && !passwordVisible && styles.passwordMasked)}
        disabled={disabled}
        type={inputType}
        {...props}
      />
      {isPassword ? (
        <button
          className={styles.toggle}
          type="button"
          aria-label={passwordVisible ? "Скрыть пароль" : "Показать пароль"}
          aria-pressed={passwordVisible}
          disabled={disabled}
          onClick={() => setPasswordVisible((current) => !current)}
        >
          {passwordVisible ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
        </button>
      ) : null}
    </div>
  );
}
