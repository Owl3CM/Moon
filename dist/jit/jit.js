import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { Controller, cssFolder } from "../builder/controller.js";
import path from "path";
const config = JSON.parse(readFileSync("./moon.config.json"));
const ColorsPropsByShourtNames = {
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
let JitGenerated = {};
let isChanged = false;
const customClassPatterns = {
    actions: /([a-zA-Z0-9-:]+):\[([a-zA-Z0-9-,:#%]+)\]/g,
    colors: /([a-zA-Z0-9-]+):#([a-zA-Z0-9-]+)/g,
    spacing: /([a-zA-Z0-9-]+):([0-9]+(px|rem|%|vw|vh|em|ch|ex|cm|mm|in|pt|pc))/g,
};
const scanDirectoryForExtract = (directory) => {
    const files = readdirSync(directory);
    files.forEach((file) => {
        try {
            const filePath = path.join(directory, file);
            const fileStat = statSync(filePath);
            if (fileStat.isDirectory()) {
                scanDirectoryForExtract(filePath);
            }
            else if (fileStat.isFile() && /\.(js|jsx|ts|tsx)$/i.test(file)) {
                Extract(filePath);
            }
        }
        catch (e) { }
    });
};
export const Jit_Start = () => {
    JitGenerated = {};
    isChanged = false;
    try {
        scanDirectoryForExtract(config.projectDir ?? "./src");
        Jit_End();
    }
    catch (e) { }
};
export const Sync_Changes = (filePath) => {
    try {
        Extract(filePath);
        Jit_End();
    }
    catch (e) { }
};
const Jit_End = () => {
    if (isChanged) {
        isChanged = false;
        writeFileSync(`${cssFolder}/moon/moon.jit.css`, `\n${Object.values(JitGenerated).join("\n")}`);
    }
};
export const Extract = (_filePath) => {
    // const fileContent = readFileSync("./src/vite/main.tsx", "utf8");
    const fileContent = readFileSync(_filePath, "utf8");
    try {
        extractActions(fileContent);
        extractColors(fileContent);
        extractSpacing(fileContent);
    }
    catch (e) { }
};
const extractActions = (fileContent) => {
    const pattern = customClassPatterns.actions;
    const matchs = fileContent.match(pattern);
    matchs?.forEach((match) => {
        if (JitGenerated[match])
            return;
        const data = match.split(":[");
        const rest = data[0].split(":");
        const classes = data[1].slice(0, -1).split(",");
        // const test = classes.join("\\,").replace(":", "\\:").replace("#", "\\#").replace("%", "\\%");
        const test = classes.join("\\,").split(":").join("\\:").split("#").join("\\#").split("%").join("\\%");
        const name = rest.join("\\:") + `\\:\\[${test}\\]:` + rest.join(":");
        const classValueContent = classes
            .map((className) => {
            let v = Controller.GeneratedClasses[className];
            if (!v) {
                const [propName, colorValue] = className.split(":");
                v = `${colorValue.startsWith("#") ? `${ColorsPropsByShourtNames[propName]}:${colorValue}` : getCustomClassValue(propName, colorValue)}`;
            }
            return `${v};`;
        })
            .join("");
        JitGenerated[match] = `.${name}{${classValueContent}}`;
        isChanged = true;
    });
};
const extractColors = (fileContent) => {
    const pattern = customClassPatterns.colors;
    const matchs = fileContent.match(pattern);
    matchs?.forEach((match) => {
        if (JitGenerated[match])
            return;
        const data = match.split(":");
        const propName = data[0];
        const colorValue = data[1];
        const name = `${propName}\\:\\${colorValue}`;
        const classValueContent = `${ColorsPropsByShourtNames[propName]}:${colorValue}`;
        JitGenerated[match] = `.${name}{${classValueContent}}`;
        isChanged = true;
    });
};
const extractSpacing = (fileContent) => {
    const pattern = customClassPatterns.spacing;
    const matchs = fileContent.match(pattern);
    matchs?.forEach((match) => {
        if (JitGenerated[match])
            return;
        const data = match.split(":");
        const propName = data[0];
        const propValue = data[1];
        const name = `${propName}\\:${propValue.replace("%", "\\%")}`;
        const classValueContent = getCustomClassValue(propName, propValue);
        JitGenerated[match] = `.${name}{${classValueContent}}`;
        isChanged = true;
    });
};
const getCustomClassValue = (name, value) => {
    const func = Controller.PropsByShourtNames[name];
    if (typeof func === "function")
        return func(value);
    return `${name}:${value}`;
};
