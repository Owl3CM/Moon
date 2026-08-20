import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

const sharedPlugins = [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({
    exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx", "**/*.stories.mdx"],
  }),
  terser(),
];

// ── Main bundle ─────────────────────────────────────────────────────────────
const mainConfig = {
  input: "lib/index.ts",
  plugins: sharedPlugins,
  output: {
    file: packageJson.main,
    format: "es",
    sourcemap: false,
  },
};

// ── Icon bundle (headless IconBase + React) ──────────────────────────────────
// Separate entry so Node.js consumers (CLI, vite plugin) don't pull in React.
const iconConfig = {
  input: "lib/icon.tsx",
  plugins: sharedPlugins,
  output: {
    file: "dist/icon.js",
    format: "es",
    sourcemap: false,
  },
};

export default [mainConfig, iconConfig];
