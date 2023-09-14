import fs from "fs";
import path from "path";
import chalk from "chalk";
import { moonPath } from "./controller";
const filePath = process.argv[2];
const config = JSON.parse(await fs.promises.readFile("./moon.config.json"));
console.log(JSON.stringify(process.argv));
const normalizedFilePath = path.normalize(filePath);
console.log(`File changed lol: ${normalizedFilePath}`);
const customClassPatterns = {
    hover: /hover\[([a-zA-Z0-9-,]+)\]/g,
    md: /hover\[([a-zA-Z0-9-,]+)\]/g,
};
const cssRules = [];
const projectDirectory = config.projectDir ?? "./src";
function scanDirectory(directory) {
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
        const filePath = path.join(directory, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory()) {
            scanDirectory(filePath);
        }
        else if (fileStat.isFile() && /\.(js|jsx|ts|tsx)$/i.test(file)) {
            const fileContent = fs.readFileSync(filePath, "utf8");
            Object.entries(customClassPatterns).forEach(([pK, pattern]) => {
                const customClassNames = [...fileContent.matchAll(pattern)].map((match) => match[1]);
                customClassNames.forEach((classNames) => {
                    const classes = classNames.split(",");
                    let content = "";
                    if (pK === "md") {
                        content = `@media (min-width: 500PX) { .${pK}\\[${classes.join("\\,")}\\] { `;
                        classes.forEach((className) => {
                            console.log(chalk.cyanBright.bold("\n" + className + "\n"));
                            const [cssProp, cssVarible] = splitString(className);
                            content += `${colorsKeys[cssProp]}: var(--${cssVarible});`;
                        });
                        content += "}}";
                    }
                    else {
                        content = `.${pK}\\[${classes.join("\\,")}\\]:${pK} { `;
                        classes.forEach((className) => {
                            console.log(chalk.cyanBright.bold("\n" + className + "\n"));
                            const [cssProp, cssVarible] = splitString(className);
                            content += `${colorsKeys[cssProp]}: var(--${cssVarible});`;
                        });
                        content += "}";
                    }
                    cssRules.push(content);
                });
            });
        }
    });
}
const colorsKeys = {
    bg: "background-color",
    text: "color",
    fill: "fill",
    border: "border-color",
    stroke: "stroke",
    p: "padding",
};
scanDirectory(projectDirectory);
fs.writeFileSync(`${moonPath}/moon/moon.jit.css`, cssRules.join("\n"));
function splitString(inputString) {
    const hyphenIndex = inputString.indexOf("-");
    if (hyphenIndex !== -1) {
        const firstPart = inputString.slice(0, hyphenIndex);
        const secondPart = inputString.slice(hyphenIndex + 1);
        return [firstPart, secondPart];
    }
    return [inputString, ""];
}
