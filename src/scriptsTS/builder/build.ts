import { readFile } from "../helpers/owlFs.js";
import { Controller } from "./controller.js";

export const buildConfig = async () => {
  try {
    const config = await readFile("./moon.config.json");
    await Controller.init(JSON.parse(config));
    await Controller.createStyles();
  } catch (e) {
    console.log(e);
  }
};
