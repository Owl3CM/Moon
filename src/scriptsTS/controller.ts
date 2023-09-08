import { getMoonCss } from "./create.js";
import { createFile, createFolder } from "./owlFs.js";

export const Controller = {
  createStyles: async () => {
    await createFolder(Controller.config.outputPath ?? "./src/styles", {
      moon: { name: "moon.css", content: await getMoonCss() },
    });
  },

  init: async (config: any) => {
    Controller.config = { ...Controller.config, ...config };
  },
  config: {
    themes: {
      root: {},
      light: {},
      dark: {},
    },
    styles: [
      {
        props: { padding: "p", margin: "m", gap: "gap", inset: "inset", top: "top", left: "left", right: "right", bottom: "bottom" },
        variableName: "spacing",
        values: {
          "0": "0",
          xs: "2px",
          sm: "4px",
          md: "8px",
          lg: "10px",
          xl: "12px",
          "2x": "16px",
          "3x": "20px",
          "4x": "26px",
          "5x": "32px",
          "6x": "40px",
        },
      },
    ],

    outputPath: "./src/styles",
    useStaticNumbers: false,
  },
};
