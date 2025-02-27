#!/usr/bin/env node
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import { stat, writeFile } from "fs/promises";
import { cssFolder, packagePath } from "./builder/controller.js";
import { fileExists, readFile } from "./helpers/owlFs.js";
import { copyFileSync } from "fs";
import { buildConfig } from "./builder/build.js";
import chokidar from "chokidar";
import { Sync_Changes, Jit_Start } from "./jit/jit.js";

// Convert exec callback to a promise-based function
const exec = promisify(execCallback);

const configPath = "./moon.config.json";
const purgeConfigPath = "./purgecss-config.json";

const rawConfig = await readFile(configPath);
if (!rawConfig) {
  throw new Error("moon.config.json not found");
}

export const PurgeCSS = async () => {
  console.log("Purging CSS...");

  const moonConfig = JSON.parse(rawConfig);
  if (!moonConfig.content) {
    throw new Error("Content not specified in moon.config.json");
  }

  // Prepare PurgeCSS config object
  const { content } = moonConfig;
  const moonCssPath = `${cssFolder}/moon`;
  const purgeConfig = {
    content,
    output: moonCssPath,
    css: [
      `${moonCssPath}/moon.styles.css`,
      `${moonCssPath}/moon.themes.css`,
      `${moonCssPath}/moon.static.css`,
      // ... Add others as needed
    ],
  };

  // 1) Build & JIT first
  await buildConfig();
  await Jit_Start();

  // 2) Check if purgecss-config.json exists before creating it
  try {
    await stat(purgeConfigPath);
    console.log(`${purgeConfigPath} already exists; skipping creation.`);
  } catch (err) {
    // File does not exist, so we create/write it
    await writeFile(purgeConfigPath, JSON.stringify(purgeConfig, null, 2), "utf8");
    console.log(`${purgeConfigPath} created/updated.`);
  }

  // 3) Execute PurgeCSS command
  try {
    const { stdout, stderr } = await exec(`yarn purgecss --config ${purgeConfigPath}`);
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    // TODO: remove all files except main.css if needed
  } catch (err) {
    console.error("PurgeCSS execution failed:", err);
  }

  console.log("Purging CSS... done");
};

export const Watcher = async () => {
  // If moon.config.json does not exist, copy the default
  if (!(await fileExists(configPath))) {
    copyFileSync(`${packagePath}/moon.config.default.json`, configPath);
  }

  // Read config again (could have just been created)
  let config = JSON.parse(await readFile(configPath));

  // Initial build
  await buildConfig();

  // Watch moon.config.json for changes
  const configWatcher = chokidar.watch(configPath);
  configWatcher.on("change", async (path) => {
    try {
      await buildConfig();
      if (config?.useJit) {
        Jit_Start();
      }
    } catch (e) {
      console.error("Error rebuilding config:", e);
    }
  });

  // If JIT is enabled, watch the files defined in config
  if (config?.useJit) {
    await Jit_Start();
    const filesWatcher = chokidar.watch(config.content[0]);
    filesWatcher.on("change", (path) => {
      Sync_Changes(path);
    });
  }

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    process.exit();
  });
};
