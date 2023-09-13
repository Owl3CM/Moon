import fs from "fs";
import path from "path";

const filePath = process.argv[2];
const config = JSON.parse(await fs.promises.readFile("./moon.config.json"));
console.log(JSON.stringify(process.argv));
const normalizedFilePath = path.normalize(filePath);
console.log(`File changed: ${normalizedFilePath}`);
// Define the custom class name pattern
const customClassPatterns = {
  hover: /hover:([a-zA-Z0-9-]+)/g,
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
        // Generate CSS rules based on custom class names
        customClassNames.forEach((className) => {
          const [cssProp, cssVarible] = splitString(className);
          // const cssPropertyName = className.replace("-", ":");
          cssRules.push(`.${pK}\\:${className}:${pK} { 
            ${colorsKeys[cssProp]}: var(--${cssVarible});
        }`);
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
