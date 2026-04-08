"use client";

import { DashboardSquare01Icon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "hugeicons-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

import styles from "./Sidebar.module.scss";
import { IconButton } from "@/components/IconButton/IconButton";
import { NavItem } from "@/components/NavItem/NavItem";
import { GlassSurface } from "@/components/GlassSurface/GlassSurface";
import { routes } from "@/constants/routes";
import { ui } from "@/constants/ui";
import { useSidebarStore } from "@/store/sidebar/sidebar.store";

const SIDEBAR_ANIM_DURATION = 0.24;
const LABEL_FADE_DURATION = 0.15;
const LABEL_EXIT_DELAY_MS = 60;
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const [showDetails, setShowDetails] = useState(!collapsed);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sidebarCollapsed = String(collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) {
      const id = setTimeout(() => setShowDetails(false), LABEL_EXIT_DELAY_MS);
      return () => clearTimeout(id);
    }
    setShowDetails(true);
  }, [collapsed]);

  return (
    <motion.aside
      className={styles.sidebarShell}
      initial={false}
      animate={{ width: collapsed ? ui.sidebarCollapsedWidth : ui.sidebarWidth }}
      transition={{ duration: SIDEBAR_ANIM_DURATION, ease: EASE_IN_OUT }}
    >
      <GlassSurface className={styles.sidebar}>
        <div className={styles.header}>
          <AnimatePresence initial={false}>
            {showDetails ? (
              <motion.div
                key="sidebar-header"
                className={styles.headerMeta}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: LABEL_FADE_DURATION, ease: EASE_IN_OUT }}
              >
                <span className={styles.title}>Навигация</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className={styles.headerAction}>
            <IconButton
              aria-label={collapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"}
              onClick={toggleSidebar}
            >
              {collapsed ? <PanelLeftCloseIcon size={20} /> : <PanelLeftOpenIcon size={20} />}
            </IconButton>
          </div>
        </div>
        <nav className={styles.nav}>
          <NavItem
            href={routes.dashboard}
            label="Dashboard"
            active={pathname === "/" || pathname === routes.dashboard}
            collapsed={collapsed}
            showLabel={showDetails}
            icon={<DashboardSquare01Icon size={18} />}
          />
        </nav>
      </GlassSurface>
    </motion.aside>
  );
}
