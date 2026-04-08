import styles from "./DashboardScreen.module.scss";
import { WorkspaceShell } from "@/layers/WorkspaceShell/WorkspaceShell";
import { PageLayout } from "@/layers/PageLayout/PageLayout";
import { GlassSurface } from "@/components/GlassSurface/GlassSurface";

export function DashboardScreen() {
  return (
    <WorkspaceShell>
      <PageLayout contentClassName={styles.content}>
        <GlassSurface className={styles.hero}>
          <p className={styles.kicker}>Операционный центр</p>
          <h2 className={styles.title}>Контроль движения автомобилей и аукционов</h2>
          <p className={styles.description}>
            Рабочее пространство для учета, статусов и процессов. Первый экран намеренно
            минимален: здесь только каркас, подсветка темы и базовая навигация.
          </p>
        </GlassSurface>

        <GlassSurface className={styles.placeholder}>
          <div className={styles.placeholderLabel}>Секция Dashboard</div>
          <p className={styles.placeholderText}>
            Здесь позже появятся карточки лотов, статусы проверки, поток аукциона и
            операционные метрики.
          </p>
        </GlassSurface>
      </PageLayout>
    </WorkspaceShell>
  );
}
