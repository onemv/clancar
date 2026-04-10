import { Logout01Icon, Moon02Icon, Settings02Icon, Sun02Icon } from "hugeicons-react";

import styles from "./UserBadge.module.scss";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { useThemeStore } from "@/store/theme/theme.store";

export function UserBadge() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Dropdown
      trigger={
        <div className={styles.userBadge}>
          <div className={styles.avatar}>MM</div>
          <div className={styles.meta}>
            <span className={styles.name}>Максим Москвитин</span>
            <span className={styles.role}>SuperAdmin</span>
          </div>
        </div>
      }
      panelClassName={styles.dropdownPanel}
      closeOnSelect
      panelWidth={240}
      align="right"
    >
      <div className={styles.menu}>
        <button className={styles.menuItem} type="button" onClick={toggleTheme}>
          {theme === "dark" ? <Sun02Icon size={16} /> : <Moon02Icon size={16} />}
          <span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
        </button>
        <button className={styles.menuItem} type="button">
          <Settings02Icon size={16} />
          <span>Настройки профиля</span>
        </button>
        <button className={styles.menuItem} type="button">
          <Logout01Icon size={16} />
          <span>Выход</span>
        </button>
      </div>
    </Dropdown>
  );
}
