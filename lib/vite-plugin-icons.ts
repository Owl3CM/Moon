/**
 * vite-plugin-moon-icons.ts
 *
 * Moon-Style Vite Plugin that:
 *   1. Reads `moon.config.json` for icon pipeline paths
 *   2. Builds the SVGO-optimized SVG sprite on dev server startup
 *   3. Watches `svgDir` for SVG additions/removals and triggers HMR
 *   4. Generates the type-safe `names.ts` registry
 *
 * Usage in vite.config.ts:
 *   import { moonIconsPlugin } from "moon-style/vite-plugin-icons";
 *   export default defineConfig({ plugins: [moonIconsPlugin()] });
 */

import fs from "fs";
import path from "path";

// ── SVGO Configs ─────────────────────────────────────────────────────────────

const SVGO_STANDARD = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: { overrides: { removeUselessStrokeAndFill: false } },
    },
    "prefixIds",
    { name: "removeAttrs", params: { attrs: ["opacity", "class", "data-name", "filter"] } },
    "removeComments",
    "removeMetadata",
  ],
};

const SVGO_COLORED = {
  plugins: [
    { name: "preset-default", params: { overrides: { removeUselessStrokeAndFill: false, convertColors: false } } },
    "prefixIds",
    { name: "removeAttrs", params: { attrs: ["data-name", "class"] } },
    "removeComments",
    "removeMetadata",
  ],
};

// ── Config Resolution ────────────────────────────────────────────────────────

interface IconsConfig {
  svgDir: string;
  namesOut: string;
  spriteOut: string;
}

export function resolveConfig(): IconsConfig {
  const configPath = path.resolve("moon.config.json");
  const defaults: IconsConfig = {
    svgDir: "src/assets/icons",
    namesOut: "src/design-system/icons/names.ts",
    spriteOut: "public/icons/sprite.svg",
  };

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return { ...defaults, ...(raw?.icons || {}) };
  } catch {
    return defaults;
  }
}

// ── Walk Source Files ─────────────────────────────────────────────────────────

interface IconEntry {
  variant: string;
  name: string;
  filePath: string;
}

function walkIcons(dir: string): IconEntry[] {
  const results: IconEntry[] = [];
  if (!fs.existsSync(dir)) return results;

  function scan(currentDir: string) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith(".svg")) {
        // Variant = the immediate parent folder name, normalized to lowercase
        const variant = path.basename(currentDir).toLowerCase();
        // Slugify: lowercase + spaces/underscores → dashes → valid SVG id and URL fragment
        const slug = entry.name
          .replace(".svg", "")
          .toLowerCase()
          .replace(/[\s_]+/g, "-");
        results.push({ variant, name: slug, filePath: fullPath });
      }
    }
  }

  scan(dir);
  return results;
}

// ── Build One Symbol ─────────────────────────────────────────────────────────

async function toSymbol(raw: string, id: string, variant: string, optimize: Function): Promise<string> {
  const isColored = variant === "colored";
  const svgoConfig = isColored ? SVGO_COLORED : SVGO_STANDARD;
  const { data: optimized } = optimize(raw, svgoConfig as any);

  // Extract viewBox BEFORE SVGO — preset-default strips viewBox when width+height are explicit
  const viewBox =
    raw.match(/viewBox="([^"]*)"/)?.[1] ??
    (() => {
      const w = raw.match(/\bwidth="([\d.]+)"/)?.[1];
      const h = raw.match(/\bheight="([\d.]+)"/)?.[1];
      return w && h ? `0 0 ${w} ${h}` : "0 0 24 24";
    })();

  let inner = optimized
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>/i, "")
    .trim();

  // Colored icons keep their original fills/strokes — don't normalize
  if (!isColored) {
    inner = inner
      .replace(/fill="(?!none|currentColor|url\()[^"]+"/g, 'fill="currentColor"')
      .replace(/stroke="(?!none|currentColor|url\()[^"]+"/g, 'stroke="currentColor"');
  }

  // Determine symbol fill from the RAW svg (before SVGO strips the root <svg> tag).
  // Checking processed `inner` is unreliable: many icons carry fill="currentColor" on the
  // root <svg> element — SVGO strips that tag, so inner has no fill attrs at all.
  //
  //   fill-based  (Phosphor/Solar Bold, etc.): raw has fill attr that isn't "none"
  //               → symbol gets fill="currentColor" so CSS `color` drives the icon
  //   stroke-only (Solar Outline, Linear, etc.): raw has no fill (or only fill="none"),
  //               but has stroke attrs → symbol gets fill="none" (explicit, not inherited)
  //               Without this, browsers default to fill="black", filling the transparent areas.
  //   colored:    no override — SVG paths carry their own exact hex fills
  let fillAttr: string;
  if (isColored) {
    fillAttr = "";
  } else if (/fill="(?!none)[^"]+"/i.test(raw)) {
    // Raw svg has explicit non-none fills (incl. fill="currentColor" on root) → fill-based
    fillAttr = ' fill="currentColor"';
  } else if (/stroke="(?!none)[^"]+"/i.test(raw)) {
    // Raw svg has strokes but no fills → pure stroke icon
    fillAttr = ' fill="none"';
  } else {
    // No fill, no stroke in raw (unusual) → safe fallback
    fillAttr = ' fill="currentColor"';
  }

  return `  <symbol id="${id}" viewBox="${viewBox}"${fillAttr}>\n    ${inner}\n  </symbol>`;
}

