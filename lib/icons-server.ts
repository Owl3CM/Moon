/**
 * Moon Icons — Local Development Server
 *
 * Runs on localhost:8293 for managing SVG icons via a browser UI.
 * This is a LOCAL-ONLY dev tool, NOT meant for production.
 *
 * KNOWN LIMITATIONS:
 * - Path parameters (style, group, name) are not sanitized for directory traversal
 * - /api/fetch-url proxies any URL (SSRF risk on local network)
 * - SVGRepo HTML scraping uses regex, breaks when their HTML changes
 * - No authentication (localhost-only mitigates this)
 *
 * These are accepted risks for a local dev tool.
 */
import fs from "fs";
import path from "path";
import os from "os";
import http from "http";
import { exec } from "child_process";
import { resolveProjectIconsDir, ensureIconsCache, readCacheStatus, slugify, ICONS_SVG_DIR } from "./icons-utils.js";

// ── Constants ────────────────────────────────────────────────────────────────

const STYLES = ["Bold", "Outline", "Line Duotone", "Broken", "Linear", "Bold Duotone", "Colored"];

const SEED_COLLECTIONS = [
  { prefix: "ph", label: "Phosphor" },
  { prefix: "mdi", label: "Material Design" },
  { prefix: "tabler", label: "Tabler" },
  { prefix: "lucide", label: "Lucide" },
  { prefix: "heroicons", label: "Heroicons" },
  { prefix: "carbon", label: "Carbon" },
  { prefix: "ri", label: "Remix" },
  { prefix: "mingcute", label: "MingCute" },
  { prefix: "fluent", label: "Fluent UI" },
  { prefix: "bi", label: "Bootstrap" },
  { prefix: "mynaui", label: "Myna UI" },
  { prefix: "hugeicons", label: "Huge Icons" },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface SyncEntry {
  group: string;
  name: string;
  style: string;
}

interface ApiResult {
  added: number;
  removed: number;
  errors: string[];
  note?: string;
  finalStyle?: string;
}

/** Clean up icon names — remove noise like 'icon', prefixes, size suffixes */
function cleanIconName(rawName: string, prefix?: string): string {
  let name = rawName
    .replace(/\.svg$/i, "")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

  // Remove collection prefix if it matches (e.g., "mdi-home" from mdi → "home")
  if (prefix && name.startsWith(prefix + "-")) {
    name = name.slice(prefix.length + 1);
  }

  // Remove common noise words
  name = name
    .replace(/^icon[-_]?/i, "") // leading "icon-"
    .replace(/[-_]?icon$/i, "") // trailing "-icon"
    .replace(/[-_]?svg$/i, "") // trailing "-svg"
    .replace(/[-_]?\d{2,4}(px)?$/i, "") // trailing size like "-24", "-24px", "-16"
    .replace(/^[-_]+|[-_]+$/g, ""); // trim dashes

  // Remove duplicate segments (e.g., "arrow-arrow" → "arrow")
  const parts = name.split("-");
  const deduped: string[] = [];
  for (const p of parts) {
    if (p && (deduped.length === 0 || deduped[deduped.length - 1] !== p)) {
      deduped.push(p);
    }
  }
  name = deduped.join("-");

  return name || rawName.replace(/\.svg$/i, "").toLowerCase();
}

/** Auto-detect the icon style from SVG content */
function detectStyle(svg: string): string {
  // First check if it's colored (3+ unique colors = Colored)
  if (isColoredSvg(svg)) return "Colored";

  const hasStroke = /stroke="(?!none)[^"]+"/i.test(svg);
  const hasFill = /fill="(?!none|currentColor|url\()[^"]+"/i.test(svg);
  const strokeWidth = svg.match(/stroke-width="([^"]+)"/i);
  const sw = strokeWidth ? parseFloat(strokeWidth[1]) : 0;

  // Bold: thick strokes (≥2) or heavy filled shapes with no thin strokes
  if (hasStroke && sw >= 2) return "Bold";
  if (!hasStroke && hasFill) return "Bold";

  // Line Duotone: has both stroke and some opacity/fill elements
  const hasOpacity = /opacity="[^"1]"/i.test(svg) || /fill-opacity="[^"1]"/i.test(svg);
  if (hasStroke && hasOpacity) return "Line Duotone";

  // Broken: has stroke-dasharray
  if (/stroke-dasharray/i.test(svg)) return "Broken";

  // Default: Outline (strokes with moderate width, or just currentColor fills)
  return "Outline";
}

