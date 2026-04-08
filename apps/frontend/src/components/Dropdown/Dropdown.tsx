"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import styles from "./Dropdown.module.scss";
import { cn } from "@/lib/cn";

type DropdownWidth = "trigger" | number | string;
type DropdownAlign = "center" | "left" | "right";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  closeOnSelect?: boolean;
  panelWidth?: DropdownWidth;
  minPanelWidth?: number | string;
  align?: DropdownAlign;
  offset?: number;
  onOpenChange?: (open: boolean) => void;
};

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function toCssSize(value: number | string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

export function Dropdown({
  trigger,
  children,
  className,
  triggerClassName,
  panelClassName,
  open,
  defaultOpen = false,
  disabled = false,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSelect = false,
  panelWidth = "trigger",
  minPanelWidth,
  align = "center",
  offset = 8,
  onOpenChange
}: Readonly<DropdownProps>) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [triggerWidth, setTriggerWidth] = useState(0);

  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  useLayoutEffect(() => {
    const element = triggerRef.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      setTriggerWidth(element.getBoundingClientRect().width);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeOnClickOutside, isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, isOpen]);

  const panelStyle = useMemo<CSSProperties>(() => {
    const width =
      panelWidth === "trigger" ? (triggerWidth > 0 ? `${triggerWidth}px` : undefined) : toCssSize(panelWidth);

    return {
      "--dropdown-offset": `${offset}px`,
      width,
      minWidth: toCssSize(minPanelWidth)
    } as CSSProperties;
  }, [minPanelWidth, offset, panelWidth, triggerWidth]);

  const handleTriggerClick = () => {
    if (disabled) {
      return;
    }

    setOpen(!isOpen);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={cn(styles.dropdown, className)}>
      <div
        ref={triggerRef}
        className={cn(styles.trigger, triggerClassName)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="menu"
        aria-disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            className={cn(
              styles.panel,
              align === "left" && styles.alignLeft,
              align === "right" && styles.alignRight,
              panelClassName
            )}
            style={panelStyle}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            onClick={closeOnSelect ? () => setOpen(false) : undefined}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
