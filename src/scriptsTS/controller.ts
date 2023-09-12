import { getMoonCss } from "./create.js";
import { createFile, createFolder } from "./owlFs.js";

export const Controller = {
  createStyles: async () => {
    Controller.config.outputPath = Controller.config.outputPath ?? "./src";
    await createFolder(Controller.config.outputPath, {
      moon: { name: "moon.css", content: await getMoonCss() },
    });
    await createFile({ dir: "./", name: "Moon.Types.d.ts", content: await getMoonTypes() });
  },

  init: async (config: any) => {
    Controller.config = { ...Controller.config, ...config };
  },
  StylesVariables: [] as string[],
  ColorsVariables: [] as string[],
  config: {
    colors: {
      options: {},
      staticColors: {},
      themes: {
        light: {},
        dark: {},
      },
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

const getMoonTypes = async () => {
  const colorsNames = Controller.ColorsVariables.map((v) => `"${v}"`).join(" | ");
  const themes = Controller.config.colors.themes;
  const themesTypes = Object.keys(themes)
    .map((theme) => `"${theme}"`)
    .join(" | ");
  return `
  export type Theme = ${themesTypes};
  export type Color = ${colorsNames};
  `;
};
