"use client";

import styles from "./Header.module.scss";
import { BrandMark } from "@/components/BrandMark/BrandMark";
import { UserBadge } from "@/components/UserBadge/UserBadge";
import { GlassSurface } from "@/components/GlassSurface/GlassSurface";

export function Header() {
  return (
    <GlassSurface className={styles.header}>
      <div className={styles.left}>
        <BrandMark />
      </div>
      <div className={styles.right}>
        <UserBadge />
      </div>
    </GlassSurface>
  );
}
