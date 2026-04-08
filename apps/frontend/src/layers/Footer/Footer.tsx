import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>ClanCarAuction</span>
      <span>Внутренний рабочий интерфейс для учета автомобилей с пробегом и аукциона</span>
    </footer>
  );
}
