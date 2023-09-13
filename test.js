import fs from "fs";
import path from "path";
import chalk from "chalk";

const filePath = process.argv[2];
const config = JSON.parse(await fs.promises.readFile("./moon.config.json"));
console.log(JSON.stringify(process.argv));
const normalizedFilePath = path.normalize(filePath);
console.log(`File changed: ${normalizedFilePath}`);
// Define the custom class name pattern
const customClassPatterns = {
  //   hover: /hover:([a-zA-Z0-9-]+)/g,
  //   add this pattren for hover
  // hover[bg-red,text-white]
  hover: /hover\[([a-zA-Z0-9-,]+)\]/g,
  md: /hover\[([a-zA-Z0-9-,]+)\]/g,

  //   add pattern for this
};
const cssRules = [];
// Define the directory where your project files are located
const projectDirectory = "./src"; // Change this to your project's directory

// Function to scan files and directories recursively
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // If it's a directory, scan it recursively
      scanDirectory(filePath);
    } else if (fileStat.isFile() && /\.(js|jsx|ts|tsx)$/i.test(file)) {
      // If it's a file with the specified extensions, read its content
      const fileContent = fs.readFileSync(filePath, "utf8");

      // Extract custom class names from the file content
      Object.entries(customClassPatterns).forEach(([pK, pattern]) => {
        const customClassNames = [...fileContent.matchAll(pattern)].map((match) => match[1]);
        // console.log(chalk.cyanBright.bold("\n" + customClassNames + "\n"));
        customClassNames.forEach((classNames) => {
          // const cssPropertyName = className.replace("-", ":");
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
          } else {
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
// Start scanning the project directory
scanDirectory(projectDirectory);

// Write the generated CSS to a file (e.g., generated.css)
fs.writeFileSync("generated.css", cssRules.join("\n"));

function splitString(inputString) {
  const hyphenIndex = inputString.indexOf("-"); // Find the first hyphen
  if (hyphenIndex !== -1) {
    const firstPart = inputString.slice(0, hyphenIndex); // Get the part before the hyphen
    const secondPart = inputString.slice(hyphenIndex + 1); // Get the part after the hyphen
    return [firstPart, secondPart];
  }
  // Return the input string as the first part and an empty string as the second part if there's no hyphen.
  return [inputString, ""];
}
