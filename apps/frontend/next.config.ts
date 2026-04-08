import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const sharedConfig: NextConfig = {
  reactStrictMode: true
};

export default function createNextConfig(phase: string): NextConfig {
  return {
    ...sharedConfig,
    // Разводим dev и build по разным runtime-каталогам, чтобы next build
    // не мог повредить живой dev-сервер и его manifest-файлы.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next"
  };
}
