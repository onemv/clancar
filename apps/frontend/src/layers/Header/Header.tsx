"use client";

import styles from "./Header.module.scss";
import { BrandMark } from "@/components/BrandMark/BrandMark";
import { UserBadge } from "@/components/UserBadge/UserBadge";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <BrandMark />
      </div>
      <div className={styles.right}>
        <UserBadge />
      </div>
    </header>
  );
}
