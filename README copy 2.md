<!-- 
root.ts
const root = {
  theme: "",
  changeTheme: (theme: string) => {
    root.theme && document.documentElement.classList.remove(root.theme);
    document.documentElement.classList.add(theme);
    root.theme = theme;
  },
};

export const changeTheme = (theme: string) => root.changeTheme(theme);
export const currentTheme = () => root.theme;


moon.ts
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
    await copyFileSync("node_modules/moon-style/dist/moon.config.default.json", "./moon.config.json");
    createMoon();
  });

utils.ts
// Themes
export const getThemes = (themes: { [key: string]: { [key: string]: string } }) => {
  const themeCalls = {};

  themes.root = {
    transparent: "transparent",
    current: "currentColor",
    none: "none",
    black: "#000000",
    white: "#ffffff",
    ...themes.root,
  };

  const themesEntries = Object.entries(themes);
  const _themes = themesEntries
    .map(([themeKey, themeValue]) => {
      const themeName = themeKey === "root" ? ":root" : `.${themeKey}`;
      return `${themeName} {--${Object.entries(themeValue)
        .map(([key, value]) => {
          themeCalls[key] = `${value}`;
          return `${key}:${value}`;
        })
        .join(";--")}}`;
    })
    .join("\n");

  const _themesValues = Object.entries(themeCalls)
    .map(([key, value]) => {
      return Object.entries(colorsKeys)
        .map(([cKey, cValue]) => {
          const className = `.${cKey}-${key} `;
          const classValue = `var(--${key})`;
          return `${className}{${cValue}:${classValue};}`;
        })
        .join(" ");
    })
    .join("\n");

  return `${_themes}\n\n${_themesValues}`;
};
const colorsKeys = {
  bg: "background-color",
  text: "color",
  fill: "fill",
  border: "border-color",
};

// Props
export const getPropsNames = (propName: string) => {
  return PropsByName[propName] ?? [{ name: (n) => `${n.replace("-", "")}`, css: (v) => `${propName}:${v}` }];
};

export const getDefaultName = (cssName: string) => {
  return (
    {
      padding: "p",
      margin: "m",
      width: "w",
      height: "h",
      color: "text",
      "background-color": "bg",
      "border-radius": "round",
      "border-width": "border",
      "border-color": "border",
      "box-shadow": "shadow",
      "font-size": "text",
      "line-height": "line-h",
      "letter-spacing": "spacing",
      "font-weight": "weight",
      "font-family": "font",
    }[cssName] ?? cssName
  );
};

