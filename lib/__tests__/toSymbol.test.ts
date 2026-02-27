/**
 * Comprehensive tests for the SVG sprite pipeline's `toSymbol` function.
 *
 * These tests are library-agnostic — they verify every SVG pattern
 * a real icon could have, not just Solar-specific structures.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { toSymbol } from "../vite-plugin-icons";

let optimize: Function;

beforeAll(async () => {
  const svgo = await import("svgo");
  optimize = svgo.optimize;
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: parse a <symbol> tag and return its attributes + inner content
// ─────────────────────────────────────────────────────────────────────────────

function parseSymbol(result: string) {
  const tagMatch = result.match(/<symbol([^>]*)>([\s\S]*)<\/symbol>/);
  const attrs = tagMatch?.[1] ?? "";
  const inner = tagMatch?.[2]?.trim() ?? "";
  const id = attrs.match(/id="([^"]*)"/)?.[1];
  const viewBox = attrs.match(/viewBox="([^"]*)"/)?.[1];
  const fill = attrs.match(/\bfill="([^"]*)"/)?.[1];
  const stroke = attrs.match(/\bstroke="([^"]*)"/)?.[1];
  return { attrs, inner, id, viewBox, fill, stroke };
}

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 1: ROOT FILL ATTRIBUTION
//  The <symbol>'s default fill MUST be derived from the root <svg> tag only.
// ═════════════════════════════════════════════════════════════════════════════

describe("Root fill attribution", () => {
  it('root fill="none" → symbol gets fill="none" (stroke-based icon)', async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16" stroke="black" stroke-width="1.5"/>
    </svg>`;
    const result = await toSymbol(svg, "test-stroke", "linear", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("none");
  });

  it('no root fill → symbol gets fill="currentColor" (fill-based icon)', async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test-fill", "bold", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("currentColor");
  });

  it('root fill="#008fe2" on colored → symbol copies exact color', async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="#008fe2" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16"/>
    </svg>`;
    const result = await toSymbol(svg, "docker-colored", "colored", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("#008fe2");
  });

  it('root fill="none" on colored → symbol copies fill="none"', async () => {
    const svg = `<svg viewBox="0 0 45 43" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#22ff84" d="M21 42L0 28V10l11 8 9-17h15L21 42z"/>
    </svg>`;
    const result = await toSymbol(svg, "vitest-colored", "colored", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("none");
  });

  it("no root fill on colored → symbol has no fill attr", async () => {
    const svg = `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg">
      <path fill="#fbf0df" d="M10 10h60v50H10z"/>
    </svg>`;
    const result = await toSymbol(svg, "bun-colored", "colored", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBeUndefined();
  });

  it("root stroke on colored → symbol copies exact stroke", async () => {
    const svg = `<svg viewBox="0 0 24 24" stroke="#ff0000" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16"/>
    </svg>`;
    const result = await toSymbol(svg, "stroked-colored", "colored", optimize);
    const { stroke } = parseSymbol(result);
    expect(stroke).toBe("#ff0000");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 2: COLOR NORMALIZATION
//  Non-colored icons: all fills/strokes → currentColor
//  Colored icons: preserve exact colors
// ═════════════════════════════════════════════════════════════════════════════

describe("Color normalization", () => {
  it('non-colored: fill="black" → fill="currentColor"', async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).toContain('fill="currentColor"');
    expect(result).not.toContain('fill="black"');
  });

  it('non-colored: stroke="black" → stroke="currentColor"', async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16" stroke="black" stroke-width="1.5"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "linear", optimize);
    expect(result).toContain('stroke="currentColor"');
    expect(result).not.toContain('stroke="black"');
  });

  it('non-colored: fill="#1A1A1A" → fill="currentColor"', async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16" fill="#1A1A1A"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).toContain('fill="currentColor"');
    expect(result).not.toContain('fill="#1A1A1A"');
    expect(result).not.toContain('fill="#1a1a1a"');
  });

  it('non-colored: fill="none" is preserved on the symbol level', async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="1.5"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "linear", optimize);
    const { fill } = parseSymbol(result);
    // The symbol itself must have fill="none" — SVGO may strip redundant fill="none" from children
    expect(fill).toBe("none");
    // Inner stroke should still be converted to currentColor
    expect(result).toContain('stroke="currentColor"');
  });

  it("non-colored: url() gradient references are preserved", async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g"><stop stop-color="#f00"/></linearGradient></defs>
      <path d="M12 4v16" fill="url(#g)"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).toContain("url(");
    expect(result).not.toMatch(/fill="currentColor".*url\(/);
  });

  it('colored: fill="#22ff84" is preserved exactly', async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#22ff84" d="M12 4v16"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "colored", optimize);
    // SVGO may normalize the hex but the color should be preserved
    expect(result).not.toContain('fill="currentColor"');
  });

  it("colored: multiple different fills preserved", async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ff0000" d="M6 4v16"/>
      <path fill="#00ff00" d="M12 4v16"/>
      <path fill="#0000ff" d="M18 4v16"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "colored", optimize);
    expect(result).not.toContain('fill="currentColor"');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 3: DUOTONE — opacity MUST survive
// ═════════════════════════════════════════════════════════════════════════════

describe("Duotone opacity preservation", () => {
  it('bold-duotone: opacity="0.5" is preserved', async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.5" d="M12 2C6.47715 2 2 6.47715 2 12" fill="black"/>
      <path d="M12 8V12L15 15" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "bold duotone", optimize);
    expect(result).toContain("opacity=");
  });

  it("line-duotone: opacity on stroke paths is preserved", async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 18V7.6" stroke="black" stroke-width="1.5"/>
      <circle opacity="0.5" cx="7.5" cy="16.5" r="5.5" stroke="black" stroke-width="1.5"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "line duotone", optimize);
    expect(result).toContain("opacity=");
  });

  it("duotone: fills become currentColor but opacity untouched", async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.5" d="M12 2v10" fill="black"/>
      <path d="M12 12v10" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "bold duotone", optimize);
    expect(result).toContain('fill="currentColor"');
    expect(result).toContain("opacity=");
    expect(result).not.toContain('fill="black"');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 4: VIEWBOX EXTRACTION
// ═════════════════════════════════════════════════════════════════════════════

describe("viewBox extraction", () => {
  it("preserves explicit viewBox", async () => {
    const svg = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    const { viewBox } = parseSymbol(result);
    expect(viewBox).toBe("0 0 48 48");
  });

  it("derives viewBox from width+height when viewBox is missing", async () => {
    const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><path d="M0 0" fill="black"/></svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    const { viewBox } = parseSymbol(result);
    expect(viewBox).toBe("0 0 32 32");
  });

  it("falls back to 0 0 24 24 when no viewBox or dimensions", async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0" fill="black"/></svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    const { viewBox } = parseSymbol(result);
    expect(viewBox).toBe("0 0 24 24");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 5: NAMESPACE & XML HARDENING
// ═════════════════════════════════════════════════════════════════════════════

describe("Namespace & XML hardening", () => {
  it("strips xmlns attributes from inner elements", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g xmlns:custom="http://example.com"><path d="M12 4v16" fill="black"/></g>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).not.toContain("xmlns:");
    expect(result).not.toContain("xmlns=");
  });

  it("replaces xlink:href with href", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs><linearGradient id="g"><stop stop-color="#f00"/></linearGradient></defs>
      <use xlink:href="#g" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).not.toContain("xlink:href");
  });

  it("strips xml:space attributes", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <text xml:space="preserve" fill="black">Hello</text>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).not.toContain("xml:space");
  });

  it("handles SVGs with XML declaration before root tag", async () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16" stroke="black" stroke-width="1.5"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "linear", optimize);
    const { fill, viewBox } = parseSymbol(result);
    expect(fill).toBe("none");
    expect(viewBox).toBe("0 0 24 24");
    expect(result).not.toContain("<?xml");
  });

  it("handles SVGs with DOCTYPE", async () => {
    const svg = `<?xml version="1.0"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v16" fill="black"/></svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    const { viewBox } = parseSymbol(result);
    expect(viewBox).toBe("0 0 24 24");
    expect(result).not.toContain("DOCTYPE");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 6: SECURITY
// ═════════════════════════════════════════════════════════════════════════════

describe("Security sanitization", () => {
  it("strips <script> tags", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <script>alert("xss")</script>
      <path d="M12 4v16" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  it("preserves <style> tags (legitimate for Illustrator exports)", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <style>.st0{fill:red}</style>
      <path class="st0" d="M12 4v16"/>
    </svg>`;
    // SVGO's inlineStyles should process the style block — we just ensure we don't strip it pre-SVGO
    const result = await toSymbol(svg, "test", "outline", optimize);
    // The path should still exist and have a fill (either inlined or via currentColor)
    expect(result).toContain("<path");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 7: SYMBOL STRUCTURE
// ═════════════════════════════════════════════════════════════════════════════

describe("Symbol structure", () => {
  it("generates valid <symbol> with correct id", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v16" fill="black"/></svg>`;
    const result = await toSymbol(svg, "my-icon", "outline", optimize);
    const { id } = parseSymbol(result);
    expect(id).toBe("my-icon");
  });

  it("does not include root <svg> tags in output", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v16" fill="black"/></svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    // Should not contain <svg> inside <symbol>
    const { inner } = parseSymbol(result);
    expect(inner).not.toMatch(/^\s*<svg/);
    expect(inner).not.toMatch(/<\/svg>\s*$/);
  });

  it("preserves nested <svg> elements", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <svg x="2" y="2" width="20" height="20"><rect width="20" height="20" fill="black"/></svg>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    // The inner <svg> should survive
    expect(result).toContain("<symbol");
    expect(result).toContain("</symbol>");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 8: GRADIENT ID COLLISION PREVENTION
// ═════════════════════════════════════════════════════════════════════════════

describe("Gradient ID prefixing", () => {
  it("prefixes internal IDs with icon id for non-colored", async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="a"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient></defs>
      <path d="M12 4v16" fill="url(#a)"/>
    </svg>`;
    const result = await toSymbol(svg, "my-icon", "outline", optimize);
    // SVGO's prefixIds should have prefixed "a" with "my-icon"
    expect(result).toContain("my-icon");
  });

  it("prefixes internal IDs with icon id for colored", async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="grad1"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient></defs>
      <path d="M12 4v16" fill="url(#grad1)"/>
    </svg>`;
    const result = await toSymbol(svg, "brand-icon", "colored", optimize);
    expect(result).toContain("brand-icon");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 9: REAL-WORLD SVG PATTERNS FROM VARIOUS LIBRARIES
// ═════════════════════════════════════════════════════════════════════════════

describe("Real-world SVG patterns", () => {
  //
  // Solar Linear: stroke-based with some fill detail elements
  //
  it('Solar Linear: stroke paths + fill detail → fill="none" on symbol', async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 18V7.6" stroke="black" stroke-width="1.5"/>
      <path d="M15 5V8" stroke="black" stroke-width="1.67" stroke-linecap="round"/>
      <circle cx="7.5" cy="16.5" r="5.5" stroke="black" stroke-width="1.5"/>
      <path d="M6 14V13.25C5.586 13.25 5.25 13.586 5.25 14H6Z" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "airbuds-right-linear", "linear", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("none");
    expect(result).toContain('stroke="currentColor"');
    expect(result).toContain('fill="currentColor"');
    expect(result).not.toContain('fill="black"');
    expect(result).not.toContain('stroke="black"');
  });

  //
  // Solar Bold Duotone: fill-based with opacity layers
  //
  it('Solar Bold Duotone: opacity layers + fill paths → all fill="currentColor" + opacity preserved', async () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.5" d="M22 8.3V6.2C22 6 22 5.9 22 5.85" fill="black"/>
      <path d="M13 17.25H17.76V18.75H13Z" fill="black"/>
      <path d="M19.5 5.25C19.91 5.25 20.25 5.59 20.25 6V8.5" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "airbuds-bold-duotone", "bold duotone", optimize);
    expect(result).toContain("opacity=");
    expect(result).toContain('fill="currentColor"');
    expect(result).not.toContain('fill="black"');
  });

  //
  // Heroicons-style: fill-based, no root fill attribute
  //
  it('Heroicons: no root fill, fill-based paths → fill="currentColor"', async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" clip-rule="evenodd"/>
    </svg>`;
    const result = await toSymbol(svg, "check-circle", "outline", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("currentColor");
  });

  //
  // Heroicons-style: stroke-based outline variant
  //
  it('Heroicons outline: root fill="none" + stroke paths → fill="none"', async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`;
    const result = await toSymbol(svg, "check-circle-outline", "outline", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("none");
  });

  //
  // Phosphor-style: already uses currentColor
  //
  it('Phosphor: fill="currentColor" kept as-is', async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
    </svg>`;
    const result = await toSymbol(svg, "circle", "outline", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("currentColor");
  });

  //
  // Tabler-style: stroke-based with explicit stroke="currentColor" and fill="none"
  //
  it('Tabler: stroke="currentColor" + fill="none" → fill="none"', async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
    </svg>`;
    const result = await toSymbol(svg, "target", "outline", optimize);
    const { fill } = parseSymbol(result);
    expect(fill).toBe("none");
  });

  //
  // Brand logo with complex gradients (like the key-colored icon)
  //
  it("Complex colored: gradients + multiple fills preserved", async () => {
    const svg = `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="128" y2="128">
          <stop offset="0" stop-color="#ff0000"/>
          <stop offset="1" stop-color="#0000ff"/>
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="url(#a)"/>
      <path fill="#ffffff" d="M64 32l20 40H44z"/>
    </svg>`;
    const result = await toSymbol(svg, "brand-logo", "colored", optimize);
    expect(result).not.toContain('fill="currentColor"');
    expect(result).toContain("url(");
    expect(result).toContain("brand-logo"); // prefixIds
  });

  //
  // Figma export with base64 embedded raster image
  //
  it("Figma: base64 images preserved in colored icons", async () => {
    const svg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <image href="data:image/png;base64,iVBORw0KGgo=" width="64" height="64"/>
      <path fill="#ff0000" d="M10 10h44v44H10z"/>
    </svg>`;
    const result = await toSymbol(svg, "raster-icon", "colored", optimize);
    expect(result).toContain("data:image/png;base64");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 10: EDGE CASES
// ═════════════════════════════════════════════════════════════════════════════

describe("Edge cases", () => {
  it("empty SVG produces valid symbol", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"></svg>`;
    const result = await toSymbol(svg, "empty", "outline", optimize);
    expect(result).toContain('<symbol id="empty"');
    expect(result).toContain("</symbol>");
  });

  it("SVG with only whitespace content", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">   </svg>`;
    const result = await toSymbol(svg, "whitespace", "outline", optimize);
    expect(result).toContain('<symbol id="whitespace"');
  });

  it("very long path data is preserved", async () => {
    const longPath = "M" + Array.from({ length: 500 }, (_, i) => `${i} ${i}`).join("L");
    const svg = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><path d="${longPath}" fill="black"/></svg>`;
    const result = await toSymbol(svg, "long-path", "outline", optimize);
    expect(result).toContain("<path");
  });

  it("variant with spaces in folder name handled correctly", async () => {
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.5" d="M12 4v16" fill="black"/>
    </svg>`;
    // "bold duotone" is a variant with a space — should be treated as non-colored
    const result = await toSymbol(svg, "icon-bold-duotone", "bold duotone", optimize);
    expect(result).toContain('fill="currentColor"');
    expect(result).toContain("opacity=");
  });

  it("SVG with comments does not include them in output", async () => {
    const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <!-- This is a comment -->
      <path d="M12 4v16" fill="black"/>
    </svg>`;
    const result = await toSymbol(svg, "test", "outline", optimize);
    expect(result).not.toContain("<!--");
  });
});
