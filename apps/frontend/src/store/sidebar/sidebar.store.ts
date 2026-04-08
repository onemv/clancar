"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Хранилище состояния sidebar.
// collapsed влияет на ширину панели и на ряд responsive-решений в layout.
type SidebarState = {
  collapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

const SIDEBAR_STORAGE_KEY = "cca.ui.sidebarCollapsed";

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed })
    }),
    {
      name: SIDEBAR_STORAGE_KEY
    }
  )
);
