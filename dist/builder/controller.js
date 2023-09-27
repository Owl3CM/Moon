import { getColors } from "./buildColors.js";
import { getStaticCss } from "./buildStaticClasses.js";
import { getStyles } from "./buildStyles.js";
import { createFile, createFolder, fileExists } from "../helpers/owlFs.js";
export const packagePath = "node_modules/moon-style/dist";
export const cssFolder = ".";
export const Controller = {
    createStyles: async () => {
        Controller.PropsByShourtNames.m = (v) => `margin:${v}`;
        await createFolder(`${cssFolder}/moon`, {
            main: { name: "main.css", content: await getMainCss() },
            moon: { name: "moon.styles.css", content: await getStyles() },
            themes: { name: "moon.themes.css", content: await getColors() },
            static: { name: "moon.static.css", content: await getStaticCss() },
        });
        if (!(await fileExists(`${cssFolder}/moon/moon.jit.css`)))
            await createFile({ dir: `${cssFolder}/moon`, name: "moon.jit.css", content: "/* This file is generated by Moon Style. Do not edit it manually. */" });
        await createFile({ dir: "./", name: "Moon.Types.d.ts", content: await getMoonTypes() });
        // logger(JSON.stringify(Controller.PropsByShourtNames, null, 2), "PropsByShourtNames");
    },
    init: async (config) => {
        Controller.config = { ...Controller.config, ...config };
    },
    GeneratedClasses: {},
    StylesVariables: [],
    ColorsVariables: [],
    JitGenerated: {},
    test: "NULL",
    PropsByShourtNames: {
        bg: "background-color",
        text: "color",
        round: "border-radius",
        content: (v) => `content:attr(data-${v})`,
    },
    config: {
        useJit: true,
        useStaticNumbers: false,
        projectDir: "./src",
        content: ["./src/**/*.{html,js,jsx,tsx}"],
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
const getMainCss = async () => `/* This file is generated by Moon Style. Do not edit it manually. */
  @import url('./moon.styles.css');
  @import url('./moon.themes.css');
  @import url('./moon.static.css');
  @import url('./moon.jit.css');
  `;
