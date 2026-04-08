import { rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const mode = process.argv[2] ?? "dev";
const supportedModes = new Set(["dev", "build"]);
const distDirsByMode = {
  dev: ".next-dev",
  build: ".next"
};

if (!supportedModes.has(mode)) {
  console.error(`Неизвестный режим подготовки frontend runtime: ${mode}`);
  process.exit(1);
}

// Dev и build должны чистить только свой runtime-каталог.
// Иначе next build может снести .next живого dev-сервера и оставить его
// без manifest-файлов, из-за чего появляются случайные runtime-падения.
rmSync(path.join(appRoot, distDirsByMode[mode]), {
  recursive: true,
  force: true
});

rmSync(path.join(appRoot, "tsconfig.tsbuildinfo"), {
  force: true
});
