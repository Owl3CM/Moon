#!/usr/bin/env node
import { packagePath } from "./builder/controller.js";
import { exec } from "child_process";
import chalk from "chalk";
import { fileExists, readFile } from "./helpers/owlFs.js";
import { copyFileSync } from "fs";
import { build } from "./builder/build.js";
// import os from "os";
// const platform = os.platform();
// console.log(`Operating System: ${platform}`);
if (!(await fileExists("./moon.config.json")))
    copyFileSync(`${packagePath}/moon.config.default.json`, "./moon.config.json");
let config = JSON.parse(await readFile("./moon.config.json"));
await build();
exec(`chokidar "moon.config.json" -c " node ${packagePath}/builder/build.js build"`, (err) => {
    if (err) {
        console.error("\nError: while ", chalk.redBright.bold("watching"), " for changes in ", chalk.redBright.bold("moon.config.json"));
        return;
    }
});
if (config?.useJit) {
    exec(`node ${packagePath}/jit/init.js`, () => { });
    exec(`chokidar chokidar "${config.content[0]}"  -c " node ${packagePath}/jit/jit.js {path}"`, (err, stdout, stderr) => {
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
