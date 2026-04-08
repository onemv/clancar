import styles from "./BrandMark.module.scss";

export function BrandMark() {
  return (
    <div className={styles.brandMark}>
      <img src="/logo.svg" alt="ClanCarAuction" className={styles.logo} />
    </div>
  );
}
