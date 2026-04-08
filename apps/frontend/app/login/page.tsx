import type { Metadata } from "next";

import { LoginScreen } from "@/screens/LoginScreen/LoginScreen";
import { routes, routeTitles } from "@/constants/routes";

export const metadata: Metadata = {
  title: routeTitles[routes.login]
};

export default function LoginPage() {
  return <LoginScreen />;
}
