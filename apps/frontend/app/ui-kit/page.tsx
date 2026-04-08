import type { Metadata } from "next";

import { UiKitScreen } from "@/screens/UiKitScreen/UiKitScreen";
import { routes, routeTitles } from "@/constants/routes";

export const metadata: Metadata = {
  title: routeTitles[routes.uiKit]
};

export default function UiKitPage() {
  return <UiKitScreen />;
}
