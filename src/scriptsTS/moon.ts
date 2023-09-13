#!/usr/bin/env node
import { readFile } from "./owlFs.js";
import { Controller } from "./controller.js";
import { copyFileSync } from "fs";
import { exec } from "child_process";
import chalk from "chalk";

const createMoon = async () => {
  const config = await readFile("./moon.config.json");
  console.clear();
  await Controller.init(JSON.parse(config));
  await Controller.createStyles();
  exec('nodemon --watch moon.config.json -e json -x "yarn moon"', (err, stdout, stderr) => {
    if (err) {
      console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
      return;
    }
  });
  console.log("\nMoon is ", chalk.yellowBright.bold("Watching"), " for changes in ", chalk.yellowBright.bold("moon.config.json"));
  console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
  process.on("SIGINT", () => {
    process.exit();
  });
};
readFile("./moon.config.json")
  .then((res) => {
    createMoon();
  })
  .catch(async (err) => {
    await copyFileSync("node_modules/moon-style/dist/moon.config.default.json", "./moon.config.json");
    createMoon();
  });
