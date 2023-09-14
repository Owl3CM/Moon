#!/usr/bin/env node
import { exec } from "child_process";
import { readFile } from "./owlFs.js";
import { writeFile } from "fs";
import { moonPath } from "./controller.js";
const config = await readFile("./moon.config.json");
if (!config)
    throw new Error("moon.config.json not found");
const moonConfig = JSON.parse(config);
if (!moonConfig.content) {
    throw new Error("Content not specified in moon.config.json");
}
const { content } = moonConfig;
const path = `${moonPath}/moon`;
const purgeConfig = {
    content,
    output: `${moonPath}moon/main.css`,
    css: [`${path}/moon.styles.css`, `${path}/moon.themes.css`, `${path}/moon.static.css`, `${path}/moon.jit.css`],
};
if (moonConfig?.useJit) {
    exec(`node ${moonPath}/dynamic.js {path}`, (err, stdout, stderr) => {
        if (err) {
            console.error("\nError: while purging css");
            return;
        }
    });
}
writeFile("./purgecss-config.json", JSON.stringify(purgeConfig, null, 2), (err) => {
    if (err)
        throw err;
    console.log("purgecss-config.json updated");
    exec(`yarn purgecss --config purgecss-config.json`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        // Todo: remove all files except main.css
        console.log(stdout);
    });
});
