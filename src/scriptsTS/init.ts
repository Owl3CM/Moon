import { fileExists, readFile } from "./owlFs.js";
import { Controller, packagePath } from "./controller.js";
import { copyFileSync } from "fs";
let time = 0;
while (!(await fileExists("node_modules/moon-style")) && time < 60) {
  time++;
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!(await fileExists("./moon.config.json"))) await copyFileSync(`${packagePath}/moon.config.default.json`, "./moon.config.json");

const config = await readFile("./moon.config.json");
await Controller.init(JSON.parse(config));
await Controller.createStyles();
