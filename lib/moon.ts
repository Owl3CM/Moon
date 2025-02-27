#!/usr/bin/env node

import { Watcher } from "./workflow.js";

Watcher();

// import { packagePath } from "./builder/controller.js";
// import { fileExists, readFile } from "./helpers/owlFs.js";
// import { copyFileSync } from "fs";
// import { buildConfig } from "./builder/build.js";
// import chokidar from "chokidar";
// import { Sync_Changes, Jit_Start } from "./jit/jit.js";

// // import { funcPerformance } from "./builder/utils.js";
// // import chalk from "chalk";
// // import os from "os";
// // const platform = os.platform();
// // console.log(`Operating System: ${platform}`);

// if (!(await fileExists("./moon.config.json"))) copyFileSync(`${packagePath}/moon.config.default.json`, "./moon.config.json");
// let config = JSON.parse(await readFile("./moon.config.json")) as any;

// await buildConfig();
// const configWatcher = chokidar.watch("./moon.config.json");
// configWatcher.on("change", async (path) => {
//   // funcPerformance(buildConfig, []);
//   try {
//     await buildConfig();
//     if (config?.useJit) Jit_Start();
//   } catch {}
// });

// if (config?.useJit) {
//   // funcPerformance(Jit_Start, []);
//   await Jit_Start();
//   const watcher = chokidar.watch(config.content[0]);
//   watcher.on("change", (path) => {
//     // funcPerformance(Sync_Changes, [path]);
//     Sync_Changes(path);
//   });
// }
// // console.log("\nMoon is ", chalk.yellowBright.bold("Watching"), " for changes in ", chalk.yellowBright.bold("moon.config.json"));
// // console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
// process.on("SIGINT", () => {
//   process.exit();
// });
