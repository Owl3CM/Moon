import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

// ── Constants ────────────────────────────────────────────────────────────────

export const MOON_ICONS_DIR = path.join(os.homedir(), ".moon-icons");
export const REPO_URL = "https://github.com/480-Design/Solar-Icon-Set.git";
export const SIMPLE_ICONS_REPO = "https://github.com/simple-icons/simple-icons.git";
export const ICONS_SVG_DIR = path.join(MOON_ICONS_DIR, "Icons", "SVG");

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[\s_]+/g, "-");
}

// Status file lives OUTSIDE the clone target so it doesn't interfere with git clone
const STATUS_FILE = path.join(os.homedir(), ".moon-icons-status.json");

// ── Types ────────────────────────────────────────────────────────────────────

interface CacheStatus {
  status: "downloading" | "done" | "failed";
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  error?: string;
  iconCount?: number;
  pid?: number;
}

// ── Project Config ───────────────────────────────────────────────────────────

export function resolveProjectIconsDir(): string {
  const configPath = path.join(process.cwd(), "moon.config.json");
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (raw?.icons?.svgDir) return path.resolve(process.cwd(), raw.icons.svgDir);
  } catch {}
  return path.join(process.cwd(), "src", "assets", "icons", "qaseh");
}

// ── Status Helpers ───────────────────────────────────────────────────────────

function writeStatus(status: CacheStatus): void {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status), "utf-8");
}

export function readCacheStatus(): CacheStatus {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
    }
  } catch {}
  // No status file — check if the SVG dir already has icons (legacy or manual setup)
  if (fs.existsSync(ICONS_SVG_DIR) && countSvgFiles(ICONS_SVG_DIR) > 100) {
    return { status: "done", iconCount: countSvgFiles(ICONS_SVG_DIR) };
  }
  return { status: "failed", error: "Cache not initialized" };
}

function countSvgFiles(dir: string): number {
  let count = 0;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) count += countSvgFiles(full);
      else if (entry.name.endsWith(".svg")) count++;
    }
  } catch {}
  return count;
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// ── Cache Management ─────────────────────────────────────────────────────────

export async function ensureIconsCache(): Promise<void> {
  const existing = readCacheStatus();

  // Already done
  if (existing.status === "done") return;

  // Another process is downloading — wait for it
  if (existing.status === "downloading" && existing.pid && isProcessAlive(existing.pid)) {
    console.log("[moon-icons] Another process is downloading icons. Waiting...");
    while (true) {
      await new Promise((ok) => setTimeout(ok, 2000));
      const check = readCacheStatus();
      if (check.status === "done") {
        console.log("[moon-icons] Download completed by another process.");
        return;
      }
      if (check.status === "failed") break;
      if (check.status === "downloading" && check.pid && !isProcessAlive(check.pid)) break;
    }
  }

  // Clean up any partial clone
  if (fs.existsSync(MOON_ICONS_DIR)) {
    fs.rmSync(MOON_ICONS_DIR, { recursive: true, force: true });
  }

  writeStatus({ status: "downloading", startedAt: new Date().toISOString(), pid: process.pid });
  console.log("[moon-icons] Downloading icon cache (one-time setup)...");

  try {
    // 1. Clone Solar Icon Set
    console.log("[moon-icons] Cloning Solar Icon Set...");
    execSync(`git clone --depth 1 ${REPO_URL} "${MOON_ICONS_DIR}"`, { stdio: "inherit" });

    // 2. Clone Simple Icons (into temp dir, copy SVGs into cache)
    console.log("[moon-icons] Cloning Simple Icons (brand logos)...");
    const tmpDir = path.join(os.tmpdir(), "simple-icons-clone");
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    try {
      execSync(`git clone --depth 1 ${SIMPLE_ICONS_REPO} "${tmpDir}"`, { stdio: "inherit" });
      const srcDir = path.join(tmpDir, "icons");
      const destDir = path.join(ICONS_SVG_DIR, "Outline", "Simple Icons");
      fs.mkdirSync(destDir, { recursive: true });
      if (fs.existsSync(srcDir)) {
        for (const file of fs.readdirSync(srcDir)) {
          if (file.endsWith(".svg")) {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
          }
        }
      }
      console.log(`[moon-icons] Simple Icons: ${countSvgFiles(destDir)} brand logos added.`);
    } catch (e) {
      console.warn("[moon-icons] Simple Icons clone failed (non-fatal):", e instanceof Error ? e.message : e);
    } finally {
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    const iconCount = countSvgFiles(ICONS_SVG_DIR);
    writeStatus({ status: "done", completedAt: new Date().toISOString(), iconCount });
    console.log(`[moon-icons] Cache downloaded: ${iconCount} icons ready.\n`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    writeStatus({ status: "failed", failedAt: new Date().toISOString(), error: msg });
    console.error("[moon-icons] Download failed:", msg);
    console.error("[moon-icons] Check your internet connection and run again.");
    if (fs.existsSync(MOON_ICONS_DIR)) {
      fs.rmSync(MOON_ICONS_DIR, { recursive: true, force: true });
    }
    process.exit(1);
  }
}
