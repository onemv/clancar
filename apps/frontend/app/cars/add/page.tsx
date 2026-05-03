import type { Metadata } from "next";

import { routes, routeTitles } from "@/constants/routes";
import { CarsAddScreen } from "@/screens/CarsAddScreen/CarsAddScreen";

export const metadata: Metadata = {
  title: routeTitles[routes.carsAdd]
};

export default function CarsAddPage() {
  return <CarsAddScreen />;
}
