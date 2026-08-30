/**
 * Tests for hexToRGB — both runtime (index.ts) and builder (utils.ts) copies.
 *
 * Both implementations are identical. Testing the builder copy since it's
 * exported (the runtime copy is internal to index.ts).
 */
import { describe, it, expect } from "vitest";
import { hexToRGB } from "../builder/utils.js";

describe("hexToRGB", () => {
  it("#fff (3-char) → 255, 255, 255", () => {
    expect(hexToRGB("#fff")).toBe("255, 255, 255");
  });

  it("#000 (3-char) → 0, 0, 0", () => {
    expect(hexToRGB("#000")).toBe("0, 0, 0");
  });

  it("#000000 (6-char) → 0, 0, 0", () => {
    expect(hexToRGB("#000000")).toBe("0, 0, 0");
  });

  it("#ff5733 → 255, 87, 51", () => {
    expect(hexToRGB("#ff5733")).toBe("255, 87, 51");
  });

  it("#ff000080 (8-char with alpha) → returns raw string (passthrough)", () => {
    expect(hexToRGB("#ff000080")).toBe("#ff000080");
  });

  it("rgb(255,0,0) → returns raw string (passthrough)", () => {
    expect(hexToRGB("rgb(255,0,0)")).toBe("rgb(255,0,0)");
  });

  it("named color 'red' → returns raw string (passthrough)", () => {
    expect(hexToRGB("red")).toBe("red");
  });

  it("empty string → returns raw string (passthrough)", () => {
    expect(hexToRGB("")).toBe("");
  });
});
