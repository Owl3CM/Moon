/**
 * Tests for Moon runtime (lib/index.ts).
 *
 * Tests the ACTUAL Moon module by mocking browser globals before import.
 * Covers: setColors, updateColors, removeColors, setTheme, onThemeChange, SSR guard.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DOM ───────────────────────────────────────────────────────────────
// window must be stubbed FIRST so that `isBrowser = typeof window !== "undefined"`
// evaluates to true when the Moon module is imported.
vi.stubGlobal("window", {});

const styleProps = new Map<string, string>();
const mockStyle = {
  setProperty: vi.fn((key: string, value: string) => styleProps.set(key, value)),
  removeProperty: vi.fn((key: string) => styleProps.delete(key)),
  getPropertyValue: vi.fn((key: string) => styleProps.get(key) ?? ""),
};

const classSet = new Set<string>();
const mockClassList = {
  add: vi.fn((cls: string) => classSet.add(cls)),
  remove: vi.fn((cls: string) => classSet.delete(cls)),
};

vi.stubGlobal("document", {
  documentElement: {
    style: mockStyle,
    classList: mockClassList,
  },
});

vi.stubGlobal("localStorage", {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
});

vi.stubGlobal(
  "matchMedia",
  vi.fn(() => ({ matches: false })),
);

// ─── Import AFTER mocks ────────────────────────────────────────────────────
const { default: Moon } = await import("../index.js");

// ─── Helpers ────────────────────────────────────────────────────────────────
function resetAll() {
  // Clear internal dynamicColors state via public API
  Moon.removeColors();
  // Now clear mocks and DOM state
  styleProps.clear();
  classSet.clear();
  mockStyle.setProperty.mockClear();
  mockStyle.removeProperty.mockClear();
  mockClassList.add.mockClear();
  mockClassList.remove.mockClear();
  Moon._listeners = [];
  Moon.currentTheme = "" as any;
}

// ─── setColors ──────────────────────────────────────────────────────────────
describe("Moon.setColors", () => {
  beforeEach(resetAll);

  it("first call sets CSS variables correctly", () => {
    Moon.setColors({ primary: "#ff0000", secondary: "#00ff00" } as any);

    expect(styleProps.get("--primary")).toBe("#ff0000");
    expect(styleProps.get("--secondary")).toBe("#00ff00");
    expect(styleProps.get("--rgb-primary")).toBe("255, 0, 0");
    expect(styleProps.get("--rgb-secondary")).toBe("0, 255, 0");
  });

  it("second call replaces with NEW values, not old ones", () => {
    Moon.setColors({ primary: "#ff0000" } as any);
    expect(styleProps.get("--primary")).toBe("#ff0000");

    Moon.setColors({ primary: "#0000ff" } as any);
    expect(styleProps.get("--primary")).toBe("#0000ff");
    expect(styleProps.get("--rgb-primary")).toBe("0, 0, 255");
  });

  it("removes keys no longer present in new colors", () => {
    Moon.setColors({ primary: "#ff0000", secondary: "#00ff00" } as any);
    Moon.setColors({ primary: "#ff0000" } as any);

    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--secondary");
    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--rgb-secondary");
  });

  it("second call with NEW keys actually sets them", () => {
    Moon.setColors({ primary: "#ff0000" } as any);
    Moon.setColors({ primary: "#ff0000", accent: "#00ff00" } as any);

    expect(styleProps.get("--accent")).toBe("#00ff00");
    expect(styleProps.get("--rgb-accent")).toBe("0, 255, 0");
  });

  it("handles short hex (#abc) correctly", () => {
    Moon.setColors({ primary: "#abc" } as any);
    // #abc expands to #aabbcc → rgb(170, 187, 204)
    expect(styleProps.get("--rgb-primary")).toBe("170, 187, 204");
  });
});

// ─── updateColors ───────────────────────────────────────────────────────────
describe("Moon.updateColors", () => {
  beforeEach(resetAll);

  it("merges new colors with existing dynamic colors", () => {
    Moon.setColors({ primary: "#ff0000" } as any);
    Moon.updateColors({ secondary: "#00ff00" } as any);

    expect(styleProps.get("--primary")).toBe("#ff0000");
    expect(styleProps.get("--secondary")).toBe("#00ff00");
  });
});

// ─── removeColors ───────────────────────────────────────────────────────────
describe("Moon.removeColors", () => {
  beforeEach(resetAll);

  it("removes all dynamic colors when called with no args", () => {
    Moon.setColors({ primary: "#ff0000", secondary: "#00ff00" } as any);
    mockStyle.removeProperty.mockClear();

    Moon.removeColors();

    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--primary");
    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--rgb-primary");
    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--secondary");
    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--rgb-secondary");
  });

  it("removes only specified colors", () => {
    Moon.setColors({ primary: "#ff0000", secondary: "#00ff00" } as any);
    mockStyle.removeProperty.mockClear();

    Moon.removeColors(["primary"] as any);

    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--primary");
    expect(mockStyle.removeProperty).not.toHaveBeenCalledWith("--secondary");
  });

  it("clears dynamicColors tracking so next setColors starts fresh", () => {
    Moon.setColors({ primary: "#ff0000" } as any);
    Moon.removeColors();

    // Clear mocks AFTER removeColors so we can assert the next setColors call cleanly
    mockStyle.removeProperty.mockClear();
    mockStyle.setProperty.mockClear();

    Moon.setColors({ secondary: "#00ff00" } as any);

    // Since tracking was cleared, setColors should go through the "first call" path
    // (no diffing against old keys). 'primary' should not be touched at all.
    const removeArgs = mockStyle.removeProperty.mock.calls.map((c: any[]) => c[0]);
    expect(removeArgs).not.toContain("--primary");
    expect(styleProps.get("--secondary")).toBe("#00ff00");
  });
});

// ─── setTheme ───────────────────────────────────────────────────────────────
describe("Moon.setTheme", () => {
  beforeEach(resetAll);

  it("adds theme class and stores in localStorage", () => {
    Moon.setTheme("dark" as any);

    expect(mockClassList.add).toHaveBeenCalledWith("dark");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    expect(Moon.currentTheme).toBe("dark");
  });

  it("removes previous theme class before adding new one", () => {
    Moon.setTheme("light" as any);
    Moon.setTheme("dark" as any);

    expect(mockClassList.remove).toHaveBeenCalledWith("light");
    expect(mockClassList.add).toHaveBeenCalledWith("dark");
  });

  it("does NOT clear dynamic colors on theme switch", () => {
    Moon.setColors({ primary: "#ff0000" } as any);
    const primaryBefore = styleProps.get("--primary");
    expect(primaryBefore).toBe("#ff0000");

    mockStyle.removeProperty.mockClear();
    Moon.setTheme("dark" as any);

    // removeProperty should NOT have been called for dynamic color keys
    const removeArgs = mockStyle.removeProperty.mock.calls.map((c: any[]) => c[0]);
    expect(removeArgs).not.toContain("--primary");
    expect(removeArgs).not.toContain("--rgb-primary");
    // Dynamic colors should still be in the style map
    expect(styleProps.get("--primary")).toBe("#ff0000");
  });
});

// ─── onThemeChange ──────────────────────────────────────────────────────────
describe("Moon.onThemeChange", () => {
  beforeEach(resetAll);

  it("notifies all registered listeners", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    Moon.onThemeChange(cb1);
    Moon.onThemeChange(cb2);

    Moon.setTheme("dark" as any);

    expect(cb1).toHaveBeenCalledWith("dark");
    expect(cb2).toHaveBeenCalledWith("dark");
  });

  it("returns an unsubscribe function", () => {
    const cb = vi.fn();
    const unsub = Moon.onThemeChange(cb);

    Moon.setTheme("dark" as any);
    expect(cb).toHaveBeenCalledTimes(1);

    unsub();
    Moon.setTheme("light" as any);
    // Should NOT be called again after unsubscribe
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("unsubscribing one listener does not affect others", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const unsub1 = Moon.onThemeChange(cb1);
    Moon.onThemeChange(cb2);

    unsub1();
    Moon.setTheme("dark" as any);

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledWith("dark");
  });
});

// ─── setColor ───────────────────────────────────────────────────────────────
describe("Moon.setColor", () => {
  beforeEach(resetAll);

  it("sets a single color's CSS variables", () => {
    Moon.setColor("primary" as any, "#ff0000");

    expect(styleProps.get("--primary")).toBe("#ff0000");
    expect(styleProps.get("--rgb-primary")).toBe("255, 0, 0");
  });

  it("handles short hex correctly", () => {
    Moon.setColor("accent" as any, "#abc");
    expect(styleProps.get("--rgb-accent")).toBe("170, 187, 204");
  });
});

// ─── removeColor ────────────────────────────────────────────────────────────
describe("Moon.removeColor", () => {
  beforeEach(resetAll);

  it("removes a single color's CSS variables", () => {
    Moon.setColor("primary" as any, "#ff0000");
    mockStyle.removeProperty.mockClear();

    Moon.removeColor("primary" as any);

    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--primary");
    expect(mockStyle.removeProperty).toHaveBeenCalledWith("--rgb-primary");
  });
});

// ─── init ───────────────────────────────────────────────────────────────────
describe("Moon.init", () => {
  beforeEach(resetAll);

  it("uses stored theme from localStorage", () => {
    (localStorage.getItem as any).mockReturnValueOnce("dark");
    Moon.init();

    expect(mockClassList.add).toHaveBeenCalledWith("dark");
    expect(Moon.currentTheme).toBe("dark");
  });

  it("uses provided theme over stored theme", () => {
    (localStorage.getItem as any).mockReturnValueOnce("dark");
    Moon.init("light" as any);

    expect(mockClassList.add).toHaveBeenCalledWith("light");
    expect(Moon.currentTheme).toBe("light");
  });

  it("falls back to matchMedia when no stored or provided theme", () => {
    (localStorage.getItem as any).mockReturnValueOnce(null);
    (matchMedia as any).mockReturnValueOnce({ matches: true });
    Moon.init();

    expect(Moon.currentTheme).toBe("dark");
  });
});