/** Validate that the content is a valid SVG */
function validateSvg(svg: string): string | null {
  if (!svg || typeof svg !== "string") return "Empty SVG content";
  const trimmed = svg.trim();
  if (!trimmed.includes("<svg")) return "Not a valid SVG (missing <svg> tag)";
  if (!trimmed.includes("</svg>")) return "Not a valid SVG (missing </svg> tag)";
  return null;
}

/** Sanitize SVG for safe use in sprite sheets — strips styles, scripts, defs, comments */
function sanitizeSvg(svg: string): string {
  return (
    svg
      // Remove XML prolog and DTD
      .replace(/<\?xml[^>]*\?>/gi, "")
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      // Remove <script> blocks completely
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      // Remove <style> blocks (they break sprites)
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove data attributes (can be huge)
      .replace(/\s+data-[a-z-]+="[^"]*"/gi, "")
      // Remove class attributes (from inline styles)
      .replace(/\s+class="[^"]*"/gi, "")
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, "\n")
      .trim()
  );
}

function isColoredSvg(svg: string): boolean {
  const visible = svg
    .replace(/<defs[\s\S]*?<\/defs>/gi, "")
    .replace(/<mask[\s\S]*?<\/mask>/gi, "")
    .replace(/<clipPath[\s\S]*?<\/clipPath>/gi, "");

  const fills = visible.match(/fill="([^"]+)"/gi) || [];
  const uniqueColors = new Set<string>();
  for (const f of fills) {
    const val = f.match(/fill="([^"]+)"/i)?.[1]?.toLowerCase() || "";
    if (!val || val === "none" || val === "currentcolor" || val.startsWith("url(")) continue;
    uniqueColors.add(val);
  }
  return uniqueColors.size >= 3;
}

function normalizeOutlineSvg(svg: string): string {
  return svg
    .replace(/fill="(?!none|currentColor|url\()[^"]+"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none|currentColor)[^"]+"/g, 'stroke="currentColor"');
}

