import type { Metadata } from "next";

import { DashboardScreen } from "@/screens/DashboardScreen/DashboardScreen";
import { routes, routeTitles } from "@/constants/routes";

export const metadata: Metadata = {
  title: routeTitles[routes.dashboard]
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
