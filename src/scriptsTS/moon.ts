#!/usr/bin/env node
import { moonPath } from "./controller.js";
import { exec } from "child_process";
import chalk from "chalk";
import { fileExists, readFile } from "./owlFs.js";

console.clear();
let config = (await readFile("./moon.config.json")) as any;
if (config) {
  config = JSON.parse(config);
}

exec(`node ${moonPath}/build.js`, (err) => {
  if (err) {
    console.error("\nError: while ", chalk.redBright.bold("building"), err);
    return;
  }
});
exec(`chokidar "moon.config.json" -c " node ${moonPath}/build.js"`, (err) => {
  if (err) {
    console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
    return;
  }
});
if (config?.useJit) {
  exec(`node ${moonPath}/dynamic.js`, (err, stdout, stderr) => {
    if (err) {
      console.error("\nError: while ", chalk.redBright.bold("building dynamic css"), err);
      return;
    }
  });
  exec(`chokidar chokidar "${config.content[0]}"  -c " node ${moonPath}/dynamic.js {path}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
      return;
    }
  });
}

console.log("\nMoon is ", chalk.yellowBright.bold("Watching"), " for changes in ", chalk.yellowBright.bold("moon.config.json"));
console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
process.on("SIGINT", () => {
  process.exit();
});
