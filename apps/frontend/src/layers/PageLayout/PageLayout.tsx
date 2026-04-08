import type { ReactNode } from "react";

import styles from "./PageLayout.module.scss";
import { cn } from "@/lib/cn";

type PageLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageLayout({
  children,
  header,
  className,
  contentClassName
}: Readonly<PageLayoutProps>) {
  const hasHeader = header !== undefined && header !== null;

  return (
    <section className={cn(styles.page, !hasHeader && styles.withoutHeader, className)}>
      {hasHeader ? <header className={styles.header}>{header}</header> : null}
      <div className={cn(styles.content, contentClassName)}>{children}</div>
    </section>
  );
}
