import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = fileURLToPath(new URL("../", import.meta.url));
const agentPath = path.join(rootPath, ".agent");

const runtime = await import("moon-style");
const vite = await import("moon-style/vite");
const icon = await import("moon-style/icon");

assert.equal(typeof runtime.default, "object", "moon-style must export the Moon runtime");
assert.equal(typeof vite.default, "function", "moon-style/vite must export the Vite plugin");
assert.equal(typeof icon.IconBase, "function", "moon-style/icon must export IconBase");
assert.equal(existsSync(path.join(rootPath, "dist", "__tests__")), false, "compiled tests must not ship in dist");
assert.equal(existsSync(path.join(rootPath, "AGENTS.md")), true, "AGENTS.md must exist");
assert.equal(existsSync(path.join(agentPath, "_index.md")), true, ".agent/_index.md must exist");

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    return statSync(entryPath).isDirectory() ? walk(entryPath) : [entryPath];
  });
}

for (const file of walk(agentPath)) {
  const content = readFileSync(file, "utf8");
  assert.equal(content.includes("file:///"), false, `${file} contains a machine-local file URL`);
  assert.equal(content.includes("/Users/"), false, `${file} contains a machine-local path`);
}

console.log("moon-style dist verification passed");
