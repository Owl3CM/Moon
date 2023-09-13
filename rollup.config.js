import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json" assert { type: "json" };
import rollupResolve from "@rollup/plugin-node-resolve";
import rollupCommonjs from "@rollup/plugin-commonjs";

const config = {
  input: "src/index.ts",
  plugins: [
    rollupResolve(), // Required to resolve third-party modules
    rollupCommonjs(), // Required for CommonJS module support

    // Add the postcss plugin to process CSS files
    postcss({
      // PostCSS configuration file
      config: "./postcss.config.js",
      // Set the output CSS file (optional)
      extract: "dist/styles.css", // Modify this path as needed
      // Add any other PostCSS options here if needed
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      exclude: ["**/*.stories.tsx", "**/*.stories.mdx"],
    }),
    terser(),
  ],
  output: {
    file: packageJson.main,
    format: "cjs",
    sourcemap: false,
  },
};

export default config;