const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > MAX_BODY_SIZE) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function error(res: http.ServerResponse, msg: string, status = 500): void {
  json(res, { error: msg }, status);
}

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seedIconifyCollections(): Promise<void> {
  const markerFile = path.join(ICONS_SVG_DIR, ".seeded");
  if (fs.existsSync(markerFile)) return;

  console.log("[moon-icons] Seeding popular icon collections (first run)...");

  for (const col of SEED_COLLECTIONS) {
    const groupDir = path.join(ICONS_SVG_DIR, "Outline", col.label);
    if (fs.existsSync(groupDir) && fs.readdirSync(groupDir).length > 0) continue;
    fs.mkdirSync(groupDir, { recursive: true });

    try {
      const searchRes = await fetch(`https://api.iconify.design/collection?prefix=${col.prefix}&info=true&chars=true`);
      if (!searchRes.ok) continue;
      const colData = await searchRes.json();

      let iconNames: string[] = [];
      if (colData.uncategorized) {
        iconNames = colData.uncategorized.slice(0, 8);
      } else if (colData.categories) {
        for (const cat of Object.values(colData.categories) as string[][]) {
          if (iconNames.length >= 8) break;
          if (cat[0]) iconNames.push(cat[0]);
        }
      }
      if (iconNames.length === 0) continue;

      let downloaded = 0;
      for (const icon of iconNames) {
        try {
          const r = await fetch(`https://api.iconify.design/${col.prefix}/${icon}.svg?width=24&height=24`);
          if (!r.ok) continue;
          let svg = await r.text();
          if (!svg.includes("<svg")) continue;
          // Fix viewBox from sprites (e.g. "223 21540 24 24" → "0 0 24 24")
          svg = svg.replace(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/i, 'viewBox="0 0 $1 $2"');
          fs.writeFileSync(path.join(groupDir, `${col.prefix}-${icon}.svg`), svg, "utf-8");
          downloaded++;
        } catch (e) {
          console.warn(`  [seed] Failed ${col.prefix}/${icon}: ${e}`);
        }
      }
      if (downloaded > 0) console.log(`  ✓ ${col.label}: ${downloaded} sample icons`);
    } catch (e) {
      console.warn(`  [seed] Failed collection ${col.prefix}: ${e}`);
    }
  }

  fs.writeFileSync(markerFile, new Date().toISOString(), "utf-8");
  console.log("[moon-icons] Iconify seeding complete.");

  // Seed SVGL brand logos
  const svglDir = path.join(ICONS_SVG_DIR, "Colored", "SVGL");
  if (!fs.existsSync(svglDir) || fs.readdirSync(svglDir).length === 0) {
    fs.mkdirSync(svglDir, { recursive: true });
    const SVGL_LOGOS = [
      "react",
      "vue",
      "angular",
      "svelte",
      "nextjs",
      "nuxt",
      "vite",
      "typescript",
      "javascript",
      "nodejs",
      "deno",
      "bun",
      "python",
      "go",
      "rust",
      "docker",
      "kubernetes",
      "github",
      "gitlab",
      "figma",
      "vercel",
      "netlify",
      "supabase",
      "firebase",
      "postgresql",
      "mongodb",
      "redis",
      "prisma",
      "tailwindcss",
      "sass",
      "storybook",
      "cypress",
      "vitest",
      "jest",
      "cloudflare",
      "aws",
      "google-cloud",
      "azure",
      "stripe",
      "twilio",
    ];
    let svglCount = 0;
    for (const name of SVGL_LOGOS) {
      try {
        const r = await fetch(`https://svgl.app/library/${name}.svg`);
        if (!r.ok) continue;
        const svg = await r.text();
        if (!svg.includes("<svg")) continue;
        fs.writeFileSync(path.join(svglDir, `${name}.svg`), svg, "utf-8");
        svglCount++;
      } catch {}
    }
    if (svglCount > 0) console.log(`  ✓ SVGL: ${svglCount} brand logos`);
  }

  console.log("[moon-icons] Seeding complete.");
}

// ── Scan Icons ───────────────────────────────────────────────────────────────

interface IconEntry {
  name: string;
  added: boolean;
}

function scanIcons(projectDir: string): Record<string, Record<string, IconEntry[]>> {
  const data: Record<string, Record<string, IconEntry[]>> = {};

  for (const style of STYLES) {
    const stylePath = path.join(ICONS_SVG_DIR, style);
    if (!fs.existsSync(stylePath)) continue;

    const groups = fs.readdirSync(stylePath).filter((f) => fs.statSync(path.join(stylePath, f)).isDirectory());

    for (const group of groups) {
      if (!data[group]) data[group] = {};
      if (!data[group][style]) data[group][style] = [];

      const groupPath = path.join(stylePath, group);
      const files = fs.readdirSync(groupPath).filter((f) => f.endsWith(".svg"));

      for (const file of files) {
        const name = file.replace(".svg", "");
        const slug = slugify(name);
        const added = fs.existsSync(path.join(projectDir, style.toLowerCase(), `${slug}.svg`));
        data[group][style].push({ name, added });
      }
    }
  }

  return data;
}

// ── Get Single Icon SVG ──────────────────────────────────────────────────────

