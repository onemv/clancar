"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown01Icon } from "hugeicons-react";
import { AnimatePresence, motion } from "motion/react";

import styles from "./NavExpandableItem.module.scss";
import { NavItem } from "@/components/NavItem/NavItem";
import { cn } from "@/lib/cn";

const NAV_ANIM_DURATION = 0.2;
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

type NavExpandableChildItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
};

type NavExpandableItemProps = {
  label: string;
  icon: ReactNode;
  items: ReadonlyArray<NavExpandableChildItem>;
  collapsed?: boolean;
  showLabel?: boolean;
};

export function NavExpandableItem({
  label,
  icon,
  items,
  collapsed = false,
  showLabel
}: Readonly<NavExpandableItemProps>) {
  const isLabelVisible = showLabel ?? !collapsed;
  const hasActiveChild = useMemo(() => items.some((item) => item.active), [items]);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (collapsed) {
      setIsOpen(false);
    }
  }, [collapsed]);

  useEffect(() => {
    if (hasActiveChild && !collapsed) {
      setIsOpen(true);
    }
  }, [hasActiveChild, collapsed]);

  const handleToggle = () => {
    if (!collapsed) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={cn(
          styles.trigger,
          collapsed && styles.collapsed,
          hasActiveChild && styles.active,
          isOpen && styles.open
        )}
        onClick={handleToggle}
        aria-expanded={!collapsed && isOpen}
        aria-label={collapsed ? label : undefined}
      >
        <span className={styles.rail}>
          <span className={styles.icon}>{icon}</span>
          <motion.span
            className={styles.labelWrap}
            initial={false}
            animate={{
              opacity: isLabelVisible ? 1 : 0,
              width: isLabelVisible ? "auto" : "0px"
            }}
            transition={{ duration: NAV_ANIM_DURATION, ease: EASE_IN_OUT }}
          >
            <span className={styles.label}>{label}</span>
          </motion.span>
          {isLabelVisible ? (
            <motion.span
              className={styles.chevron}
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: NAV_ANIM_DURATION, ease: EASE_IN_OUT }}
            >
              <ArrowDown01Icon size={16} />
            </motion.span>
          ) : null}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isLabelVisible && isOpen ? (
          <motion.div
            className={styles.children}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: NAV_ANIM_DURATION, ease: EASE_IN_OUT }}
          >
            {items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                active={item.active}
                collapsed={false}
                showLabel
                icon={item.icon}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
