import { appendFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";
import { cssFolder, packagePath } from "./controller.js";
import { logger } from "./owlFs.js";
import { ClassesGenerated } from "./ClassesGenerated.js";
import { JitGenerated } from "./JitGenerated.js";
const colorsKeys = {
  bg: "background-color",
  text: "color",
  fill: "fill",
  border: "border-color",
  stroke: "stroke",
  "border-r": "border-right-color",
  "border-l": "border-left-color",
  "border-t": "border-top-color",
  "border-b": "border-bottom-color",
  p: "padding",
  m: "margin",
  w: "width",
  h: "height",
  minw: "min-width",
  minh: "min-height",
  maxw: "max-width",
  maxh: "max-height",
  "text-overflow": "text-overflow",
  "text-align": "text-align",
  "vertical-align": "vertical-align",
  "white-space": "white-space",
  "font-size": "font-size",
  "font-family": "font-family",
  "font-weight": "font-weight",
  "font-style": "font-style",
  "letter-spacing": "letter-spacing",
  "line-height": "line-height",
};

const newJitGenerated = {};

const filePath = process.argv[2];
logger(process);
let config = {};
try {
  const config_content = readFileSync("./moon.config.json") as any;
  config = config_content ? JSON.parse(config_content) : {};
} catch (e) {
  logger(e, "error");
}
console.log(JSON.stringify(process.argv));
// const normalizedFilePath = path.normalize(filePath);
// console.log(`File changed lol: ${normalizedFilePath}`);

const start = () => {
  const customClassPatterns = {
    all: /([a-zA-Z0-9-:]+):\[([a-zA-Z0-9-,:#]+)\]/g,
    colors: /([a-zA-Z0-9-]+):#([a-zA-Z0-9-]+)/g,
    spacing: /([a-zA-Z0-9-]+):([0-9]+(px|rem|%|vw|vh|em|ch|ex|cm|mm|in|pt|pc))/g,
  };
  const projectDirectory = "./src/vite";

  function scanDirectory(directory) {
    const files = readdirSync(directory);
    files.forEach((file) => {
      try {
        const filePath = path.join(directory, file);
        const fileStat = statSync(filePath);
        if (fileStat.isDirectory()) {
          scanDirectory(filePath);
        } else if (fileStat.isFile() && /\.(js|jsx|ts|tsx)$/i.test(file)) {
          const fileContent = readFileSync(filePath, "utf8");
          // if (!fileContent.includes("bg:#fff")) return;
          extract(fileContent);
          extractColors(fileContent);
          extractSpacing(fileContent);
        }
      } catch (e) {
        logger(e, "error");
      }
    });
  }
  scanDirectory(projectDirectory);

  //   const fileContent = readFileSync("./src/vite/APP.tsx", "utf8");
  //   try {
  //     extract(fileContent);
  //     extractColors(fileContent);
  //     extractSpacing(fileContent);
  //   } catch (e) {
  //     logger(e, "error");
  //   }

  function extract(fileContent) {
    const pattern = customClassPatterns.all;
    const matchs = fileContent.match(pattern);
    logger(matchs, "matchs");
    matchs?.forEach((match) => {
      if (JitGenerated[match]) return;
      const data = match.split(":[");
      const rest = data[0].split(":");
      const classes = data[1].slice(0, -1).split(",");
      const test = classes.join("\\,").split(":").join("\\:").split("#").join("\\#");
      const name = rest.join("\\:") + `\\:\\[${test}\\]:` + rest.join(":");
      const classesContent = classes
        .map((className) => {
          let v = ClassesGenerated[className];
          if (!v) {
            logger(className, "className");
            const [propName, colorValue] = className.split(":");
            v = `${colorsKeys[propName]}:${colorValue}`;
          }
          return `${v};`;
        })
        .join("");
      newJitGenerated[match] = `.${name}{${classesContent}}`;
    });
  }
  function extractColors(fileContent) {
    const pattern = customClassPatterns.colors;
    const matchs = fileContent.match(pattern);
    logger(matchs, "matchs");
    matchs?.forEach((match) => {
      if (JitGenerated[match]) return;
      const data = match.split(":");
      const propName = data[0];
      const colorValue = data[1];
      const name = `${propName}\\:\\${colorValue}`;
      const classesContent = `${colorsKeys[propName]}:${colorValue}`;
      newJitGenerated[match] = `.${name}{${classesContent}}`;
    });
  }
  function extractSpacing(fileContent) {
    const pattern = customClassPatterns.spacing;
    const matchs = fileContent.match(pattern);
    logger(matchs, "matchs");
    matchs?.forEach((match) => {
      if (JitGenerated[match]) return;
      const data = match.split(":");
      const propName = data[0];
      const colorValue = data[1];
      const name = `${propName}\\:${colorValue}`;
      const classesContent = `${colorsKeys[propName]}:${colorValue}`;
      newJitGenerated[match] = `.${name}{${classesContent}}`;
    });
  }
  logger(newJitGenerated, "newJitGenerated");
  if (Object.keys(newJitGenerated).length) {
    const toWrite = { ...JitGenerated, ...newJitGenerated };
    logger(toWrite, "toWrite");
    writeFileSync(
      `${packagePath}/JitGenerated.js`,
      `/* This file is generated by Moon Style. Do not edit it manually. */
      export const JitGenerated=${JSON.stringify(toWrite)}`
    );
    appendFileSync(`${cssFolder}/moon/moon.jit.css`, `\n${Object.values(newJitGenerated).join("\n")}`);
  }
};
start();

export const jitGenerate = () => {
  writeFileSync(
    `${packagePath}/JitGenerated.js`,
    `/* This file is generated by Moon Style. Do not edit it manually. */
    export const JitGenerated={}`
  );
  writeFileSync(`${cssFolder}/moon/moon.jit.css`, `/* This file is generated by Moon Style. Do not edit it manually. */`);
  start();
};