function getIconSvg(style: string, group: string, name: string): string | null {
  const filePath = path.join(ICONS_SVG_DIR, style, group, `${name}.svg`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

// ── Sync (Add / Remove) ─────────────────────────────────────────────────────

function executeSync(add: SyncEntry[], remove: SyncEntry[], projectDir: string): ApiResult {
  const result: ApiResult = { added: 0, removed: 0, errors: [] };

  for (const e of add) {
    try {
      const src = path.join(ICONS_SVG_DIR, e.style, e.group, `${e.name}.svg`);
      if (!fs.existsSync(src)) {
        result.errors.push(`Not found: ${e.group}/${e.name}`);
        continue;
      }
      const slug = slugify(e.name);
      const styleDir = path.join(projectDir, e.style.toLowerCase());
      fs.mkdirSync(styleDir, { recursive: true });
      let svg = sanitizeSvg(fs.readFileSync(src, "utf-8"));
      if (e.style !== "Colored") svg = normalizeOutlineSvg(svg);
      fs.writeFileSync(path.join(styleDir, `${slug}.svg`), svg, "utf-8");
      result.added++;
    } catch (err) {
      result.errors.push(`Add: ${e.name} — ${err}`);
    }
  }

  for (const e of remove) {
    try {
      const slug = slugify(e.name);
      const target = path.join(projectDir, e.style.toLowerCase(), `${slug}.svg`);
      if (fs.existsSync(target)) {
        fs.rmSync(target);
        result.removed++;
      }
    } catch (err) {
      result.errors.push(`Remove: ${e.name} — ${err}`);
    }
  }

  console.log(`[moon-icons] Sync: +${result.added} -${result.removed} (${result.errors.length} errors)`);
  return result;
}

// ── Download from Web ────────────────────────────────────────────────────────

async function downloadWebIcon(
  prefix: string,
  name: string,
  activeStyle: string,
  projectDir: string,
  overwrite = false,
  url?: string,
  saveName?: string,
): Promise<ApiResult> {
  const result: ApiResult = { added: 0, removed: 0, errors: [] };
  try {
    const fetchUrl = url || `https://api.iconify.design/${prefix}/${name}.svg?width=24&height=24`;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let svg = await res.text();

    // Validate SVG
    const validationErr = validateSvg(svg);
    if (validationErr) throw new Error(validationErr);

    // Smart style detection
    const detectedStyle = detectStyle(svg);
    let finalStyle = detectedStyle;
    // If user explicitly chose a non-default style, prefer it (unless it's colored)
    if (activeStyle !== "All" && activeStyle !== "Outline" && detectedStyle !== "Colored") {
      finalStyle = activeStyle;
    }

    const cleaned = cleanIconName(saveName || (url ? name : `${prefix}-${name}`), prefix);
    const slug = slugify(cleaned);
    const cacheDir = path.join(ICONS_SVG_DIR, finalStyle, "Web");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cacheFile = path.join(cacheDir, `${slug}.svg`);

    const projectStyleDir = path.join(projectDir, finalStyle.toLowerCase());
    fs.mkdirSync(projectStyleDir, { recursive: true });
    const projectFile = path.join(projectStyleDir, `${slug}.svg`);

    if (!overwrite && (fs.existsSync(cacheFile) || fs.existsSync(projectFile))) {
      throw new Error(`409 Conflict: ${slug}`);
    }

    // Cache: save raw SVG as-is (for UI preview)
    fs.writeFileSync(cacheFile, svg, "utf-8");

    // Project: sanitize + normalize for sprite safety
    let projectSvg = sanitizeSvg(svg);
    if (finalStyle !== "Colored") projectSvg = normalizeOutlineSvg(projectSvg);
    fs.writeFileSync(projectFile, projectSvg, "utf-8");

    result.added = 1;
    result.note = `Saved to ${finalStyle} (detected: ${detectedStyle})`;
    result.finalStyle = finalStyle;
  } catch (err: any) {
    result.errors.push(err.message);
  }
  return result;
}

// ── Upload SVG ───────────────────────────────────────────────────────────────

async function processUploadedIcon(filename: string, svg: string, activeStyle: string, projectDir: string, overwrite = false): Promise<ApiResult> {
  const result: ApiResult = { added: 0, removed: 0, errors: [] };
  try {
    // Validate SVG
    const validationErr = validateSvg(svg);
    if (validationErr) throw new Error(validationErr);

    // Smart style detection
    const detectedStyle = detectStyle(svg);
    let finalStyle = detectedStyle;
    if (activeStyle !== "All" && activeStyle !== "Outline" && detectedStyle !== "Colored") {
      finalStyle = activeStyle;
    }
    if (!svg.includes("viewBox")) svg = svg.replace("<svg ", '<svg viewBox="0 0 24 24" ');

    const cleaned = cleanIconName(filename);
    const slug = slugify(cleaned);
    const cacheDir = path.join(ICONS_SVG_DIR, finalStyle, "Uploads");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cacheFile = path.join(cacheDir, `${slug}.svg`);

    const projectStyleDir = path.join(projectDir, finalStyle.toLowerCase());
    fs.mkdirSync(projectStyleDir, { recursive: true });
    const projectFile = path.join(projectStyleDir, `${slug}.svg`);

    if (!overwrite && (fs.existsSync(cacheFile) || fs.existsSync(projectFile))) {
      throw new Error(`409 Conflict: ${slug}`);
    }

    // Cache: save raw SVG as-is (for UI preview)
    fs.writeFileSync(cacheFile, svg, "utf-8");

    // Project: sanitize + normalize for sprite safety
    let projectSvg = sanitizeSvg(svg);
    if (finalStyle !== "Colored") projectSvg = normalizeOutlineSvg(projectSvg);
    fs.writeFileSync(projectFile, projectSvg, "utf-8");

    result.added = 1;
    result.note = `Saved to ${finalStyle} (detected: ${detectedStyle})`;
    result.finalStyle = finalStyle;
  } catch (err: any) {
    result.errors.push(err.message);
  }
  return result;
}

// ── Rename Icon ──────────────────────────────────────────────────────────────

function renameIcon(style: string, group: string, oldName: string, newName: string, projectDir: string): ApiResult {
  const result: ApiResult = { added: 0, removed: 0, errors: [] };
  try {
    const oldSlug = slugify(oldName);
    const newSlug = slugify(newName);

    // Rename in cache
    const cacheOld = path.join(ICONS_SVG_DIR, style, group, `${oldName}.svg`);
    const cacheNew = path.join(ICONS_SVG_DIR, style, group, `${newSlug}.svg`);
    if (!fs.existsSync(cacheOld)) throw new Error(`Not found: ${style}/${group}/${oldName}`);
    if (fs.existsSync(cacheNew)) throw new Error(`409 Conflict: ${newSlug} already exists`);
    fs.renameSync(cacheOld, cacheNew);

    // Auto-sync: rename in project if it was added
    const projectOld = path.join(projectDir, style.toLowerCase(), `${oldSlug}.svg`);
    const projectNew = path.join(projectDir, style.toLowerCase(), `${newSlug}.svg`);
    if (fs.existsSync(projectOld)) {
      fs.renameSync(projectOld, projectNew);
      result.note = `Renamed and synced in project`;
    } else {
      result.note = `Renamed in cache`;
    }
    result.added = 1;
  } catch (err: any) {
    result.errors.push(err.message);
  }
  return result;
}

// ── Delete Icon ──────────────────────────────────────────────────────────────

function deleteIcon(style: string, group: string, name: string, projectDir: string): ApiResult {
  const result: ApiResult = { added: 0, removed: 0, errors: [] };
  try {
    // Delete from cache
    const cacheFile = path.join(ICONS_SVG_DIR, style, group, `${name}.svg`);
    if (fs.existsSync(cacheFile)) {
      fs.rmSync(cacheFile);
      result.removed++;
    }

    // Auto-remove from project if it was added
    const slug = slugify(name);
    const projectFile = path.join(projectDir, style.toLowerCase(), `${slug}.svg`);
    if (fs.existsSync(projectFile)) {
      fs.rmSync(projectFile);
      result.removed++;
      result.note = "Removed from cache and project";
    } else {
      result.note = "Removed from cache";
    }
  } catch (err: any) {
    result.errors.push(err.message);
  }
  return result;
}

// ── Server ───────────────────────────────────────────────────────────────────

// Kill any existing instance on our port (cross-platform, pure Node.js)
async function killExistingServer(port: number): Promise<void> {
  return new Promise((resolve) => {
    const req = http.request({ hostname: "127.0.0.1", port, path: "/api/shutdown", method: "POST", timeout: 2000 }, () => {
      // Give it a moment to close
      setTimeout(resolve, 500);
    });
    req.on("error", () => resolve()); // Nothing running — proceed
    req.on("timeout", () => {
      req.destroy();
      resolve();
    });
    req.end();
  });
}

export async function openUI(): Promise<void> {
  await ensureIconsCache();

  if (!fs.existsSync(ICONS_SVG_DIR)) {
    fs.mkdirSync(ICONS_SVG_DIR, { recursive: true });
  }

  const projectDir = resolveProjectIconsDir();
  const port = 8293;

  // Auto-kill any previous instance (cross-platform)
  await killExistingServer(port);

  // Resolve HTML file path — works both in lib/ (dev) and dist/ (built)
  const serverDir = path.dirname(new URL(import.meta.url).pathname);
  let htmlPath = path.join(serverDir, "icons-client.html");
  if (!fs.existsSync(htmlPath)) {
    // Fallback: check sibling lib/ directory when running from dist/
    htmlPath = path.join(serverDir, "..", "lib", "icons-client.html");
  }
  if (!fs.existsSync(htmlPath)) {
    return console.log(`HTML file not found. Expected at: ${htmlPath}`);
  }

  let collectionsCache: unknown = null;
  const collectionIconsCache: Record<string, unknown> = {};

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://localhost:${port}`);

    try {
      // ── Serve HTML ───────────────────────────────────────
      if (req.method === "GET" && url.pathname === "/") {
        const html = fs.readFileSync(htmlPath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
        return;
      }

      // ── Cache status (for frontend loader) ──────────────
      if (req.method === "GET" && url.pathname === "/api/cache-status") {
        json(res, readCacheStatus());
        return;
      }

      // ── Scan all icons (metadata only, no SVG content) ──
      if (req.method === "GET" && url.pathname === "/api/data") {
        json(res, { styles: STYLES, icons: scanIcons(projectDir) });
        return;
      }

      // ── Get single icon SVG ─────────────────────────────
      if (req.method === "GET" && url.pathname === "/api/icon") {
        const style = url.searchParams.get("style");
        const group = url.searchParams.get("group");
        const name = url.searchParams.get("name");
        if (!style || !group || !name) return error(res, "Missing style, group, or name", 400);
        const svg = getIconSvg(style, group, name);
        if (!svg) return error(res, "Not found", 404);
        const out = style !== "Colored" ? normalizeOutlineSvg(svg) : svg;
        res.writeHead(200, { "Content-Type": "image/svg+xml" });
        res.end(out);
        return;
      }

      // ── Batch SVG content ──────────────────────────────────
      if (req.method === "POST" && url.pathname === "/api/icons-svg") {
        const body = JSON.parse(await readBody(req));
        const icons: { style: string; group: string; name: string }[] = body.icons || [];
        const result: Record<string, string> = {};
        for (const { style: s, group: g, name: n } of icons) {
          const raw = getIconSvg(s, g, n);
          if (!raw) continue;
          const key = `${s}/${g}/${n}`;
          result[key] = s !== "Colored" ? normalizeOutlineSvg(raw) : raw;
        }
        json(res, result);
        return;
      }

      // ── Iconify collections (cached) ────────────────────
      if (req.method === "GET" && url.pathname === "/api/collections") {
        if (!collectionsCache) {
          const r = await fetch("https://api.iconify.design/collections");
          collectionsCache = await r.json();
        }
        json(res, collectionsCache);
        return;
      }

      // ── Single collection icons (paginated) ─────────────────
      if (req.method === "GET" && url.pathname === "/api/collection") {
        const prefix = url.searchParams.get("prefix");
        if (!prefix) return error(res, "Missing prefix", 400);
        const page = parseInt(url.searchParams.get("page") || "0");
        const limit = parseInt(url.searchParams.get("limit") || "100");
        const search = url.searchParams.get("q") || "";

        // Fetch and cache the full icon list
        if (!collectionIconsCache[prefix]) {
          try {
            const r = await fetch(`https://api.iconify.design/collection?prefix=${encodeURIComponent(prefix)}&info=true&chars=true`);
            if (!r.ok) return error(res, `Iconify returned ${r.status}`, r.status);
            const colData = await r.json();
            let allIcons: string[] = [];
            if (colData.uncategorized) allIcons.push(...colData.uncategorized);
            if (colData.categories) {
              for (const cat of Object.values(colData.categories) as string[][]) {
                allIcons.push(...cat);
              }
            }
            collectionIconsCache[prefix] = {
              prefix,
              name: colData.info?.name || prefix,
              total: colData.info?.total || allIcons.length,
              icons: allIcons,
            };
          } catch (e) {
            return error(res, String(e));
          }
        }

        const cached = collectionIconsCache[prefix] as { prefix: string; name: string; total: number; icons: string[] };
        let icons = cached.icons;

        // Filter by search query if provided
        if (search) {
          icons = icons.filter((n: string) => n.toLowerCase().includes(search.toLowerCase()));
        }

        const totalFiltered = icons.length;
        const pageIcons = icons.slice(page * limit, (page + 1) * limit);
        const totalPages = Math.ceil(totalFiltered / limit);

        json(res, {
          prefix: cached.prefix,
          name: cached.name,
          total: totalFiltered,
          totalPages,
          page,
          icons: pageIcons,
        });
        return;
      }

      // ── SVGRepo search ────────────────────────────────────
      if (req.method === "GET" && url.pathname === "/api/svgrepo-search") {
        const q = url.searchParams.get("q") || "";
        const page = parseInt(url.searchParams.get("page") || "1");
        if (!q) return error(res, "Missing query (q)", 400);
        try {
          const svgrepoUrl = `https://www.svgrepo.com/vectors/${encodeURIComponent(q)}/${page}`;
          const headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          };
          let r = await fetch(svgrepoUrl, { headers });
          // Retry once on 429 after 1.5s delay
          if (r.status === 429) {
            await new Promise((ok) => setTimeout(ok, 1500));
            r = await fetch(svgrepoUrl, { headers });
          }
          if (!r.ok) throw new Error(`SVGRepo returned ${r.status}. Try again in a moment.`);
          const html = await r.text();

          // Extract SVG entries from the page HTML
          const items: { name: string; id: string; url: string; thumb: string }[] = [];
          const regex = /<a[^>]+href="\/svg\/(\d+)\/([\w-]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>/gi;
          let match;
          while ((match = regex.exec(html)) !== null) {
            const id = match[1];
            const slug = match[2];
            const thumb = match[3].startsWith("//") ? "https:" + match[3] : match[3];
            items.push({
              name: slug.replace(/-svg$/i, "").replace(/-/g, " "),
              id: id,
              url: `https://www.svgrepo.com/download/${id}/${slug}.svg`,
              thumb,
            });
          }

          // Dedupe by id
          const seen = new Set<string>();
          const unique = items.filter((i) => {
            if (seen.has(i.id)) return false;
            seen.add(i.id);
            return true;
          });

          json(res, { query: q, page, icons: unique, total: unique.length });
        } catch (e: any) {
          // Return empty results with error message instead of 500
          json(res, { query: q, page, icons: [], total: 0, error: e.message || String(e) });
        }
        return;
      }

      // ── Fetch SVG from URL ───────────────────────────────
      if (req.method === "POST" && url.pathname === "/api/fetch-url") {
        const { url: targetUrl } = JSON.parse(await readBody(req));
        if (!targetUrl) return error(res, "Missing url", 400);
        try {
          let fetchUrl = targetUrl;
          let filename = "icon";

          // SVGRepo: /svg/{id}/{name} → /download/{id}/{name}.svg
          const svgRepoMatch = targetUrl.match(/svgrepo\.com\/svg\/(\d+)\/([\w-]+)/);
          if (svgRepoMatch) {
            fetchUrl = `https://www.svgrepo.com/download/${svgRepoMatch[1]}/${svgRepoMatch[2]}.svg`;
            filename = svgRepoMatch[2];
          } else {
            // Extract filename from URL path
            const urlPath = new URL(targetUrl).pathname;
            const parts = urlPath.split("/").filter(Boolean);
            filename = parts[parts.length - 1]?.replace(/\.svg$/i, "") || "icon";
          }

          let body = "";
          const r = await fetch(fetchUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
          });
          if (!r.ok) {
            // If rate-limited, try alternative approaches
            if (r.status === 429 && svgRepoMatch) {
              // Try the show endpoint which may have the SVG embedded
              const showUrl = `https://www.svgrepo.com/show/${svgRepoMatch[1]}/${svgRepoMatch[2]}.svg`;
              const r2 = await fetch(showUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
              });
              if (r2.ok) {
                const html = await r2.text();
                const svgMatch = html.match(/<svg[\s\S]*?<\/svg>/i);
                if (svgMatch) {
                  body = svgMatch[0];
                } else throw new Error("Rate limited by SVGRepo and could not scrape SVG from page");
              } else {
                throw new Error(`SVGRepo rate limited (429). Try again in a moment.`);
              }
            } else {
              throw new Error(`HTTP ${r.status} from ${fetchUrl}`);
            }
          } else {
            body = await r.text();
          }

          // If the response is HTML, try extracting the <svg> from it
          if (body.includes("<!DOCTYPE") || body.includes("<html")) {
            const svgMatch = body.match(/<svg[\s\S]*?<\/svg>/i);
            if (!svgMatch) throw new Error("No SVG found in page");
            body = svgMatch[0];
          }

          if (!body.includes("<svg")) throw new Error("Response is not valid SVG");

          json(res, { svg: body, filename });
        } catch (e) {
          error(res, String(e));
        }
        return;
      }

      // ── Sync (add/remove to project) ────────────────────
      if (req.method === "POST" && url.pathname === "/api/sync") {
        const { add, remove } = JSON.parse(await readBody(req));
        json(res, executeSync(add || [], remove || [], projectDir));
        return;
      }

      // ── Download from web ───────────────────────────────
      if (req.method === "POST" && url.pathname === "/api/download") {
        const { prefix, name, style, overwrite, url: iconUrl, saveName } = JSON.parse(await readBody(req));
        json(res, await downloadWebIcon(prefix, name, style, projectDir, overwrite, iconUrl, saveName));
        return;
      }

      // ── Upload SVG ──────────────────────────────────────
      if (req.method === "POST" && url.pathname === "/api/upload") {
        const { filename, svg, style, overwrite } = JSON.parse(await readBody(req));
        json(res, await processUploadedIcon(filename, svg, style, projectDir, overwrite));
        return;
      }

      // ── Rename icon ─────────────────────────────────────
      if (req.method === "POST" && url.pathname === "/api/rename") {
        const { style, group, oldName, newName } = JSON.parse(await readBody(req));
        json(res, renameIcon(style, group, oldName, newName, projectDir));
        return;
      }

      // ── Delete icon ─────────────────────────────────────
      if (req.method === "DELETE" && url.pathname === "/api/delete") {
        const { style, group, name } = JSON.parse(await readBody(req));
        json(res, deleteIcon(style, group, name, projectDir));
        return;
      }

      // ── Shutdown endpoint (enables cross-platform auto-kill) ──
      if (req.method === "POST" && url.pathname === "/api/shutdown") {
        res.writeHead(200);
        res.end("OK");
        server.close();
        process.exit(0);
      }

      error(res, "Not found", 404);
    } catch (e) {
      console.error(`[moon-icons] API error: ${e}`);
      error(res, String(e));
    }
  });

  server.on("error", (e: any) => {
    if (e.code === "EADDRINUSE") {
      console.error(`[moon-icons] Port ${port} still in use. Try again in a moment.`);
    } else {
      console.error("[moon-icons] Server error:", e);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Moon Icons UI → ${url}`);
    const p = os.platform();
    if (p === "darwin") exec(`open ${url}`);
    else if (p === "win32") exec(`start ${url}`);
    else exec(`xdg-open ${url}`);

    seedIconifyCollections().catch((e) => console.warn("[moon-icons] Seed failed:", e));
  });
}
