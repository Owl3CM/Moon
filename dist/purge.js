#!/usr/bin/env node
import { exec } from "child_process";
import { readFile } from "./helpers/owlFs.js";
import { writeFile } from "fs";
import { cssFolder } from "./builder/controller.js";
import { Jit_Start } from "./jit/jit.js";
const config = await readFile("./moon.config.json");
if (!config)
    throw new Error("moon.config.json not found");
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
Jit_Start();
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
