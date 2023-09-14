#!/usr/bin/env node
import { moonPath } from "./controller.js";
import { exec } from "child_process";
import chalk from "chalk";
import { readFile } from "./owlFs.js";
console.clear();
let config = (await readFile("./moon.config.json"));
if (config) {
    config = JSON.parse(config);
}
const watchCommands = [`chokidar "moon.config.json" -c "node ${moonPath}/build.js"`];
if (config?.useJit) {
    watchCommands.push(`chokidar "${config.content[0]}" -c "node ${moonPath}/dynamic.js {path}"`);
}
exec(`concurrently -n "watch,additional" -c "bgYellow.bold,bgCyan.bold" "${watchCommands.join('" "')}" `, (err) => {
    if (err) {
        console.error("\nError: while ", chalk.redBright.bold("building"), err);
        return;
    }
});
console.log("\nMoon is ", chalk.yellowBright.bold("Watching"), " for changes in ", chalk.yellowBright.bold("moon.config.json"));
console.log(chalk.cyanBright.bold("\nPress Ctrl+C to stop watching for changes in moon.config.json"));
process.on("SIGINT", () => {
    process.exit();
});
