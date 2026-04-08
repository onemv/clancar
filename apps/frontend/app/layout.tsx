import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2 } from "next/font/google";

import { ThemeProvider } from "@/providers/ThemeProvider/ThemeProvider";
import "@/styles/index.scss";

// Корневой layout frontend:
// 1. Подключает шрифт Exo 2.
// 2. Подключает все глобальные стили из src/styles.
// 3. Оборачивает приложение в ThemeProvider, который выставляет CSS-переменные темы.
const exo2 = Exo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-exo-2"
});

export const metadata: Metadata = {
  title: {
    default: "Кланкар",
    template: "%s / Кланкар"
  },
  description: "Система учета автомобилей с пробегом и аукцион"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru" className={exo2.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
