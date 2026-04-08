import styles from "./LoginScreen.module.scss";
import { BrandMark } from "@/components/BrandMark/BrandMark";
import { Button } from "@/components/Button/Button";
import { GlassSurface } from "@/components/GlassSurface/GlassSurface";
import { Input } from "@/components/Input/Input";
import { ThemeSwitch } from "@/components/ThemeSwitch/ThemeSwitch";

export function LoginScreen() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <ThemeSwitch className={styles.themeDock} hideLabel />

        <GlassSurface className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Войти в систему</h2>
          </div>

          <form className={styles.form}>
            <label className={styles.field}>
              <span className={styles.label}>Логин или e-mail</span>
              <Input
                className={styles.control}
                type="email"
                placeholder="manager@clancar.local"
                autoComplete="username"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Пароль</span>
              <Input
                className={styles.control}
                variant="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
              />
              <button className={styles.inlineLink} type="button">
                Забыл пароль
              </button>
            </label>

            <div className={styles.actions}>
              <Button className={styles.submit} type="submit">
                Войти
              </Button>

              <button className={styles.inlineLink} type="button">
                Правила использования сервиса
              </button>
            </div>
          </form>
        </GlassSurface>

        <div className={styles.brandDock}>
          <BrandMark />
        </div>
      </div>
    </main>
  );
}
