import { getRootCss } from "./create.js";
import { createFile, createFolder } from "./owlFs.js";

export const Controller = {
  createStyles: async () => {
    createFile({
      dir: Controller.config.outputPath,
      name: "moon.css",
      content: await getRootCss(),
    });
  },
  init: async (config) => {
    Controller.config = { ...Controller.config, ...config };
    await createFolder(Controller.config.outputPath);
  },
  config: {
    sizes: {
      xs: "0.75rem",
      s: "0.875rem",
      m: "1rem",
      l: "1.125rem",
      x: "1.25rem",
      "2x": "1.5rem",
      "3x": "1.875rem",
      "4x": "2.25rem",
      "5x": "3rem",
      "6x": "4rem",
    },
    "font-size": {
      xs: "0.75rem",
      s: "0.875rem",
      m: "1rem",
      l: "1.125rem",
      x: "1.25rem",
      "2x": "1.5rem",
      "3x": "1.875rem",
      "4x": "2.25rem",
      "5x": "3rem",
      "6x": "4rem",
    },

    "border-radius": {},
    "font-weight": {},
    "line-height": {},
    "border-width": {},

    themes: {
      root: {},
      light: {},
      dark: {},
    },
    "font-familie": {},
    "box-shadow": {},
    "z-index": {},

    outputPath: "./src/styles",
  },
};
