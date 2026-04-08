import process from "node:process";

import {
  backendRoot,
  frontendRoot,
  stopProjectProcesses
} from "./process-control.mjs";

const scope = process.argv[2] === "frontend" || process.argv[2] === "backend" ? process.argv[2] : "all";
const includeInfra = process.argv.includes("--include-infra");

const scopeOptions = {
  frontend: {
    ports: [3000],
    scopeRoot: frontendRoot,
    commandFragments: [
      "scripts/run-next.mjs",
      "next/dist/bin/next",
      "next dev",
      "next start",
      "next-server"
    ],
    includeKnownDev: false,
    followParents: false
  },
  backend: {
    ports: [8000],
    scopeRoot: backendRoot,
    commandFragments: [
      "scripts/run-backend.mjs",
      "tsx watch src/main.ts",
      "dist/main.js"
    ],
    includeKnownDev: false,
    followParents: false
  },
  all: {}
};

await stopProjectProcesses({
  ...scopeOptions[scope],
  includeInfra
});
