import { fileExists, readFile } from "../helpers/owlFs.js";
import { Controller, packagePath } from "./controller.js";
import { copyFileSync } from "fs";

export const build = async () => {
  if (!(await fileExists("./moon.config.json"))) await copyFileSync(`${packagePath}/moon.config.default.json`, "./moon.config.json");
  const config = await readFile("./moon.config.json");
  await Controller.init(JSON.parse(config));
  await Controller.createStyles();
};
if (process?.argv[2] === "build") build();
