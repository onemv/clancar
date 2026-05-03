"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import styles from "./Tabs.module.scss";
import { cn } from "@/lib/cn";

export type TabsOption = {
  value: string;
  label: string;
};

type TabsProps = {
  options: ReadonlyArray<TabsOption>;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function Tabs({ options, value, onValueChange, className }: Readonly<TabsProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ x: 0, y: 0, width: 0, height: 0, ready: false });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    const activeTab = tabRefs.current[value];

    if (!container || !activeTab) {
      return false;
    }

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    setIndicator({
      // Позиционируем относительно внутренней области контейнера (без толщины border).
      x: tabRect.left - containerRect.left - container.clientLeft,
      y: tabRect.top - containerRect.top - container.clientTop,
      width: tabRect.width,
      height: tabRect.height,
      ready: true
    });
    return true;
  }, [value]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, options]);

  useEffect(() => {
    const handleResize = () => updateIndicator();

    window.addEventListener("resize", handleResize);

    const container = containerRef.current;
    const activeTab = tabRefs.current[value];
    const resizeObserver = new ResizeObserver(() => {
      updateIndicator();
    });

    if (container) {
      resizeObserver.observe(container);
    }
    if (activeTab) {
      resizeObserver.observe(activeTab);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [updateIndicator, value]);

  return (
    <div ref={containerRef} className={cn(styles.tabs, className)} role="tablist" aria-label="Табы">
      <motion.span
        className={styles.activeIndicator}
        initial={false}
        animate={{
          x: indicator.x,
          y: indicator.y,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.ready ? 1 : 0
        }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      />
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            ref={(node) => {
              tabRefs.current[option.value] = node;
            }}
            type="button"
            role="tab"
            className={cn(styles.tab, isActive && styles.active)}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(option.value)}
          >
            <span className={styles.tabLabel}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
