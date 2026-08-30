/**
 * Tests for getStyles() — CSS variable generation and utility class output.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { Controller } from "../builder/controller.js";
import { getStyles } from "../builder/buildStyles.js";

function makeSpacingConfig(overrides: any = {}) {
  return {
    props: { padding: "p", margin: "m" },
    variableName: "spacing",
    values: { sm: "4px", md: "8px" },
    ...overrides,
  };
}

describe("getStyles — CSS variable generation", () => {
  beforeEach(() => {
    Controller.reset();
    Controller.config.useStaticNumbers = false;
    Controller.config.styles = [];
  });

  it("generates :root CSS variables with correct names and values", async () => {
    Controller.config.styles = [makeSpacingConfig()];
    const output = await getStyles();

    expect(output).toContain("--spacing-sm:4px;");
    expect(output).toContain("--spacing-md:8px;");
  });

  it("generates utility classes referencing CSS variables", async () => {
    Controller.config.styles = [makeSpacingConfig()];
    const output = await getStyles();

    expect(output).toContain(".p-sm{padding:var(--spacing-sm);}");
    expect(output).toContain(".m-md{margin:var(--spacing-md);}");
  });

  it("useStaticNumbers: true → uses raw values instead of var()", async () => {
    Controller.config.useStaticNumbers = true;
    Controller.config.styles = [makeSpacingConfig()];
    const output = await getStyles();

    expect(output).toContain(".p-sm{padding:4px;}");
    expect(output).not.toContain("var(--spacing-sm)");
  });

  it("props-less style entry → generates only variables, no classes", async () => {
    Controller.config.styles = [{ props: {}, variableName: "tokens", values: { primary: "#ff0000", secondary: "#00ff00" } }] as any;
    const output = await getStyles();

    expect(output).toContain("--tokens-primary:#ff0000;");
    expect(output).toContain("--tokens-secondary:#00ff00;");
    // No utility classes should be generated for props-less entries
    expect(output).not.toContain("{background-color:");
    expect(output).not.toContain("{color:");
  });

  it("populates PropsByShortNames during generation", async () => {
    Controller.config.styles = [makeSpacingConfig()];
    await getStyles();

    expect(typeof Controller.PropsByShortNames.p).toBe("function");
    expect(typeof Controller.PropsByShortNames.m).toBe("function");
  });

  it("populates GeneratedClasses with correct CSS values", async () => {
    Controller.config.styles = [makeSpacingConfig()];
    await getStyles();

    expect(Controller.GeneratedClasses["p-sm"]).toBe("padding:var(--spacing-sm)");
    expect(Controller.GeneratedClasses["m-md"]).toBe("margin:var(--spacing-md)");
  });

  it("generates directional padding classes", async () => {
    Controller.config.styles = [makeSpacingConfig()];
    const output = await getStyles();

    expect(output).toContain(".pr-sm{padding-right:var(--spacing-sm);}");
    expect(output).toContain(".pl-sm{padding-left:var(--spacing-sm);}");
    expect(output).toContain(".pt-sm{padding-top:var(--spacing-sm);}");
    expect(output).toContain(".pb-sm{padding-bottom:var(--spacing-sm);}");
    expect(output).toContain(".px-sm{padding-inline:var(--spacing-sm);}");
    expect(output).toContain(".py-sm{padding-block:var(--spacing-sm);}");
  });
});
