import Link from "next/link";

import styles from "./not-found.module.scss";
import { GlassSurface } from "@/components/GlassSurface/GlassSurface";

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <GlassSurface className={styles.card}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.description}>
          Маршрут отсутствует или был перемещен. Вернитесь в рабочее пространство.
        </p>
        <Link className={styles.link} href="/">
          Открыть Dashboard
        </Link>
      </GlassSurface>
    </main>
  );
}
