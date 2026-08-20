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

const markdownFiles = [
  path.join(rootPath, "README.md"),
  path.join(rootPath, "AGENTS.md"),
  path.join(rootPath, "CHANGELOG.md"),
  ...walk(agentPath).filter((file) => file.endsWith(".md")),
];

for (const file of markdownFiles) {
  assert.equal(existsSync(file), true, `${file} must exist`);
  const content = readFileSync(file, "utf8");
  assert.equal(content.includes("file:///"), false, `${file} contains a machine-local file URL`);
  assert.equal(content.includes("/Users/"), false, `${file} contains a machine-local path`);

  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "").split(/\s+[\"']/)[0];
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(rawTarget)) continue;

    const relativeTarget = decodeURIComponent(rawTarget.split(/[?#]/)[0]);
    if (!relativeTarget) continue;

    const resolvedTarget = path.resolve(path.dirname(file), relativeTarget);
    assert.equal(existsSync(resolvedTarget), true, `${file} links to missing ${relativeTarget}`);
  }
}

assert.equal(readFileSync(path.join(rootPath, "README.md"), "utf8").includes("public/gifs/"), false, "README must not reference unpackaged demo media");

console.log("moon-style dist verification passed");
