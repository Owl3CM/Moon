#!/usr/bin/env node
import { exec } from "child_process";
import { writeFile } from "fs";
import { cssFolder } from "./builder/controller.js";

// watcher
import { packagePath } from "./builder/controller.js";
import { fileExists, readFile } from "./helpers/owlFs.js";
import { copyFileSync } from "fs";
import { buildConfig } from "./builder/build.js";
import chokidar from "chokidar";
import { Sync_Changes, Jit_Start } from "./jit/jit.js";

const config = await readFile("./moon.config.json");
if (!config) throw new Error("moon.config.json not found");

export const PurgeCSS = async () => {
  const moonConfig = JSON.parse(config);
  if (!moonConfig.content) {
    throw new Error("Content not specified in moon.config.json");
  }
  const { content } = moonConfig;
  const path = `${cssFolder}/moon`;

  const purgeConfig = {
    content,
    output: `${path}`,
    css: [
      `${path}/moon.styles.css`,
      `${path}/moon.themes.css`,
      `${path}/moon.static.css`,
      //, `${path}/moon.jit.css`
    ],
  };
  await buildConfig();
  await Jit_Start();

  writeFile("./purgecss-config.json", JSON.stringify(purgeConfig, null, 2), (err) => {
    if (err) throw err;
    console.log("purgecss-config.json updated");
    exec(`yarn purgecss --config purgecss-config.json`, async (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      // Todo: remove all files except main.css
      console.log(stdout);
    });
  });
};

export const Watcher = async () => {
  if (!(await fileExists("./moon.config.json"))) copyFileSync(`${packagePath}/moon.config.default.json`, "./moon.config.json");
  let config = JSON.parse(await readFile("./moon.config.json")) as any;

  await buildConfig();
  const configWatcher = chokidar.watch("./moon.config.json");
  configWatcher.on("change", async (path) => {
    try {
      await buildConfig();
      if (config?.useJit) Jit_Start();
    } catch {}
  });

  if (config?.useJit) {
    await Jit_Start();
    const filesWatcher = chokidar.watch(config.content[0]);
    filesWatcher.on("change", (path) => {
      Sync_Changes(path);
    });
  }

  process.on("SIGINT", () => {
    process.exit();
  });
};
