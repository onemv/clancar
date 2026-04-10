import styles from "./DashboardScreen.module.scss";
import { WorkspaceShell } from "@/layers/WorkspaceShell/WorkspaceShell";
import { PageLayout } from "@/layers/PageLayout/PageLayout";
import sectionStyles from "@/components/WorkspaceSection/WorkspaceSection.module.scss";
import { WorkspaceSection } from "@/components/WorkspaceSection/WorkspaceSection";

export function DashboardScreen() {
  return (
    <WorkspaceShell>
      <PageLayout
        header={<h1 className={styles.pageTitle}>Дашборд</h1>}
        contentClassName={sectionStyles.workspaceSections}
      >
        <WorkspaceSection className={styles.metricCard} size="1/5">
          <p className={styles.metricValue}>12 480</p>
          <p className={styles.metricLabel}>Всего автомобилей</p>
        </WorkspaceSection>

        <WorkspaceSection className={styles.metricCard} size="1/5">
          <p className={styles.metricValue}>3 120</p>
          <p className={styles.metricLabel}>Всего аукционов</p>
        </WorkspaceSection>

        <WorkspaceSection className={styles.metricCard} size="1/5">
          <p className={styles.metricValue}>742</p>
          <p className={styles.metricLabel}>Активные лоты</p>
        </WorkspaceSection>

        <WorkspaceSection className={styles.metricCard} size="1/5">
          <p className={styles.metricValue}>9 865</p>
          <p className={styles.metricLabel}>Завершенные лоты</p>
        </WorkspaceSection>

        <WorkspaceSection className={styles.metricCard} size="1/5">
          <p className={styles.metricValue}>1 304</p>
          <p className={styles.metricLabel}>Пользователей</p>
        </WorkspaceSection>

        <WorkspaceSection size="1/2">Половинчатая секция 1</WorkspaceSection>
        <WorkspaceSection size="1/2">Половинчатая секция 2</WorkspaceSection>
      </PageLayout>
    </WorkspaceShell>
  );
}
