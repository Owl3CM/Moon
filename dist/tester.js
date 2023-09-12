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
    .then(async (res) => {
    await createMoon();
    await copyFileSync("./Moon.Types.d.ts", "../Moon/Moon.Types.d.ts");
})
    .catch(async (err) => {
    await copyFileSync("../Moon/moon.config.tester.json", "./moon.config.json");
    await createMoon();
    await copyFileSync("./Moon.Types.d.ts", "../Moon/Moon.Types.d.ts");
});
