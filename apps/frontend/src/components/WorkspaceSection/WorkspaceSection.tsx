import type { ReactNode } from "react";

import styles from "./WorkspaceSection.module.scss";
import { cn } from "@/lib/cn";

type WorkspaceSectionSpan = 1 | 2 | 3 | 4 | 5;
type WorkspaceSectionSize =
  | "1"
  | "1/2"
  | "1/3"
  | "1/4"
  | "1/5"
  | "2/3"
  | "3/4"
  | "2/5"
  | "3/5"
  | "4/5"
  | "half";

type WorkspaceSectionProps = {
  children: ReactNode;
  className?: string;
  span?: WorkspaceSectionSpan;
  size?: WorkspaceSectionSize;
};

const spanClassMap: Record<WorkspaceSectionSpan, string> = {
  1: styles.span1,
  2: styles.span2,
  3: styles.span3,
  4: styles.span4,
  5: styles.span5
};

const sizeClassMap: Record<WorkspaceSectionSize, string> = {
  "1": styles.size1,
  "1/2": styles.size1of2,
  "1/3": styles.size1of3,
  "1/4": styles.size1of4,
  "1/5": styles.size1of5,
  "2/3": styles.size2of3,
  "3/4": styles.size3of4,
  "2/5": styles.size2of5,
  "3/5": styles.size3of5,
  "4/5": styles.size4of5,
  half: styles.size1of2
};

export function WorkspaceSection({
  children,
  className,
  span = 5,
  size
}: Readonly<WorkspaceSectionProps>) {
  return (
    <section
      className={cn(
        styles.workspaceSection,
        size ? sizeClassMap[size] : spanClassMap[span],
        className
      )}
    >
      {children}
    </section>
  );
}
