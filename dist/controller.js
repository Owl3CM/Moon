import { getMoonCss } from "./create.js";
import { createFolder } from "./owlFs.js";
export const Controller = {
    createStyles: async () => {
        Controller.config.outputPath = Controller.config.outputPath ?? "./src/moon";
        if (Controller.config.outputPath === "./src/moon")
            await createFolder("./src/moon", {
                moon: { name: "moon.css", content: await getMoonCss() },
                types: { name: "Types.ts", content: await getMoonTypes() },
            });
        else {
            await createFolder(Controller.config.outputPath, {
                moon: { name: "moon.css", content: await getMoonCss() },
            });
            await createFolder("./src/moon", {
                types: { name: "Types.ts", content: await getMoonTypes() },
            });
        }
    },
    init: async (config) => {
        Controller.config = { ...Controller.config, ...config };
    },
    StylesVariables: [],
    ColorsVariables: [],
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
const getMoonTypes = async () => {
    // const stylesNames = Controller.StylesVariables.map((variable) => variable.split(":")[0].slice(2)).join(" | ");
    const colorsNames = Controller.ColorsVariables.map((v) => `"${v}"`).join(" | ");
    const { themes } = Controller.config;
    const themesTypes = Object.keys(themes)
        .filter((theme) => theme !== "root")
        .map((theme) => `"${theme}"`)
        .join(" | ");
    return `
  export type Theme = ${themesTypes};
  export type Color = ${colorsNames};
  `;
};
