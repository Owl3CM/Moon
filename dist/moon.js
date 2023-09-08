#!/usr/bin/env node
import { readFile } from "./owlFs.js";
import { Controller } from "./controller.js";
import { copyFileSync } from "fs";
const createMoon = async () => {
    const config = await readFile("./moon.config.json");
    await Controller.init(JSON.parse(config));
    await Controller.createStyles();
};
readFile("./moon.config.json")
    .then((res) => {
    createMoon();
})
    .catch(async (err) => {
    await copyFileSync("./moon.config.default.json", "./moon.config.json");
    createMoon();
});
