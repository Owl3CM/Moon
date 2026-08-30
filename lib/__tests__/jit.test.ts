/**
 * Tests for JIT extract functions — color, spacing, and action pattern extraction.
 *
 * Uses Sync_Changes to test the full pipeline: read file → extract patterns →
 * write CSS. Verifies actual CSS output in moon.jit.css, not just "no crash."
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { writeFileSync, unlinkSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { Controller } from "../builder/controller.js";

const jitModule = await import("../jit/jit.js");

const tmpDir = join(import.meta.dirname ?? ".", "__jit_tmp__");
const jitCssPath = join(process.cwd(), "moon/moon.jit.css");

function writeTmpFile(filename: string, content: string): string {
  mkdirSync(tmpDir, { recursive: true });
  const filePath = join(tmpDir, filename);
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

function readJitCss(): string {
  return existsSync(jitCssPath) ? readFileSync(jitCssPath, "utf8") : "";
}

function setupConfig() {
  // Write minimal moon.config.json for Jit_Start
  const configPath = join(process.cwd(), "moon.config.json");
  writeFileSync(configPath, JSON.stringify({ projectDir: tmpDir, screens: {} }), "utf8");
  // Create the output directory
  mkdirSync(join(process.cwd(), "moon"), { recursive: true });
}

function cleanup() {
  try {
    unlinkSync(join(process.cwd(), "moon.config.json"));
  } catch {}
  try {
    unlinkSync(jitCssPath);
  } catch {}
  try {
    const { rmSync } = require("fs");
    rmSync(join(process.cwd(), "moon"), { recursive: true, force: true });
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}

describe("JIT Extract — color patterns", () => {
  beforeEach(() => {
    Controller.reset();
    setupConfig();
  });

  afterEach(cleanup);

  it("bg:#ff0000 generates correct CSS class", () => {
    const file = writeTmpFile("color.tsx", `<div className="bg:#ff0000" />`);
    jitModule.Sync_Changes(file);
    const css = readJitCss();

    expect(css).toContain("background-color:#ff0000");
  });

  it("text:#blue generates correct CSS class", () => {
    const file = writeTmpFile("text.tsx", `<span className="text:#blue" />`);
    jitModule.Sync_Changes(file);
    const css = readJitCss();

    expect(css).toContain("color:#blue");
  });

  it("unknown prop x:#red produces no output", () => {
    const file = writeTmpFile("unknown.tsx", `<div className="x:#red" />`);
    jitModule.Sync_Changes(file);
    const css = readJitCss();

    // x is not in ColorsPropsByShortNames — should not generate CSS
    expect(css).not.toContain("x:#red");
  });

  it("fill:#accent generates fill CSS", () => {
    const file = writeTmpFile("fill.tsx", `<svg className="fill:#accent" />`);
    jitModule.Sync_Changes(file);
    const css = readJitCss();

    expect(css).toContain("fill:#accent");
  });
});

describe("JIT Extract — spacing patterns", () => {
  beforeEach(() => {
    Controller.reset();
    setupConfig();
  });

  afterEach(cleanup);

  it("p:10px generates correct spacing class", () => {
    const file = writeTmpFile("spacing.tsx", `<div className="p:10px" />`);
    jitModule.Sync_Changes(file);
    const css = readJitCss();

    expect(css).toContain("p:10px");
  });

  it("m:2rem generates correct spacing class", () => {
    const file = writeTmpFile("margin.tsx", `<div className="m:2rem" />`);
    jitModule.Sync_Changes(file);
    const css = readJitCss();

    expect(css).toContain("m:2rem");
  });
});

describe("JIT Extract — deduplication", () => {
  beforeEach(() => {
    Controller.reset();
    setupConfig();
  });

  afterEach(cleanup);

  it("same pattern in two files does not produce duplicate CSS", () => {
    const file1 = writeTmpFile("dup1.tsx", `<div className="bg:#fff" />`);
    const file2 = writeTmpFile("dup2.tsx", `<div className="bg:#fff" />`);
    jitModule.Sync_Changes(file1);
    jitModule.Sync_Changes(file2);
    const css = readJitCss();

    const matches = css.match(/background-color:#fff/g);
    expect(matches?.length).toBe(1);
  });
});

describe("JIT Extract — error handling", () => {
  it("non-existent file logs error but does not throw", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => jitModule.Extract("/nonexistent/file.tsx")).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
