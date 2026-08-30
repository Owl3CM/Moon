/**
 * Tests for Controller.reset() (Phase 2 Task 2) and
 * Controller.init() deep merge (Phase 2 Task 3).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { Controller } from "../builder/controller.js";

describe("Controller.reset()", () => {
  it("clears GeneratedClasses", () => {
    Controller.GeneratedClasses = { "bg-primary": "background-color:var(--primary)" };
    Controller.reset();
    expect(Controller.GeneratedClasses).toEqual({});
  });

  it("clears StylesVariables and ColorsVariables", () => {
    Controller.StylesVariables = ["spacing"];
    Controller.ColorsVariables = ["primary", "secondary"];
    Controller.reset();
    expect(Controller.StylesVariables).toEqual([]);
    expect(Controller.ColorsVariables).toEqual([]);
  });

  it("resets PropsByShortNames to defaults", () => {
    Controller.PropsByShortNames = { custom: "something" };
    Controller.reset();
    expect(Controller.PropsByShortNames.bg).toBe("background-color");
    expect(Controller.PropsByShortNames.text).toBe("color");
    expect(Controller.PropsByShortNames.round).toBe("border-radius");
    expect(typeof Controller.PropsByShortNames.content).toBe("function");
    expect(Controller.PropsByShortNames.custom).toBeUndefined();
  });

  it("does not clear config or JitGenerated", () => {
    Controller.config.useJit = false;
    Controller.JitGenerated = { test: "value" };
    Controller.reset();
    expect(Controller.config.useJit).toBe(false);
    expect(Controller.JitGenerated).toEqual({ test: "value" });
    // Restore
    Controller.config.useJit = true;
    Controller.JitGenerated = {};
  });
});

describe("Controller.init() — deep merge", () => {
  beforeEach(() => {
    // Reset config to defaults
    Controller.config = {
      useJit: true,
      useStaticNumbers: false,
      projectDir: "./src",
      content: ["./src/**/*.{html,js,jsx,tsx}"],
      colors: {
        options: {},
        staticColors: {},
        themes: {
          light: {},
          dark: {},
        },
      },
      styles: [],
    };
  });

  it("merges nested colors without losing sibling keys", async () => {
    await Controller.init({
      colors: {
        themes: {
          light: { primary: "#ff0000" },
        },
      },
    });

    // light.primary was set
    expect((Controller.config.colors.themes.light as any).primary).toBe("#ff0000");
    // dark theme still exists (not wiped out by shallow spread)
    expect(Controller.config.colors.themes.dark).toBeDefined();
    // staticColors still exists
    expect(Controller.config.colors.staticColors).toBeDefined();
    // options still exists
    expect(Controller.config.colors.options).toBeDefined();
  });

  it("replaces arrays entirely (not deep-merged)", async () => {
    Controller.config.content = ["./old/**/*.html"];
    await Controller.init({ content: ["./new/**/*.tsx"] });
    expect(Controller.config.content).toEqual(["./new/**/*.tsx"]);
  });

  it("replaces primitive values", async () => {
    await Controller.init({ useJit: false, projectDir: "./app" });
    expect(Controller.config.useJit).toBe(false);
    expect(Controller.config.projectDir).toBe("./app");
  });

  it("preserves keys not present in source", async () => {
    await Controller.init({ useJit: false });
    // Other keys should still be at their defaults
    expect(Controller.config.useStaticNumbers).toBe(false);
    expect(Controller.config.projectDir).toBe("./src");
    expect(Controller.config.colors.themes.light).toBeDefined();
  });
});
