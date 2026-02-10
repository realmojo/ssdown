import { cpSync, mkdirSync, copyFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

const openNext = ".open-next";
const assetsDir = join(openNext, "assets");
const workerDir = join(assetsDir, "_worker.js");

// Remove old _worker.js file or directory
if (existsSync(workerDir)) {
  rmSync(workerDir, { recursive: true, force: true });
}

// Create _worker.js directory (Pages advanced mode)
mkdirSync(workerDir, { recursive: true });

// Copy worker.js as index.js (Pages entry point)
copyFileSync(join(openNext, "worker.js"), join(workerDir, "index.js"));

// Copy all supporting directories that worker.js imports
const dirs = ["cloudflare", "middleware", "server-functions", ".build", "cache"];
for (const dir of dirs) {
  const src = join(openNext, dir);
  if (existsSync(src)) {
    cpSync(src, join(workerDir, dir), { recursive: true });
  }
}

console.log("Pages _worker.js directory prepared successfully.");
