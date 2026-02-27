import { writeFile } from "fs/promises";
import { PurgeCSS as PurgeCSSLib } from "purgecss";
import { cssFolder, packagePath } from "./builder/controller.js";
import { fileExists, readFile } from "./helpers/owlFs.js";
import { copyFileSync } from "fs";
import { buildConfig } from "./builder/build.js";
import chokidar from "chokidar";
import { Sync_Changes, Jit_Start } from "./jit/jit.js";

const configPath = "./moon.config.json";

if (!(await fileExists(configPath))) copyFileSync(`${packagePath}/moon.config.default.json`, configPath);

const rawConfig = await readFile(configPath);
if (!rawConfig) {
  throw new Error("moon.config.json not found or empty");
}

export const PurgeCSS = async () => {
  console.log("Purging CSS...");

  const moonConfig = JSON.parse(rawConfig);
  if (!moonConfig.content) {
    throw new Error("Content not specified in moon.config.json");
  }

  const { content } = moonConfig;
  const moonCssPath = `${cssFolder}/moon`;
  const cssPaths = [`${moonCssPath}/moon.styles.css`, `${moonCssPath}/moon.themes.css`, `${moonCssPath}/moon.static.css`];

  // 1) Build & JIT first
  await buildConfig();
  await Jit_Start();

  // 2) Run PurgeCSS via JS API
  try {
    const results = await new PurgeCSSLib().purge({
      content,
      css: cssPaths,
    });

    // Write purged CSS back to the output folder
    for (const result of results) {
      if (result.file) {
        await writeFile(result.file, result.css, "utf8");
      }
    }
  } catch (err) {
    console.error("PurgeCSS execution failed:", err);
  }

  console.log("Purging CSS... done");
};

export const Watcher = async () => {
  // Read config again (could have just been created)
  let config = JSON.parse(await readFile(configPath));

  // Initial build
  await buildConfig();

  // Watch moon.config.json for changes
  const configWatcher = chokidar.watch(configPath);
  configWatcher.on("change", async () => {
    try {
      await buildConfig();
      if (config?.useJit) {
        Jit_Start();
      }
    } catch (e) {
      console.error("Error rebuilding config:", e);
    }
  });

  // If JIT is enabled, watch the files defined in config
  if (config?.useJit) {
    await Jit_Start();
    const filesWatcher = chokidar.watch(config.content[0]);
    filesWatcher.on("change", (path: string) => {
      Sync_Changes(path);
    });
  }

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    process.exit();
  });
};