const PropsByName = {
  padding: [
    { name: (n) => `${n.replace("-", "")}`, css: (v) => `padding:${v}` },
    { name: (n) => `${n}r`, css: (v) => `padding-right:${v}` },
    { name: (n) => `${n}l`, css: (v) => `padding-left:${v}` },
    { name: (n) => `${n}t`, css: (v) => `padding-top:${v}` },
    { name: (n) => `${n}b`, css: (v) => `padding-bottom:${v}` },
    { name: (n) => `${n}x`, css: (v) => `padding-inline:${v}` },
    { name: (n) => `${n}y`, css: (v) => `padding-block:${v}` },
  ],
  margin: [
    { name: (n) => `${n.replace("-", "")}`, css: (v) => `margin:${v}` },
    { name: (n) => `${n}r`, css: (v) => `margin-right:${v}` },
    { name: (n) => `${n}l`, css: (v) => `margin-left:${v}` },
    { name: (n) => `${n}t`, css: (v) => `margin-top:${v}` },
    { name: (n) => `${n}b`, css: (v) => `margin-bottom:${v}` },
    { name: (n) => `${n}x`, css: (v) => `margin-inline:${v}` },
    { name: (n) => `${n}y`, css: (v) => `margin-block:${v}` },
  ],
  width: [
    { name: (n) => n, css: (v) => `width:${v}` },
    { name: (n) => `min-${n}`, css: (v) => `min-width:${v}` },
    { name: (n) => `max-${n}`, css: (v) => `max-width:${v}` },
  ],
  height: [
    { name: (n) => n, css: (v) => `height:${v}` },
    { name: (n) => `min-${n}`, css: (v) => `min-height:${v}` },
    { name: (n) => `max-${n}`, css: (v) => `max-height:${v}` },
  ],
  size: [{ name: (n) => n, css: (v) => `height:${v};width:${v}` }],
  border: [
    { name: (n) => n.replace("-", ""), css: (v) => `border:${v}` },
    { name: (n) => `${n}-t`, css: (v) => `border-top:${v}` },
    { name: (n) => `${n}-r`, css: (v) => `border-right:${v}` },
    { name: (n) => `${n}-b`, css: (v) => `border-bottom:${v}` },
    { name: (n) => `${n}-l`, css: (v) => `border-left:${v}` },
    { name: (n) => `${n}-x`, css: (v) => `border-inline:${v}` },
    { name: (n) => `${n}-y`, css: (v) => `border-block:${v}` },
  ],
  "border-width": [
    { name: (n) => n.replace("-", ""), css: (v) => `border-width:${v}` },
    { name: (n) => `${n}-t`, css: (v) => `border-top-width:${v}` },
    { name: (n) => `${n}-r`, css: (v) => `border-right-width:${v}` },
    { name: (n) => `${n}-b`, css: (v) => `border-bottom-width:${v}` },
    { name: (n) => `${n}-l`, css: (v) => `border-left-width:${v}` },
    { name: (n) => `${n}-x`, css: (v) => `border-inline-width:${v}` },
    { name: (n) => `${n}-y`, css: (v) => `border-block-width:${v}` },
  ],
  "border-radius": [
    { name: (n) => n.replace("-", ""), css: (v) => `border-radius:${v}` },
    { name: (n) => `${n}-t`, css: (v) => `border-top-left-radius:${v};border-top-right-radius:${v}` },
    { name: (n) => `${n}-r`, css: (v) => `border-top-right-radius:${v};border-bottom-right-radius:${v}` },
    { name: (n) => `${n}-b`, css: (v) => `border-bottom-right-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n) => `${n}-l`, css: (v) => `border-top-left-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n) => `${n}-tl`, css: (v) => `border-top-left-radius:${v}` },
    { name: (n) => `${n}-tr`, css: (v) => `border-top-right-radius:${v}` },
    { name: (n) => `${n}-br`, css: (v) => `border-bottom-right-radius:${v}` },
    { name: (n) => `${n}-bl`, css: (v) => `border-bottom-left-radius:${v}` },
  ],
};

