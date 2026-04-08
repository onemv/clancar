import type { ReactNode } from "react";

import styles from "./GlassSurface.module.scss";
import { cn } from "@/lib/cn";

type GlassSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function GlassSurface({ children, className }: Readonly<GlassSurfaceProps>) {
  return <div className={cn(styles.glassSurface, className)}>{children}</div>;
}
