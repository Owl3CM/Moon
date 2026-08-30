import fs from "fs";
import path from "path";
import { openUI } from "./icons-server.js";
import { ICONS_SVG_DIR, slugify, resolveProjectIconsDir, ensureIconsCache } from "./icons-utils.js";

// ── CLI Entry Point ──────────────────────────────────────────────────────────

export { resolveProjectIconsDir, ensureIconsCache } from "./icons-utils.js";

const STYLES = ["Bold", "Outline", "Line Duotone", "Broken", "Linear", "Bold Duotone", "Colored"];

export async function handleIconsCommand(args: string[]) {
  const command = args[0];

  await ensureIconsCache();

  switch (command) {
    case "icons:groups":
      listGroups();
      break;
    case "icons:list":
      listIcons(args[1]);
      break;
    case "icons:add":
      {
        const style = getStyleArg(args);
        const targets = args.slice(1).filter((a) => !a.startsWith("--"));
        addIcons(targets.length ? targets : [undefined as any], style);
      }
      break;
    case "icons:ui":
      openUI();
      break;
    default:
      console.log(`Unknown icon command: ${command}`);
  }
}

function findAvailableStyleDir(): string | null {
  for (const style of STYLES) {
    const dir = path.join(ICONS_SVG_DIR, style);
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

// ── Commands ─────────────────────────────────────────────────────────────────

function listGroups() {
  const styleDir = findAvailableStyleDir();
  if (!styleDir) return console.error("Cache corrupted. Delete ~/.moon-icons to reset.");

  const groups = fs.readdirSync(styleDir).filter((f) => fs.statSync(path.join(styleDir, f)).isDirectory());
  console.log("Available Groups:\n" + groups.map((g) => `- ${g}`).join("\n"));
}

function listIcons(group?: string) {
  const styleDir = findAvailableStyleDir();
  if (!styleDir) return;

  if (!group || group.startsWith("--")) {
    const allIcons = new Set<string>();
    const groups = fs.readdirSync(styleDir).filter((f) => fs.statSync(path.join(styleDir, f)).isDirectory());
    for (const g of groups) {
      const gPath = path.join(styleDir, g);
      const icons = fs.readdirSync(gPath).filter((f) => f.endsWith(".svg"));
      icons.forEach((i) => allIcons.add(i.replace(".svg", "")));
    }
    console.log(
      "All Available Icons:\n" +
        Array.from(allIcons)
          .sort()
          .map((i) => `- ${i}`)
          .join("\n"),
    );
  } else {
    const gPath = path.join(styleDir, group);
    if (!fs.existsSync(gPath)) {
      return console.error(`Group "${group}" not found. Run 'moon icons:groups' to see available groups.`);
    }
    const icons = fs.readdirSync(gPath).filter((f) => f.endsWith(".svg"));
    console.log(`Available Icons in "${group}":\n` + icons.map((i) => `- ${i.replace(".svg", "")}`).join("\n"));
  }
}

function getStyleArg(args: string[]): string | null {
  for (const arg of args) {
    if (arg.startsWith("--style=")) return arg.split("=")[1];
  }
  return null;
}

function addIcons(targets: (string | undefined)[], style: string | null) {
  if (!style) {
    return console.error("Error: --style argument is required (e.g., --style=Bold)");
  }

  const baseDir = resolveProjectIconsDir();
  const targetDir = path.join(baseDir, style.toLowerCase());
  fs.mkdirSync(targetDir, { recursive: true });

  const styleDir = path.join(ICONS_SVG_DIR, style);
  if (!fs.existsSync(styleDir)) {
    return console.error(`Style "${style}" not found in cache. Valid styles: ${STYLES.join(", ")}`);
  }

  let totalAdded = 0,
    totalSkipped = 0;

  for (const target of targets) {
    if (!target || target.startsWith("--")) {
      // Add ALL icons for this style
      console.log(`Adding ALL icons for style ${style}...`);
      const groups = fs.readdirSync(styleDir).filter((f) => fs.statSync(path.join(styleDir, f)).isDirectory());
      for (const g of groups) {
        const gPath = path.join(styleDir, g);
        for (const icon of fs.readdirSync(gPath).filter((f) => f.endsWith(".svg"))) {
          const dest = path.join(targetDir, slugify(icon.replace(".svg", "")) + ".svg");
          if (copyIcon(path.join(gPath, icon), dest, false)) totalAdded++;
          else totalSkipped++;
        }
      }
    } else if (target.includes("/")) {
      // Single icon: group/icon
      const [group, iconName] = target.split("/");
      const srcPath = path.join(styleDir, group, `${iconName}.svg`);
      if (!fs.existsSync(srcPath)) {
        console.error(`Icon "${target}" not found in cache.`);
        continue;
      }
      const dest = path.join(targetDir, slugify(iconName) + ".svg");
      if (copyIcon(srcPath, dest, true)) {
        totalAdded++;
        console.log(`  + ${target}`);
      } else totalSkipped++;
    } else {
      // Whole group
      const gPath = path.join(styleDir, target);
      if (!fs.existsSync(gPath)) {
        console.error(`Group "${target}" not found in cache.`);
        continue;
      }
      let added = 0;
      for (const icon of fs.readdirSync(gPath).filter((f) => f.endsWith(".svg"))) {
        const dest = path.join(targetDir, slugify(icon.replace(".svg", "")) + ".svg");
        if (copyIcon(path.join(gPath, icon), dest, false)) {
          added++;
          totalAdded++;
        } else totalSkipped++;
      }
      console.log(`  + ${target}: ${added} icons`);
    }
  }

  console.log(`\nDone. Added ${totalAdded} icons. Skipped ${totalSkipped} existing.`);
}

function copyIcon(src: string, dest: string, force: boolean): boolean {
  if (fs.existsSync(dest) && !force) return false;
  fs.copyFileSync(src, dest);
  return true;
}
