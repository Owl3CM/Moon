#!/usr/bin/env node
import { readFile } from "./owlFs.js";
import { Controller } from "./controller.js";
await Controller.init(JSON.parse(await readFile("./moonconfig.json")));
await Controller.createStyles();
