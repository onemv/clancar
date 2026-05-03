"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Cancel01Icon } from "hugeicons-react";
import { AnimatePresence, motion } from "motion/react";

import styles from "./Modal.module.scss";
import { IconButton } from "@/components/IconButton/IconButton";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  showOverlay?: boolean;
  showHeader?: boolean;
  plainContent?: boolean;
  closeOnOverlayClick?: boolean;
  forceBackgroundBlur?: boolean;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
  contentClassName,
  bodyClassName,
  showOverlay = true,
  showHeader = true,
  plainContent = false,
  closeOnOverlayClick = true,
  forceBackgroundBlur = false
}: Readonly<ModalProps>) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const blurClassName = "modal-force-blur";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    if (forceBackgroundBlur) {
      document.body.classList.add(blurClassName);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (forceBackgroundBlur) {
        document.body.classList.remove(blurClassName);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [forceBackgroundBlur, open, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className={cn(styles.root, "app-modal-root", className)}>
          {showOverlay ? (
            <motion.button
              key="overlay"
              type="button"
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-label="Закрыть модальное окно"
              onClick={() => {
                if (closeOnOverlayClick) {
                  onClose();
                }
              }}
            />
          ) : null}

          <motion.div
            key="content"
            className={cn(styles.contentLayer, !plainContent && styles.content, contentClassName)}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
          >
            {showHeader ? (
              <div className={styles.header}>
                <div className={styles.title}>{title}</div>
                <IconButton aria-label="Закрыть модальное окно" onClick={onClose}>
                  <Cancel01Icon size={18} />
                </IconButton>
              </div>
            ) : null}

            <div className={cn(styles.body, bodyClassName)}>{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
