import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./IconButton.module.scss";
import { cn } from "@/lib/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({ children, className, ...props }: Readonly<IconButtonProps>) {
  return (
    <button className={cn(styles.iconButton, className)} type="button" {...props}>
      {children}
    </button>
  );
}
