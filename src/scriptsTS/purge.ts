#!/usr/bin/env node
import { exec } from "child_process";
import { readFile } from "./owlFs.js";
import { writeFile } from "fs";
import { cssFolder, packagePath } from "./controller.js";
const config = await readFile("./moon.config.json");
if (!config) throw new Error("moon.config.json not found");

const moonConfig = JSON.parse(config);
if (!moonConfig.content) {
  throw new Error("Content not specified in moon.config.json");
}
const { content } = moonConfig;
const path = `${cssFolder}/moon`;

const purgeConfig = {
  content,
  output: `${path}`,
  css: [`${path}/moon.styles.css`, `${path}/moon.themes.css`, `${path}/moon.static.css`, `${path}/moon.jit.css`],
};

const writeJitCss = async () => {
  return new Promise((resolve, reject) => {
    if (moonConfig?.useJit) {
      exec(`node ${packagePath}/dynamic.js {path}`, (err, stdout, stderr) => {
        if (err) {
          console.error("\nError: while purging css");
          return;
        }
        resolve(true);
      });
    } else {
      resolve(true);
    }
  });
};

await writeJitCss();

writeFile("./purgecss-config.json", JSON.stringify(purgeConfig, null, 2), (err) => {
  if (err) throw err;
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
