import { readFile } from "./owlFs.js";
import { Controller } from "./controller.js";
const config = await readFile("./moon.config.json");
await Controller.init(JSON.parse(config));
await Controller.createStyles();
