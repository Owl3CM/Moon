#!/usr/bin/env node
import { readFileSync } from "fs";
import { execSync } from "child_process";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

// Bump patch version (supports x.y.z and x.y.z.beta)
const parts = pkg.version.split(".");
if (parts.length > 3) {
  parts[parts.length - 1] = String(Number(parts[parts.length - 1]) + 1);
} else {
  parts[2] = String(Number(parts[2]) + 1);
}
const version = parts.join(".");

console.log(`Publishing ${pkg.name}@${version}...`);

try {
  execSync("git add .", { stdio: "inherit" });
  execSync(`pnpm publish --new-version ${version} --access public`, { stdio: "inherit" });
  console.log(`\nPublished ${version}\n`);
} catch (err) {
  console.error("Publish failed:", err.message);
  process.exit(1);
}