export const getStaticCss = () => `\n
.select-none {user-select:none;} .select-text {user-select:text;} .select-all {user-select:all;} .select-auto {user-select:auto;}
.fixed{position:fixed;} .absolute{position:absolute;} .relative{position:relative;} .sticky {position:-webkit-sticky;position:sticky;} .static{position:static;} .initial{position:initial;} .inherit{position:inherit;} .unset{position:unset;} 
.opacity-0{opacity:0;} .opacity-10{opacity:0.1;} .opacity-20{opacity:0.2;} .opacity-30{opacity:0.3;} .opacity-40{opacity:0.4;} .opacity-50{opacity:0.5;} .opacity-60{opacity:0.6;} .opacity-60{opacity:0.6;} .opacity-70{opacity:0.7;} .opacity-80{opacity:0.8;} .opacity-90{opacity:0.9;} .opacity-100{opacity:1;}
.overflow-auto{overflow:auto;}.overflow-scroll {overflow:scroll;}.overflow-hidden{overflow:hidden;}.overflow-visible{overflow:visible;}
.overflow-x-auto{overflow-x:auto;}.overflow-x-scroll {overflow-x:scroll;}.overflow-x-hidden{overflow-x:hidden;}.overflow-x-visible{overflow-x:visible;}
.overflow-y-auto{overflow-y:auto;}.overflow-y-scroll {overflow-y:scroll;}.overflow-y-hidden{overflow-y:hidden;}.overflow-y-visible{overflow-y:visible;}
.bg-transparent {background-color:transparent !important;} .bg-none {background-color:unset!important;} 
.text-transparent {color:transparent !important;} .text-none {color:unset!important;}
.fill-transparent {fill:transparent !important;} .fill-none {fill:unset!important;}
.m-auto {margin:auto;} .mt-auto {margin-top:auto;} .mb-auto {margin-bottom:auto;} .ml-auto {margin-left:auto;} .mr-auto {margin-right:auto;} .mx-auto {margin-left:auto; margin-right:auto;} .my-auto {margin-top:auto; margin-bottom:auto;}
.overflow-auto::-webkit-scrollbar {height:var(--scroller-size);width:var(--scroller-size)}
.overflow-auto::-webkit-scrollbar-thumb {border-radius:2px;background-color:var(--scroller-thumb);}
.overflow-auto::-webkit-scrollbar-track {background-color:var(--scroller-bg);border-radius:2px;}
.overflow-auto::-webkit-scrollbar-track {background-color:var(--scroller-bg);}
.hide-scroller::-webkit-scrollbar{display:none;}
.flex-grow {flex-grow:1;}
.flex,.row,.col,.wrap,.center{display:flex;}
.row,.row-center,.row-start,.row-end{flex-direction:row;}
.row-center,.center{align-items:center;}
.row-start{align-items:flex-start;}
.row-end{align-items:flex-end;}
.col,.col-center,.col-start,.col-end{flex-direction:column;}
.col-center,.center{justify-content:center;}
.col-start{justify-content:flex-start;}
.col-end{justify-content:flex-end;}
.wrap{ flex-wrap:wrap;}
.h-screen{height:100vh;}
.w-screen{width:100vw;}    
.w-fill{width:100%;} 
.h-fill{height:100%;}
.min-w-max{min-width:max-content;} 
.items-center {align-items:center;}
.items-start {align-items:flex-start;}
.items-end {align-items:flex-end;}
.justify-center {justify-content:center;}
.justify-start {justify-content:flex-start;}
.justify-end {justify-content:flex-end;}
.justify-between {justify-content:space-between;}
.justify-around {justify-content:space-around;}
.justify-evenly {justify-content:space-evenly;}
.self-start {align-self:flex-start;}
.self-center {align-self:center;}  
.self-end {align-self:flex-end;}
.self-stretch {align-self:stretch;}
.col-span-full{grid-column:1 / -1;}    
.col-span-1{grid-column:span 1 / span 1;}
.col-span-2{grid-column:span 2 / span 2;}
.col-span-3{grid-column:span 3 / span 3;}
.row-span-full {grid-row:1/-1;}
.row-span-1{grid-row:span 1 / span 1;}
.row-span-2{grid-row:span 2 / span 2;}
.row-span-3{grid-row:span 3 / span 3;}
.text-center{text-align:center;}
.text-left{text-align:left;}
.text-right{text-align:right;} 
.pointer{cursor:pointer;}
.cursor-default{cursor:default;}
.cursor-cursor{cursor:w-resize;}
.pointer-none{pointer-events:none;}
.pointer-auto{pointer-events:auto;}
.pointer-all{pointer-events:all;}
`;

create.ts 
import { Controller } from "./controller.js";
import { getDefaultName, getPropsNames, getStaticCss, getThemes } from "./utils.js";

let cssContent = "";
const variables: string[] = [];
let useStaticNumbers = false;
export const getMoonCss = async () => {
  const { themes, styles } = Controller.config;
  useStaticNumbers = Controller.config.useStaticNumbers ?? false;
  cssContent = "";

  cssContent += getThemes(themes);
  cssContent += getStaticCss();
  styles.forEach(setup);
  cssContent += `\n:root{\n${variables.join("\n")}\n}\n`;

  return cssContent;
};

const setup = ({ props, values, variableName }) => {
  if (!props || !Object.keys(props).length) {
    Object.entries(values).forEach(([valueKey, valueValue]) => {
      const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
      variables.push(`${_variableName}:${valueValue};`);
    });
    return;
  }
  Object.entries(values).forEach(([valueKey, valueValue]) => {
    const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
    variables.push(`${_variableName}:${valueValue};`);
    const valueName = useStaticNumbers ? valueValue : `var(${_variableName})`;
    Object.entries(props).forEach(([prop, shortN]) => {
      const extraProps = getPropsNames(prop);
      const _shortN = shortN ?? getDefaultName(prop);
      extraProps.forEach(({ name, css }) => {
        const _name = name(_shortN);
        const dash = _name && valueKey ? "-" : "";
        const className = `.${_name}${dash}${valueKey}`;
        const classValue = css(valueName);
        cssContent += `${className}{${classValue};}`;
      });
    });
    cssContent += `\n`;
  });
}; 

