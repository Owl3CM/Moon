/**
 * Tests for buildColors fixes (Phase 1 Tasks 2, 5 + Phase 2 Task 5).
 *
 * Phase 1 Task 2: handleOptions must not crash when "*" key is missing.
 * Phase 1 Task 5: getColors must not mutate Controller.config.colors.themes.
 * Phase 2 Task 5: defaultsProps must not be mutated; handleOptions must not mutate input options.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { Controller } from "../builder/controller.js";
import { getColors } from "../builder/buildColors.js";

function makeConfig(overrides: Partial<typeof Controller.config.colors> = {}) {
  return {
    options: {
      "*": { opacities: [0.1, 0.5], props: ["bg", "text"] },
    },
    staticColors: {
      white: "#ffffff",
      black: "#000000",
    },
    themes: {
      light: { primary: "#1a1a2e", secondary: "#e94560" },
      dark: { primary: "#e94560", secondary: "#1a1a2e" },
    },
    ...overrides,
  };
}

describe("getColors — config mutation prevention", () => {
  beforeEach(() => {
    Controller.reset();
  });

  it("does not mutate Controller.config.colors.themes", async () => {
    Controller.config.colors = makeConfig();
    const originalThemes = JSON.parse(JSON.stringify(Controller.config.colors.themes));

    await getColors();

    // Themes must still be hex, NOT rgb-converted
    expect(Controller.config.colors.themes).toEqual(originalThemes);
    expect((Controller.config.colors.themes.light as any).primary).toBe("#1a1a2e");
    expect((Controller.config.colors.themes.dark as any).secondary).toBe("#1a1a2e");
  });

  it("does not mutate Controller.config.colors.options", async () => {
    Controller.config.colors = makeConfig();
    const originalOptions = JSON.parse(JSON.stringify(Controller.config.colors.options));

    await getColors();

    // Options must still have the "*" key intact
    expect(Controller.config.colors.options).toEqual(originalOptions);
    expect((Controller.config.colors.options as any)["*"]).toBeDefined();
  });

  it("consecutive calls produce identical CSS output", async () => {
    Controller.config.colors = makeConfig();
    const output1 = await getColors();

    Controller.reset();
    const output2 = await getColors();

    expect(output1).toBe(output2);
  });

  it("output has correct structure: :root, theme selectors, utility classes", async () => {
    Controller.config.colors = makeConfig();
    const output = await getColors();

    // Section 1: :root with static colors + rgb variables
    expect(output).toContain(":root{");
    expect(output).toContain("--rgb-white:255, 255, 255");
    expect(output).toContain("--white:rgb(var(--rgb-white))");
    expect(output).toContain("--primary:rgb(var(--rgb-primary))");

    // Section 1: opacity variants in :root
    expect(output).toContain("--primary-100:rgba(var(--rgb-primary),0.1)");
    expect(output).toContain("--primary-500:rgba(var(--rgb-primary),0.5)");

    // Section 2: theme selectors with rgb-converted values
    expect(output).toContain(".light{--rgb-primary:26, 26, 46;--rgb-secondary:233, 69, 96;}");
    expect(output).toContain(".dark{--rgb-primary:233, 69, 96;--rgb-secondary:26, 26, 46;}");

    // Section 3: utility classes
    expect(output).toContain(".bg-primary{background-color:var(--primary);}");
    expect(output).toContain(".text-secondary{color:var(--secondary);}");
    expect(output).toContain(".bg-primary-500{background-color:var(--primary-500);}");
  });
});

describe("handleOptions — missing '*' key safety", () => {
  beforeEach(() => {
    Controller.reset();
  });

  it("does NOT crash when options has no '*' key", async () => {
    Controller.config.colors = makeConfig({
      options: { primary: { props: ["bg", "text"] } },
    });

    await expect(getColors()).resolves.toBeDefined();
  });

  it("does NOT crash when options is empty object", async () => {
    Controller.config.colors = makeConfig({ options: {} });

    await expect(getColors()).resolves.toBeDefined();
  });

  it("with no '*', per-color options are still used", async () => {
    Controller.config.colors = makeConfig({
      options: {
        primary: { props: ["bg", "fill"], opacities: [0.3] },
      },
    });

    const output = await getColors();

    // primary gets the explicitly configured props
    expect(output).toContain(".bg-primary{background-color:var(--primary);}");
    expect(output).toContain(".fill-primary{fill:var(--primary);}");

    // opacity variant
    expect(output).toContain("--primary-300:rgba(var(--rgb-primary),0.3)");
  });

  it("still works correctly when '*' IS present", async () => {
    Controller.config.colors = makeConfig({
      options: { "*": { opacities: [0.5], props: ["bg", "text"] } },
    });

    const output = await getColors();
    expect(output).toContain(".bg-primary{background-color:var(--primary);}");
    expect(output).toContain(".text-white{color:var(--white);}");
    expect(output).toContain("--primary-500:rgba(var(--rgb-primary),0.5)");
  });
});

describe("defaultsProps — immutability across calls", () => {
  beforeEach(() => {
    Controller.reset();
  });

  it("custom '*' props in one call do not bleed into the next", async () => {
    // First call: custom props (only "bg" and "stroke")
    Controller.config.colors = makeConfig({
      options: { "*": { props: ["bg", "stroke"] } },
    });
    const output1 = await getColors();
    expect(output1).toContain(".bg-primary{");
    expect(output1).toContain(".stroke-primary{");
    expect(output1).not.toContain(".text-primary{");

    // Second call: no custom props → should use defaults ["bg", "text", "fill", "border"]
    Controller.reset();
    Controller.config.colors = makeConfig({
      options: {},
    });
    const output2 = await getColors();
    expect(output2).toContain(".bg-primary{");
    expect(output2).toContain(".text-primary{");
    expect(output2).toContain(".fill-primary{");
    expect(output2).toContain(".border-primary{");
    // stroke should NOT appear since it was only set in the first call
    expect(output2).not.toContain(".stroke-primary{");
  });
});

describe("getColors — empty themes", () => {
  beforeEach(() => {
    Controller.reset();
  });

  it("empty themes: {} → no theme selectors, only :root and static colors", async () => {
    Controller.config.colors = makeConfig({ themes: {} as any });
    const output = await getColors();

    expect(output).toContain(":root{");
    expect(output).toContain("--white:");
    expect(output).not.toContain(".light{");
    expect(output).not.toContain(".dark{");
  });
});

describe("getColors — ColorsVariables population", () => {
  beforeEach(() => {
    Controller.reset();
  });

  it("populates ColorsVariables with deduplicated color names", async () => {
    Controller.config.colors = makeConfig();
    await getColors();

    expect(Controller.ColorsVariables).toContain("primary");
    expect(Controller.ColorsVariables).toContain("secondary");
    expect(Controller.ColorsVariables).toContain("white");
    expect(Controller.ColorsVariables).toContain("black");
    // No duplicates
    const unique = [...new Set(Controller.ColorsVariables)];
    expect(Controller.ColorsVariables.length).toBe(unique.length);
  });
});
