import { ArrowRight01Icon } from "hugeicons-react";
import Link from "next/link";

import styles from "./Breadcrumbs.module.scss";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

type BreadcrumbsProps = {
  items: ReadonlyArray<BreadcrumbItem>;
  className?: string;
};

export function Breadcrumbs({ items, className }: Readonly<BreadcrumbsProps>) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav className={cn(styles.breadcrumbs, className)} aria-label="Хлебные крошки">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className={styles.item}>
            {index > 0 ? (
              <span className={styles.separator} aria-hidden="true">
                <ArrowRight01Icon size={14} />
              </span>
            ) : null}

            {item.href ? (
              <Link href={item.href} className={cn(styles.link, item.current && styles.current)}>
                {item.label}
              </Link>
            ) : (
              <span className={cn(styles.link, styles.current)}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