// ── Main Builder ─────────────────────────────────────────────────────────────

export async function buildIcons(config: IconsConfig) {
  const icons = walkIcons(config.svgDir);

  if (icons.length === 0) {
    console.log("[moon-icons] No SVG files found in", config.svgDir);
    return;
  }

  // ── Resolve variant-aware IDs ──────────────────────────
  // "outline" is the default variant → plain name (e.g. "key")
  // All others get a variant suffix (e.g. "key-bold", "key-colored")
  const DEFAULT_VARIANT = "outline";

  // Count how many variants each base name appears in
  const nameVariantMap = new Map<string, Set<string>>();
  for (const icon of icons) {
    if (!nameVariantMap.has(icon.name)) nameVariantMap.set(icon.name, new Set());
    nameVariantMap.get(icon.name)!.add(icon.variant);
  }

  // Assign final IDs: suffix non-default variants when name has duplicates,
  // or ALWAYS suffix non-default variants for consistency
  function resolveId(name: string, variant: string): string {
    if (variant === DEFAULT_VARIANT) return name;
    return `${name}-${variant.replace(/\s+/g, "-")}`;
  }

  // Load svgo once per build, not per icon
  const { optimize } = await import("svgo");

  const symbols: string[] = [];
  const allIds: string[] = [];

  for (const { name, filePath, variant } of icons) {
    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf8");
    } catch (err: any) {
      if (err.code === "ENOENT") continue; // Handle HMR race condition on file deletion
      throw err;
    }
    const id = resolveId(name, variant);
    allIds.push(id);
    symbols.push(await toSymbol(raw, id, variant, optimize));
  }

  const sprite = [`<?xml version="1.0" encoding="UTF-8"?>`, `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">`, ...symbols, `</svg>`].join("\n");

  fs.mkdirSync(path.dirname(config.spriteOut), { recursive: true });
  fs.writeFileSync(config.spriteOut, sprite, "utf8");

  // Build date map: icon id → file mtime (ISO string)
  const idDateMap = new Map<string, string>();
  for (const { name, filePath, variant } of icons) {
    const id = resolveId(name, variant);
    try {
      const stat = fs.statSync(filePath);
      idDateMap.set(id, stat.mtime.toISOString());
    } catch {}
  }

  const dedupedNames = Array.from(new Set(allIds)).sort();
  const entries = dedupedNames.map((n) => `  "${n}": "${idDateMap.get(n) || ""}"`).join(",\n");

  const typesFile = [
    `// AUTO-GENERATED by moon-style vite-plugin-icons — do not edit`,
    ``,
    `export const ICONS = {`,
    entries,
    `} as const;`,
    ``,
    `export type IconName = keyof typeof ICONS;`,
    `export const ALL_ICON_NAMES = Object.keys(ICONS) as IconName[];`,
    ``,
  ].join("\n");

  fs.mkdirSync(path.dirname(config.namesOut), { recursive: true });
  fs.writeFileSync(config.namesOut, typesFile, "utf8");

  console.log(`[moon-icons] ✅ ${icons.length} icons → ${config.spriteOut}`);
}

// Redundant Vite plugin wrapper removed — logic merged into vite-plugin-moon.ts
