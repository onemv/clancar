"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import styles from "./NavItem.module.scss";
import { cn } from "@/lib/cn";

const SIDEBAR_ANIM_DURATION = 0.24;
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

type NavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
  showLabel?: boolean;
};

export function NavItem({
  href,
  label,
  icon,
  active,
  collapsed = false,
  showLabel
}: Readonly<NavItemProps>) {
  const isVisible = showLabel ?? !collapsed;

  return (
    <Link
      href={href}
      className={cn(styles.navItem, active && styles.active, collapsed && styles.collapsed)}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
    >
      <span className={styles.rail}>
        <span className={styles.icon}>{icon}</span>
        <motion.span
          className={styles.labelWrap}
          initial={false}
          animate={{
            opacity: isVisible ? 1 : 0,
            width: isVisible ? "auto" : "0rem"
          }}
          transition={{ duration: SIDEBAR_ANIM_DURATION, ease: EASE_IN_OUT }}
        >
          <span className={styles.label}>{label}</span>
        </motion.span>
      </span>
    </Link>
  );
}
