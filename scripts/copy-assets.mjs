import { chmodSync, copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);

mkdirSync(fileURLToPath(dist), { recursive: true });

for (const file of ["moon.config.default.json", "moon.config.schema.json"]) {
  copyFileSync(fileURLToPath(new URL(file, root)), fileURLToPath(new URL(file, dist)));
}

copyFileSync(fileURLToPath(new URL("lib/icons-client.html", root)), fileURLToPath(new URL("icons-client.html", dist)));

if (process.platform !== "win32") {
  for (const file of ["moon.js", "purge.js"]) {
    chmodSync(fileURLToPath(new URL(file, dist)), 0o755);
  }
}