controller.ts 
import { getMoonCss } from "./create.js";
import { createFile, createFolder } from "./owlFs.js";

export const Controller = {
  createStyles: async () => {
    await createFolder(Controller.config.outputPath ?? "./src/styles", {
      moon: { name: "moon.css", content: await getMoonCss() },
    });
  },

  init: async (config) => {
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

moon.config.json
{
  "$schema": "./moon.config.schema.json",
  "styles": [
    {
      "props": { "padding": "p", "margin": "m", "gap": "gap", "inset": "inset", "top": "top", "left": "left", "right": "right", "bottom": "bottom" },
      "variableName": "spacing",
      "values": {
        "0": "0",
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "10px",
        "xl": "12px",
        "2x": "16px",
        "3x": "20px",
        "4x": "26px",
        "5x": "32px",
        "6x": "40px"
      }
    },
    {
      "props": { "width": "w", "height": "h", "size": "size" },
      "variableName": "size",
      "values": {
        "0": "0",
        "xs": "20px",
        "sm": "40px",
        "md": "80px",
        "lg": "100px",
        "xl": "120px",
        "2x": "160px",
        "3x": "200px",
        "4x": "260px",
        "5x": "320px",
        "6x": "400px"
      }
    },
    {
      "props": { "font-size": "text" },
      "variableName": "text",
      "values": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "md": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2x": "1.5rem",
        "3x": "1.875rem",
        "4x": "2.25rem",
        "5x": "3rem",
        "6x": "4rem"
      }
    },
    {
      "props": { "border-radius": "round" },
      "variableName": "round",
      "values": {
        "none": "0px",
        "sm": "4px",
        "md": "8px",
        "lg": "16px",
        "xl": "24px",
        "2x": "32px",
        "full": "999px"
      }
    },
    {
      "props": { "font-weight": "weight" },
      "variableName": "weight",
      "values": {
        "normal": 400,
        "bold": 700
      }
    },
    {
      "props": { "line-height": "line-h" },
      "variableName": "line-h",
      "values": {
        "normal": 1.5,
        "dense": 1.25,
        "loose": 2
      }
    },
    {
      "props": { "font-family": "font" },
      "variableName": "font",
      "values": {
        "sans": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"",
        "serif": "Georgia, Cambria, \"Times New Roman\", Times, serif",
        "mono": "Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
      }
    },
    {
      "props": { "box-shadow": "shadow" },
      "variableName": "shadow",
      "values": {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        "lg": "0 4px 8px 0 rgba(0, 0, 0, 0.05)",
        "xl": "0 8px 16px 0 rgba(0, 0, 0, 0.05)",
        "2x": "0 16px 24px 0 rgba(0, 0, 0, 0.05)",
        "focus": "0px 0px 6px rgba(32, 211, 238,0.5)",
        "error": "0px 0px 6px rgba(231, 53, 60,0.5)",
        "LOL": "0px 0px 6px rgba(231, 53, 60,1)",
        "none": "none"
      }
    },
    {
      "props": { "border-width": "border" },
      "variableName": "border",
      "values": {
        "none": "0px",
        "thin": "1px",
        "thick": "20px"
      }
    },
    {
      "props": { "z-index": "z" },
      "variableName": "z",
      "values": {
        "0": "0",
        "10": "1",
        "20": "2",
        "30": "3",
        "40": "4",
        "50": "5",
        "60": "6",
        "70": "7",
        "80": "8",
        "90": "9",
        "100": "10"
      }
    }
  ],

  "themes": {
    "root": {
      "dragon": "#b5e8b8",
      "flamingo": "#f29bb9",
      "fox": "#d69e58",
      "red": "#dd3643",
      "purple": "#a855f7",
      "wolf": "#b2a47b",
      "red-1": "#f29bb9",
      "jellyfish": "#8a41e4",
      "lion": "#b59675",
      "fire": "#e9b11f",
      "lavender": "#e4b1e4",
      "tiger": "#8d3c09",
      "cyan": "#63cfc9",
      "blue": "#40acdc",
      "cyan-1": "#84d7e2",
      "green": "#56e181",
      "cyan-2": "#a0e8cc",
      "green-1": "#a5eb78",
      "penguin": "#1fd1ec",
      "orange": "#ffa44e",
      "light-gray": "#9ca3af",
      "gray": "#4b5563",
      "frog": "#bada55",
      "nice": "#83d6e1",
      "nice-2": "#a3e4cb",

      "scroller-size": "8px",
      "scroller-thumb": "#2d303eaa",
      "scroller-bg": "#c4c4c755"
    },
    "light": {
      "prim": "#FFFFFF",
      "throne": "#f6f6f6",
      "lord": "#FBFBFB",
      "prince": "#f6f6f6",
      "king": "#f6f6f6",
      "owl": "#1f1d2b",
      "shark": "#c4c4c7",
      "dolphin": "#c3c3c6",
      "goat": "#c4c4c7",
      "whale": "#bebec1",
      "main": "#fbfbfb",
      "highlight": "#FFFFFF22",
      "tester": "#f0f"
    },
    "dark": {
      "prim": "#2d303e",
      "throne": "#404453",
      "lord": "#292a39",
      "prince": "#393c4a",
      "king": "#3b3e4c",
      "owl": "#ffffff",
      "shark": "#c4c4c7",
      "dolphin": "#6c6e78",
      "goat": "#9e9fa6",
      "whale": "#767982",
      "main": "#1f1d2b",
      "highlight": "#d303e222",
      "tester": "#00f"
    }
  },
  "useStaticNumbers": false,
  "outputPath": "./styles"
} -->
Moon CSS is a lightweight CSS utility library that helps you manage and generate consistent styles in your web projects. It provides a set of predefined styles and themes, making it easy to maintain a unified design language.

Installation
To get started with Moon CSS, follow these installation instructions:

Install the package using Yarn or npm:
```bash
yarn add moon-style
```
# OR
```bash
npm install moon-style
```

# Configuration

Moon CSS allows you to customize styles and themes by using a configuration file. If you don't have a moon.config.json file in your project, Moon CSS will create a default configuration for you at ./styles/moon.config.json.

Here's what the default configuration file (moon.config.default.json) looks like:

```js
{
  "$schema": "./node_modules/moon-style/dist/moon.config.schema.json",
  "styles": [
    {
      "props": { "padding": "p", "margin": "m", "gap": "gap", "inset": "inset", "top": "top", "left": "left", "right": "right", "bottom": "bottom" },
      "variableName": "spacing",
      "values": {
        "0": "0",
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "10px",
        "xl": "12px",
        "2x": "16px",
        "3x": "20px",
        "4x": "26px",
        "5x": "32px",
        "6x": "40px"
      }
    },
    {
      "props": { "width": "w", "height": "h", "size": "size" },
      "variableName": "size",
      "values": {
        "0": "0",
        "xs": "20px",
        "sm": "40px",
        "md": "80px",
        "lg": "100px",
        "xl": "120px",
        "2x": "160px",
        "3x": "200px",
        "4x": "260px",
        "5x": "320px",
        "6x": "400px"
      }
    },
    {
      "props": { "font-size": "text" },
      "variableName": "text",
      "values": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "md": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2x": "1.5rem",
        "3x": "1.875rem",
        "4x": "2.25rem",
        "5x": "3rem",
        "6x": "4rem"
      }
    },
    {
      "props": { "border-radius": "round" },
      "variableName": "round",
      "values": {
        "none": "0px",
        "sm": "4px",
        "md": "8px",
        "lg": "16px",
        "xl": "24px",
        "2x": "32px",
        "full": "999px"
      }
    },
    {
      "props": { "font-weight": "weight" },
      "variableName": "weight",
      "values": {
        "normal": 400,
        "bold": 700
      }
    },
    {
      "props": { "line-height": "line-h" },
      "variableName": "line-h",
      "values": {
        "normal": 1.5,
        "dense": 1.25,
        "loose": 2
      }
    },
    {
      "props": { "font-family": "font" },
      "variableName": "font",
      "values": {
        "sans": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"",
        "serif": "Georgia, Cambria, \"Times New Roman\", Times, serif",
        "mono": "Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
      }
    },
    {
      "props": { "box-shadow": "shadow" },
      "variableName": "shadow",
      "values": {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        "lg": "0 4px 8px 0 rgba(0, 0, 0, 0.05)",
        "xl": "0 8px 16px 0 rgba(0, 0, 0, 0.05)",
        "2x": "0 16px 24px 0 rgba(0, 0, 0, 0.05)",
        "focus": "0px 0px 6px rgba(32, 211, 238,0.5)",
        "error": "0px 0px 6px rgba(231, 53, 60,0.5)",
        "none": "none"
      }
    },
    {
      "props": { "border-width": "border" },
      "variableName": "border",
      "values": {
        "none": "0px",
        "thin": "1px",
        "thick": "20px"
      }
    },
    {
      "props": { "z-index": "z" },
      "variableName": "z",
      "values": {
        "0": "0",
        "10": "1",
        "20": "2",
        "30": "3",
        "40": "4",
        "50": "5",
        "60": "6",
        "70": "7",
        "80": "8",
        "90": "9",
        "100": "10"
      }
    }
  ],

  "themes": {
    "root": {
      "dragon": "#b5e8b8",
      "flamingo": "#f29bb9",
      "fox": "#d69e58",
      "red": "#dd3643",
      "purple": "#a855f7",
      "wolf": "#b2a47b",
      "red-1": "#f29bb9",
      "jellyfish": "#8a41e4",
      "lion": "#b59675",
      "fire": "#e9b11f",
      "lavender": "#e4b1e4",
      "tiger": "#8d3c09",
      "cyan": "#63cfc9",
      "blue": "#40acdc",
      "cyan-1": "#84d7e2",
      "green": "#56e181",
      "cyan-2": "#a0e8cc",
      "green-1": "#a5eb78",
      "penguin": "#1fd1ec",
      "orange": "#ffa44e",
      "light-gray": "#9ca3af",
      "gray": "#4b5563",
      "frog": "#bada55",
      "nice": "#83d6e1",
      "nice-2": "#a3e4cb",

      "scroller-size": "8px",
      "scroller-thumb": "#2d303eaa",
      "scroller-bg": "#c4c4c755"
    },
    "light": {
      "prim": "#FFFFFF",
      "throne": "#f6f6f6",
      "lord": "#FBFBFB",
      "prince": "#f6f6f6",
      "king": "#f6f6f6",
      "owl": "#1f1d2b",
      "shark": "#c4c4c7",
      "dolphin": "#c3c3c6",
      "goat": "#c4c4c7",
      "whale": "#bebec1",
      "main": "#fbfbfb",
      "highlight": "#FFFFFF22",
      "tester": "#f0f"
    },
    "dark": {
      "prim": "#2d303e",
      "throne": "#404453",
      "lord": "#292a39",
      "prince": "#393c4a",
      "king": "#3b3e4c",
      "owl": "#ffffff",
      "shark": "#c4c4c7",
      "dolphin": "#6c6e78",
      "goat": "#9e9fa6",
      "whale": "#767982",
      "main": "#1f1d2b",
      "highlight": "#d303e222",
      "tester": "#00f"
    }
  },
  "useStaticNumbers": false,
  "outputPath": "./styles"
}

```

Feel free to customize this file to suit your project's specific styling needs.

# Customization (Optional)
If you wish to customize the default configuration, follow these steps:
<!-- 
Create a moon.config.json file in your project's root directory.

Modify the moon.config.json file to define your own styles, themes, and other configuration options. -->

Create a `moon.config.json` file in your project's root directory.

Modify the `moon.config.json` file to define your own styles, themes, and other configuration options.


# CSS Generation
To generate the CSS file based on your configuration, run the following command:

```bash
yarn moon
```
# OR
```bash
npm run moon
```

This command will generate a `moon.css` file in your project's output directory.

# Importing CSS
To apply the generated styles to your web project, import the `moon.css` file into your main TypeScript (`main.ts`) or JavaScript (`index.js`) file:

```js
import "./path/to/moon.css";
// by default is import "./styles/moon.css";
```

Now, your project will have consistent and unified styles based on your Moon CSS configuration.

