#!/usr/bin/env node
import { packagePath } from "./controller.js";
import { exec } from "child_process";
import chalk from "chalk";
import { fileExists, readFile } from "./owlFs.js";
import { copyFileSync } from "fs";
// import os from "os";
// const platform = os.platform();
// console.log(`Operating System: ${platform}`);

console.clear();

if (!(await fileExists("./moon.config.json"))) await copyFileSync(`${packagePath}/moon.config.default.json`, "./moon.config.json");

const usersCommand = process.argv.slice(2).join(" ");

let config = JSON.parse(await readFile("./moon.config.json")) as any;

exec(`node ${packagePath}/build.js`, (err) => {
  if (err) {
    console.error("\nError: while ", chalk.redBright.bold("building"), err);
    return;
  }
});
exec(`chokidar "moon.config.json" -c " node ${packagePath}/build.js"`, (err) => {
  if (err) {
    console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
    return;
  }
});
if (config?.useJit) {
  exec(`node ${packagePath}/dynamic.js`, (err, stdout, stderr) => {
    if (err) {
      console.error("\nError: while ", chalk.redBright.bold("building dynamic css"), err);
      return;
    }
  });
  exec(`chokidar chokidar "${config.content[0]}"  -c " node ${packagePath}/dynamic.js {path}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
      return;
    }
  });
}

exec(`${usersCommand}`, (err, stdout, stderr) => {
  if (err) {
    console.error("\nError: while ", chalk.redBright.bold(`executing ${usersCommand}`), err);
    return;
  }
});

console.log("\nMoon is ", chalk.yellowBright.bold("Watching"), " for changes in ", chalk.yellowBright.bold("moon.config.json"));
console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
process.on("SIGINT", () => {
  process.exit();
});
