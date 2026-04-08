import type { ReactNode } from "react";

import styles from "./WorkspaceShell.module.scss";
import { Footer } from "@/layers/Footer/Footer";
import { Header } from "@/layers/Header/Header";
import { Sidebar } from "@/layers/Sidebar/Sidebar";

type WorkspaceShellProps = {
  children: ReactNode;
};

export function WorkspaceShell({ children }: Readonly<WorkspaceShellProps>) {
  return (
    <div className={styles.shell}>
      <div className={styles.headerRow}>
        <Header />
      </div>
      <div className={styles.body}>
        <Sidebar />
        <div className={styles.content}>
          <main className={styles.workspace}>
            <div className={styles.workspaceContent}>{children}</div>
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
