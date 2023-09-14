#!/usr/bin/env node
import { moonPath } from "./controller.js";
import { exec } from "child_process";
import chalk from "chalk";
import { readFile } from "./owlFs.js";
import os from "os";
const platform = os.platform();
console.clear();
console.log(`Operating System: ${platform}`);
let config = (await readFile("./moon.config.json"));
if (config) {
    config = JSON.parse(config);
}
// const commands =`node ${moonPath}/build.js` + (config?.useJit ? ` && node ${moonPath}/dynamic.js` : "") + ` && chokidar "moon.config.json" -c " node ${moonPath}/build.js"` + (config?.useJit ? ` && chokidar "${config.content[0]}"  -c " node ${moonPath}/dynamic.js {path}"` : "");
const userCommands = process.argv.slice(2);
const commands = `start cmd.exe /K "node ${moonPath}/build.js` +
    (config?.useJit ? ` && node ${moonPath}/dynamic.js` : "") +
    ` && chokidar "moon.config.json" -c " node ${moonPath}/build.js` +
    (config?.useJit
        ? ` && node ${moonPath}/dynamic.js {path}"`
        : `"; exit"
  
  `) +
    userCommands.join(" ");
console.log("\nMoon is ", chalk.yellowBright.bold("Building"), " for the first time");
console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
exec(commands, (err) => {
    if (err) {
        console.error("\nError: while ", chalk.redBright.bold("building"), err);
        return;
    }
});
// exec(`node ${moonPath}/build.js`, (err) => {
//   if (err) {
//     console.error("\nError: while ", chalk.redBright.bold("building"), err);
//     return;
//   }
// });
// exec(`chokidar "moon.config.json" -c " node ${moonPath}/build.js"`, (err) => {
//   if (err) {
//     console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
//     return;
//   }
// });
// if (config?.useJit) {
//   exec(`node ${moonPath}/dynamic.js`, (err, stdout, stderr) => {
//     if (err) {
//       console.error("\nError: while ", chalk.redBright.bold("building dynamic css"), err);
//       return;
//     }
//   });
//   exec(`chokidar chokidar "${config.content[0]}"  -c " node ${moonPath}/dynamic.js {path}"`, (err, stdout, stderr) => {
//     if (err) {
//       console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
//       return;
//     }
//   });
// }
console.log("\nMoon is ", chalk.yellowBright.bold("Watching"), " for changes in ", chalk.yellowBright.bold("moon.config.json"));
console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
process.on("SIGINT", () => {
    process.exit();
});
