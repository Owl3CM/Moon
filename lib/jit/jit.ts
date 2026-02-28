/**
 * Moon-Style JIT Engine
 *
 * Scans .tsx/.jsx/.ts/.js files for utility class patterns and generates
 * corresponding CSS on-the-fly.
 *
 * KNOWN LIMITATIONS:
 * - Regex scans raw file text with no context awareness
 * - Matches inside comments, strings, URLs, and template literals
 * - `bg:#debug` in a comment will generate a real CSS class
 * - `href="/page#section"` will match the colors pattern
 * - No word boundary on spacing pattern — matches inside CSS values
 *
 * These are acceptable tradeoffs for simplicity. If false positives
 * cause issues, consider adding a configurable `classAttributes` filter.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { Controller, cssFolder } from "../builder/controller.js";
import path from "path";

let config: any;

const ColorsPropsByShortNames: { [key: string]: string } = {
  bg: "background-color",
  text: "color",
  fill: "fill",
  border: "border-color",
  stroke: "stroke",
  "border-r": "border-right-color",
  "border-l": "border-left-color",
  "border-t": "border-top-color",
  "border-b": "border-bottom-color",
};

let JitGenerated: { [key: string]: string } = {};
let isChanged = false;

const customClassPatterns = {
  actions: /([a-zA-Z0-9-:]+):\[([a-zA-Z0-9-,:#%]+)\]/g,
  colors: /([a-zA-Z0-9-]+):#([a-zA-Z0-9-]+)/g,
  spacing: /([a-zA-Z0-9-]+):([0-9]+(px|rem|%|vw|vh|em|ch|ex|cm|mm|in|pt|pc))/g,
};

const scanDirectoryForExtract = async (directory: string) => {
  const files = readdirSync(directory);
  for (const file of files) {
    try {
      const filePath = path.join(directory, file);
      const fileStat = statSync(filePath);
      if (fileStat.isDirectory()) {
        await scanDirectoryForExtract(filePath);
      } else if (fileStat.isFile() && /\.(js|jsx|ts|tsx)$/i.test(file)) {
        Extract(filePath);
      }
    } catch (e) {
      console.error(`[moon-jit] Error scanning ${path.join(directory, file)}:`, e);
    }
  }
};

export const Jit_Start = async () => {
  config = JSON.parse(readFileSync("./moon.config.json", "utf8"));
  JitGenerated = {};
  isChanged = false;
  try {
    await scanDirectoryForExtract(config.projectDir ?? "./src");
    Jit_End();
  } catch (e) {
    console.error("[moon-jit] JIT start failed:", e);
  }
};

export const Sync_Changes = (filePath: string) => {
  try {
    Extract(filePath);
    Jit_End();
  } catch (e) {
    console.error(`[moon-jit] Sync error for ${filePath}:`, e);
  }
};

const Jit_End = () => {
  if (isChanged) {
    isChanged = false;
    writeFileSync(`${cssFolder}/moon/moon.jit.css`, `\n${Object.values(JitGenerated).join("\n")}`);
  }
};

export const Extract = (filePath: string) => {
  try {
    const fileContent = readFileSync(filePath, "utf8");
    extractActions(fileContent);
    extractColors(fileContent);
    extractSpacing(fileContent);
  } catch (e) {
    console.error(`[moon-jit] Extract error for ${filePath}:`, e);
  }
};

const extractActions = (fileContent: string) => {
  const pattern = customClassPatterns.actions;
  const matches = fileContent.match(pattern);
  matches?.forEach((match) => {
    if (JitGenerated[match]) return;
    let screen: string | undefined;
    const data = match.split(":[");
    const rest = data[0].split(":");
    const classes = data[1].slice(0, -1).split(",");
    const cleanClassesName = classes.join("\\,").split(":").join("\\:").split("#").join("\\#").split("%").join("\\%");
    let name = rest.join("\\:") + `\\:\\[${cleanClassesName}\\]`;
    rest.forEach((act) => {
      const _screen = config.screens?.[act];
      if (_screen) {
        screen = _screen;
      } else if (act === "before" || act === "after") {
        classes.push(`content:${act}`);
        name += `::${act}`;
      } else name += `:${act}`;
    });
    const classValueContent = classes
      .map((className) => {
        let v = Controller.GeneratedClasses[className];
        if (!v) {
          const [propName, colorValue] = className.split(":");
          v = `${colorValue.startsWith("#") ? `${ColorsPropsByShortNames[propName] ?? propName}:${colorValue}` : getCustomClassValue(propName, colorValue)}`;
        }
        return `${v};`;
      })
      .join("");

    const generated = `.${name}{${classValueContent}}`;
    JitGenerated[match] = screen ? `@media (max-width: ${screen}){${generated}}` : generated;
    isChanged = true;
  });
};

const extractColors = (fileContent: string) => {
  const pattern = customClassPatterns.colors;
  const matches = fileContent.match(pattern);
  matches?.forEach((match) => {
    if (JitGenerated[match]) return;
    const data = match.split(":");
    const propName = data[0];
    const colorValue = data[1];
    const name = `${propName}\\:\\${colorValue}`;
    const resolvedProp = ColorsPropsByShortNames[propName];
    if (!resolvedProp) return;
    const classValueContent = `${resolvedProp}:${colorValue}`;
    JitGenerated[match] = `.${name}{${classValueContent}}`;
    isChanged = true;
  });
};

const extractSpacing = (fileContent: string) => {
  const pattern = customClassPatterns.spacing;
  const matches = fileContent.match(pattern);
  matches?.forEach((match) => {
    if (JitGenerated[match]) return;
    const data = match.split(":");
    const propName = data[0];
    const propValue = data[1];
    const name = `${propName}\\:${propValue.replace("%", "\\%")}`;
    const classValueContent = getCustomClassValue(propName, propValue);
    JitGenerated[match] = `.${name}{${classValueContent}}`;
    isChanged = true;
  });
};

const getCustomClassValue = (name: string, value: string): string => {
  const func = Controller.PropsByShortNames[name];
  if (typeof func === "function") return func(value);
  return `${name}:${value}`;
};
