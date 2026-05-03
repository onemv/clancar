import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { routes, routeTitles } from "@/constants/routes";
import { PageLayout } from "@/layers/PageLayout/PageLayout";
import { WorkspaceShell } from "@/layers/WorkspaceShell/WorkspaceShell";

export const metadata: Metadata = {
  title: routeTitles[routes.carsMy]
};

export default function CarsMyPage() {
  return (
    <WorkspaceShell>
      <PageLayout
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Дашборд", href: routes.dashboard },
              { label: "Мои автомобили", href: routes.carsMy, current: true }
            ]}
          />
        }
      >
        {null}
      </PageLayout>
    </WorkspaceShell>
  );
}
