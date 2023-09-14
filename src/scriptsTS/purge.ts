#!/usr/bin/env node
import { exec } from "child_process";
import { readFile } from "./owlFs.js";
import { writeFile } from "fs";

const config = await readFile("./moon.config.json");
if (!config) throw new Error("moon.config.json not found");

const moonConfig = JSON.parse(config);
if (!moonConfig.content) {
  throw new Error("Content not specified in moon.config.json");
}
const { content } = moonConfig;

const purgeConfig = {
  content,
  output: "./moon/main.css",
  css: ["./moon/moon.styles.css", "./moon/moon.themes.css", "./moon/moon.static.css", "./moon/moon.jit.css"],
};

writeFile("./purgecss-config.json", JSON.stringify(purgeConfig, null, 2), (err) => {
  if (err) throw err;
  console.log("purgecss-config.json updated");

  exec(`yarn purgecss --config purgecss-config.json`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
});
