# Moon Style — Complete Documentation

> **Version:** 0.1.1 · **License:** MIT · **Repo:** [Owl3CM/Moon](https://github.com/Owl3CM/Moon)

Moon Style is a **config-driven CSS utility generator** with a JIT engine, multi-theme color system, and Vite integration. You define your design tokens in a `moon.config.json` file and Moon generates all the CSS for you — variables, utility classes, theme selectors, and JIT-compiled on-demand classes.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start — Vite Plugin](#quick-start--vite-plugin)
3. [Configuration (`moon.config.json`)](#configuration)
4. [CSS Builder Pipeline (How It Works)](#css-builder-pipeline)
5. [Generated Output Files](#generated-output-files)
6. [Styles System](#styles-system)
7. [Color System & Themes](#color-system--themes)
8. [Static Classes (Always Generated)](#static-classes)
9. [JIT Engine](#jit-engine)
10. [PurgeCSS Integration](#purgecss-integration)
11. [Runtime API (`Moon` Object)](#runtime-api)
12. [CLI Commands](#cli-commands)
13. [Type Generation (`Moon.Types.ts`)](#type-generation)
14. [Configuration Schema Reference](#configuration-schema-reference)
15. [Property Short-Name Reference](#property-short-name-reference)

---

## Installation

```bash
# npm
npm install moon-style --save-dev

# yarn
yarn add moon-style --dev

# pnpm
pnpm add moon-style -D
```

> **Dev dependency** — Moon Style's CSS generation runs only during development. However, the runtime `Moon` object (theme switching, dynamic colors) is used client-side — it's bundled into your app by the Vite plugin's `init.ts` import.

---

## Quick Start — Vite Plugin

The recommended integration is via the Vite plugin. Add it to your `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import moonPlugin from "moon-style/vite";

export default defineConfig({
  plugins: [moonPlugin()],
});
```

### What the Plugin Does Automatically

| Action                                                                  | When                                      |
| ----------------------------------------------------------------------- | ----------------------------------------- |
| Runs `Watcher()` — builds CSS + watches `moon.config.json` + JIT        | `configureServer` (dev mode)              |
| Runs `PurgeCSS()` — purges unused classes                               | `buildStart` (production only)            |
| Ensures `.gitignore` contains `moon/`                                   | `buildStart` (always)                     |
| Creates `./moon/init.ts` (imports CSS + calls `Moon.init()`)            | `buildStart` + `configureServer` (always) |
| Injects `<script type="module" src="/moon/init.ts">` into HTML `<head>` | `transformIndexHtml` (always)             |

**Result:** Zero manual setup. No `import 'moon/main.css'` or `Moon.init()` in your code.

### Generated `moon/init.ts`

```ts
import Moon from "moon-style";
import "./main.css";
Moon.init();
```

---

## Configuration

Moon Style reads `./moon.config.json` from your project root. If it doesn't exist, it copies the default config from the package.

> **Deep merge:** Your config is deep-merged with the built-in defaults. You only need to specify the fields you want to override — everything else falls back to defaults.

Add JSON schema support for autocomplete:

```json
{
  "$schema": "./node_modules/moon-style/dist/moon.config.schema.json"
}
```

### Top-Level Fields

| Field              | Type                     | Default                          | Description                                                       |
| ------------------ | ------------------------ | -------------------------------- | ----------------------------------------------------------------- |
| `useStaticNumbers` | `boolean`                | `false`                          | If `true`, outputs raw values instead of `var(--...)` references  |
| `useJit`           | `boolean`                | `true`                           | Enable/disable JIT engine                                         |
| `projectDir`       | `string`                 | `"src"`                          | Directory JIT scans for utility patterns                          |
| `content`          | `string[]`               | `["src/**/*.{html,js,jsx,tsx}"]` | Glob patterns for PurgeCSS and JIT file watching                  |
| `styles`           | `StyleDef[]`             | See default                      | Array of style token definitions                                  |
| `colors`           | `ColorDef`               | See default                      | Color system config (themes + static colors)                      |
| `screens`          | `Record<string, string>` | See default                      | Named breakpoints for JIT media queries (not used by the builder) |

---

## CSS Builder Pipeline

When Moon runs (via `Watcher()` or `buildConfig()`), this is the sequence:

```
moon.config.json
    │
    ▼
Controller.init(config)  ─── merges with defaults (deep merge)
    │
    ▼
Controller.createStyles()
    ├── getStyles()            → moon/moon.styles.css     (variables + utility classes)
    ├── getColors()            → moon/moon.themes.css     (theme selectors + color classes)
    ├── getStaticCss()         → moon/moon.static.css     (hardcoded layout/display classes)
    ├── create moon.jit.css    → moon/moon.jit.css        (JIT-generated classes, initially empty)
    ├── create main.css        → moon/main.css            (@import of all 4 files above)
    └── create Moon.Types.ts   → ./Moon.Types.ts          (Theme & Color TypeScript types)
```

### `main.css` (the single import)

```css
@import url("./moon.styles.css");
@import url("./moon.themes.css");
@import url("./moon.static.css");
@import url("./moon.jit.css");
```

---

## Generated Output Files

| File                   | Contents                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| `moon/main.css`        | Master CSS file — imports all others                                   |
| `moon/moon.styles.css` | `:root` variables + all utility classes from `styles` config           |
| `moon/moon.themes.css` | Theme class selectors + color utility classes                          |
| `moon/moon.static.css` | Hardcoded layout/position/overflow/flexbox classes                     |
| `moon/moon.jit.css`    | JIT-generated classes (colors, spacing, pseudo-classes, media queries) |
| `Moon.Types.ts`        | TypeScript types for `Theme` and `Color` unions                        |

---

## Styles System

Each entry in the `styles` array generates:

1. **CSS variables** in `:root`
2. **Utility classes** for every `prop × value` combination

### Style Definition Shape

```json
{
  "props": { "CSS-property": "short-name" },
  "variableName": "variable-prefix",
  "values": { "token": "CSS-value" }
}
```

### Example — Spacing

```json
{
  "props": { "padding": "p", "margin": "m", "gap": "gap" },
  "variableName": "spacing",
  "values": {
    "0": "0",
    "sm": "4px",
    "md": "8px",
    "lg": "10px",
    "xl": "12px"
  }
}
```

#### Generated Variables

```css
:root {
  --spacing-0: 0;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 10px;
  --spacing-xl: 12px;
}
```

#### Generated Classes

Padding and margin get **directional variants** automatically:

| Class   | CSS Property                              |
| ------- | ----------------------------------------- |
| `p-md`  | `padding: var(--spacing-md)`              |
| `pr-md` | `padding-right: var(--spacing-md)`        |
| `pl-md` | `padding-left: var(--spacing-md)`         |
| `pt-md` | `padding-top: var(--spacing-md)`          |
| `pb-md` | `padding-bottom: var(--spacing-md)`       |
| `px-md` | `padding-inline: var(--spacing-md)`       |
| `py-md` | `padding-block: var(--spacing-md)`        |
| `ps-md` | `padding-inline-start: var(--spacing-md)` |
| `pe-md` | `padding-inline-end: var(--spacing-md)`   |

Same pattern for `m-md`, `mr-md`, `mx-md`, `my-md`, etc.

### `useStaticNumbers` Mode

When `"useStaticNumbers": true`:

- Classes use raw values: `.p-md { padding: 8px; }`
- Instead of: `.p-md { padding: var(--spacing-md); }`

### Directional Property Expansion

Certain CSS properties auto-expand to directional variants:

| CSS Property    | Variants Generated                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `padding`       | `p`, `pr`, `pl`, `pt`, `pb`, `px`, `py`, `ps`, `pe`                                                                       |
| `margin`        | `m`, `mr`, `ml`, `mt`, `mb`, `mx`, `my`, `ms`, `me`                                                                       |
| `width`         | `w`, `min-w`, `max-w`                                                                                                     |
| `height`        | `h`, `min-h`, `max-h`                                                                                                     |
| `size`          | `size` (sets both `height` and `width`)                                                                                   |
| `border-width`  | `border`, `border-t`, `border-r`, `border-b`, `border-l`, `border-x`, `border-y`, `border-s`, `border-e`                  |
| `border-radius` | `round`, `round-t`, `round-r`, `round-b`, `round-l`, `round-tl`, `round-tr`, `round-br`, `round-bl`, `round-s`, `round-e` |
| `border`        | `border`, `border-t`, `border-r`, `border-b`, `border-l`, `border-x`, `border-y`, `border-s`, `border-e`                  |

### Default Style Tokens (from `moon.config.default.json`)

| Token Group   | Variable Prefix | Short Names                                                           | Default Values                              |
| ------------- | --------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Spacing       | `spacing`       | `p`, `m`, `gap`, `inset`, `top`, `left`, `right`, `bottom`            | `0` → `6x` (0 to 40px)                      |
| Size          | `size`          | `w`, `h`, `size`                                                      | `0` → `6x` (0 to 400px)                     |
| Typography    | `text`          | `text` (font-size)                                                    | `xs` → `6x` (0.75rem to 4rem)               |
| Border Radius | `round`         | `round`                                                               | `none` → `full` (0 to 999px)                |
| Font Weight   | `weight`        | `weight`                                                              | `normal` (400), `bold` (700)                |
| Line Height   | `line-h`        | `line-h`                                                              | `normal` (1.5), `dense` (1.25), `loose` (2) |
| Font Family   | `font`          | `font`                                                                | `sans`, `serif`, `mono`                     |
| Box Shadow    | `shadow`        | `shadow`                                                              | `sm` → `2x`, `focus`, `error`, `none`       |
| Border Width  | `border`        | `border`                                                              | `none`, `thin` (1px), `thick` (2px)         |
| Border Style  | `border-style`  | `bs`                                                                  | `none`, `solid`, `dashed`, `dotted`         |
| Transition    | `transition`    | `transition`                                                          | `none`, `100` → `600` (ms)                  |
| Z-Index       | `z`             | `z`                                                                   | `0` → `100` (0–10)                          |
| Blur          | `blur`          | `blur`, `backdrop-blur`                                               | `0` → `6x`                                  |
| Opacity       | `opacity`       | `opacity`                                                             | `0` → `100`                                 |
| Filters       | `filter`        | `brightness`, `contrast`, `saturate`, `invert`, `sepia`, `hue-rotate` | `0` → `100`                                 |

---

## Color System & Themes

### Configuration Shape

```json
{
  "colors": {
    "options": {
      "*": { "opacities": [0.05, 0.25], "props": ["bg", "text"] },
      "prim": { "props": ["bg", "fill", "border"] }
    },
    "staticColors": {
      "red": "#dd3643",
      "cyan": "#63cfc9"
    },
    "themes": {
      "light": { "prim": "#FFFFFF", "owl": "#1f1d2b" },
      "dark": { "prim": "#2d303e", "owl": "#ffffff" }
    }
  }
}
```

### How It Works

1. **Static colors** go into `:root` as `--rgb-{name}: R, G, B` + `--{name}: rgb(var(--rgb-{name}))` pairs
2. **Theme colors** are converted to RGB and placed in `.theme-name { --rgb-{color}: R, G, B; }` selectors. The `:root` block also gets `--{color}: rgb(var(--rgb-{color}))` references for every theme color
3. **Opacity variants** are auto-generated: `prim-50`, `prim-250` (opacity × 1000) as `rgba(var(--rgb-{color}), opacity)`
4. **Utility classes** are generated per-color for each CSS property listed in `props`

### Generated CSS Structure (Example)

```css
/* :root has BOTH static colors AND theme color references */
:root {
  --rgb-red: 221, 54, 67; /* static color RGB */
  --red: rgb(var(--rgb-red)); /* static color value */
  --prim: rgb(var(--rgb-prim)); /* theme color reference (resolved by theme class) */
  --owl: rgb(var(--rgb-owl)); /* theme color reference */
}

/* Theme classes only contain --rgb-* keys */
.light {
  --rgb-prim: 255, 255, 255;
  --rgb-owl: 31, 29, 43;
}
.dark {
  --rgb-prim: 45, 48, 62;
  --rgb-owl: 255, 255, 255;
}
```

This RGB-based architecture enables opacity variants to work with `rgba(var(--rgb-prim), 0.5)` across all themes.

### Color Props

| Short Name | CSS Property       |
| ---------- | ------------------ |
| `bg`       | `background-color` |
| `text`     | `color`            |
| `fill`     | `fill`             |
| `border`   | `border-color`     |
| `stroke`   | `stroke`           |

### Options System

- `"*"` — applies to **all** colors (default fallback)
- Named options override `"*"` for specific colors
- `opacities` — array of decimal values (0–1), generates opacity variants
- `props` — which CSS property classes to generate for this color
- If no `props` specified and no `"*"` fallback, defaults to `["bg", "text", "fill", "border"]`

### Generated Classes (Example)

For color `prim` with `props: ["bg", "text"]` and `opacities: [0.05, 0.25]`:

```css
.bg-prim {
  background-color: var(--prim);
}
.bg-prim-50 {
  background-color: var(--prim-50);
}
.bg-prim-250 {
  background-color: var(--prim-250);
}
.text-prim {
  color: var(--prim);
}
.text-prim-50 {
  color: var(--prim-50);
}
.text-prim-250 {
  color: var(--prim-250);
}
```

### Theme Switching

Themes work by adding a CSS class to `<html>`. The class overrides the `--rgb-*` variables, which cascade through the `rgb(var(...))` references in `:root`.

Switch at runtime:

```js
import Moon from "moon-style";
Moon.setTheme("dark");
```

---

## Static Classes

These are **always generated** regardless of config — fundamental layout utilities hardcoded in `buildStaticClasses.ts`.

> **Note:** Some static classes overlap with config-generated classes (e.g., `display-none` exists in both). The static versions use hardcoded values; config-generated versions use `var(--...)` variables. Both are valid — the last one loaded wins (CSS order).

### Position

`fixed`, `absolute`, `relative`, `sticky`, `static`, `initial`, `inherit`, `unset`

### Display

`display-none`, `display-block`, `display-inline`, `display-inline-block`, `display-flex`, `display-grid`, `display-table`

### Flexbox

| Class                                                              | CSS                                            |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `flex`, `row`, `col`, `wrap`, `center`, `row-center`, `col-center` | `display: flex`                                |
| `row`, `row-center`, `row-start`, `row-end`                        | `flex-direction: row`                          |
| `col`, `col-center`, `col-start`, `col-end`                        | `flex-direction: column`                       |
| `center`                                                           | `align-items: center; justify-content: center` |
| `row-center`                                                       | `align-items: center`                          |
| `col-center`                                                       | `justify-content: center`                      |
| `wrap`                                                             | `flex-wrap: wrap`                              |
| `flex-grow`                                                        | `flex-grow: 1`                                 |

### Alignment

| Class                                                                                                   | CSS               |
| ------------------------------------------------------------------------------------------------------- | ----------------- |
| `items-center`, `items-start`, `items-end`                                                              | `align-items`     |
| `justify-center`, `justify-start`, `justify-end`, `justify-between`, `justify-around`, `justify-evenly` | `justify-content` |
| `self-start`, `self-center`, `self-end`, `self-stretch`                                                 | `align-self`      |

### Grid Spans

`col-span-full`, `col-span-1`, `col-span-2`, `col-span-3`, `row-span-full`, `row-span-1`, `row-span-2`, `row-span-3`

### Sizing

`h-screen`, `w-screen`, `w-fill`, `h-fill`, `min-w-max`

### Text Alignment

`text-center`, `text-left`, `text-right`

### User Select

`select-none`, `select-text`, `select-all`, `select-auto`

### Overflow

`overflow-auto`, `overflow-scroll`, `overflow-hidden`, `overflow-visible`  
`overflow-x-auto`, `overflow-x-scroll`, `overflow-x-hidden`, `overflow-x-visible`  
`overflow-y-auto`, `overflow-y-scroll`, `overflow-y-hidden`, `overflow-y-visible`  
`hide-scroller` (hides WebKit scrollbar)

### Cursor / Pointer

`pointer`, `cursor-default`, `cursor-cursor` (resize), `pointer-none`, `pointer-auto`, `pointer-all`

### Margin Auto

`m-auto`, `mt-auto`, `mb-auto`, `ml-auto`, `mr-auto`, `mx-auto`, `my-auto`

### Opacity

`opacity-0` through `opacity-100` (in steps of 10)

### Scrollbar Styling

Custom scrollbar styles via `--scroller-size`, `--scroller-thumb`, `--scroller-bg` variables.

---

## JIT Engine

The JIT (Just-In-Time) engine watches your source files and generates CSS **on demand** for utility patterns it detects.

### Enable JIT

```json
{ "useJit": true }
```

### Three Pattern Types

#### 1. Inline Colors (`bg:#hex`)

```html
<div class="bg:#f00 text:#ff0 fill:#0af border:#0af"></div>
```

| Pattern       | Generated CSS                            |
| ------------- | ---------------------------------------- |
| `bg:#f00`     | `.bg\:\#f00 { background-color: #f00; }` |
| `text:#ff0`   | `.text\:\#ff0 { color: #ff0; }`          |
| `fill:#0af`   | `.fill\:\#0af { fill: #0af; }`           |
| `border:#0af` | `.border\:\#0af { border-color: #0af; }` |

Supported color props: `bg`, `text`, `fill`, `border`, `stroke`, `border-r`, `border-l`, `border-t`, `border-b`

#### 2. Inline Spacing (`prop:value+unit`)

```html
<div class="p:100px m:10rem h:50% w:300px max-h:30rem"></div>
```

Supports units: `px`, `rem`, `%`, `vw`, `vh`, `em`, `ch`, `ex`, `cm`, `mm`, `in`, `pt`, `pc`

#### 3. Action Groups (Pseudo-classes, Media Queries, Pseudo-elements)

##### Pseudo-classes

```html
<div class="hover:[bg-cyan]"></div>
<div class="hover:active:[bg-cyan,text-red]"></div>
<div class="hover:[bg-cyan,text-red,p-xl,m-sm]"></div>
```

##### Combined with Media Queries

```html
<!-- Combines hover + medium screen breakpoint -->
<div class="hover:md:[bg-cyan,text-red,p-xl]"></div>

<!-- Multiple breakpoints -->
<div class="md:[bg-cyan] lg:[bg-red]"></div>
```

> **Important:** JIT generates `@media (max-width: ...)` queries — **not** `min-width`. So `md:[bg-cyan]` means "apply when screen is **at most** 960px", which is a **desktop-down** approach.

Screen names come from the `screens` config:

```json
{
  "screens": {
    "sm": "600px",
    "md": "960px",
    "lg": "1280px"
  }
}
```

##### Pseudo-elements

```html
<div data-before="content" class="before:[bg-red,h:20px,w:20px,display:block]"></div>
<div data-after="content" class="hover:after:[bg-red,text:#f00]"></div>
```

Pseudo-elements (`before`, `after`) automatically add `content: attr(data-before)` / `content: attr(data-after)`.

##### Inside Action Groups — Mix & Match

Inside `[...]` you can use:

- **Config-based classes**: `bg-cyan`, `text-red`, `p-xl`, `m-sm`
- **JIT inline values**: `h:20px`, `bg:#ff0`, `w:50%`
- **Any CSS property**: `display:block`, `opacity:0.5`

### Known Limitations

- Regex scans raw file text — no context awareness
- Matches inside comments, strings, URLs, and template literals
- `bg:#debug` in a comment will generate CSS
- `href="/page#section"` may match the color pattern
- Acceptable tradeoffs for simplicity

---

## PurgeCSS Integration

PurgeCSS removes unused CSS classes from your production builds.

### Configuration

```json
{
  "content": ["./src/**/*.{html,js,jsx,tsx}"]
}
```

### How It Works

1. Runs full build + JIT first
2. Scans files matching the `content` globs
3. Purges unused classes from `moon.styles.css`, `moon.themes.css`, and `moon.static.css`
4. Writes purged files back in-place

### Running Purge

```bash
# Via CLI
npx moon-purge

# Via Vite plugin (automatic in production builds)
# Set NODE_ENV=production
```

### Restoring Purged Classes

Re-run the builder:

```bash
npx moon
```

---

## Runtime API

Import the `Moon` object for client-side theme and color management:

```ts
import Moon from "moon-style";
```

### Methods & Properties

| API                          | Description                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Moon.init(theme?)`          | Initialize — reads from `localStorage`, falls back to `prefers-color-scheme`, then `"light"`. **Auto-called by Vite plugin.** |
| `Moon.currentTheme`          | Current active theme name (string)                                                                                            |
| `Moon.setTheme(theme)`       | Switch theme — updates `localStorage`, swaps CSS class on `<html>`                                                            |
| `Moon.onThemeChange(cb)`     | Subscribe to theme changes. Returns unsubscribe function.                                                                     |
| `Moon.setColors(colors)`     | Replace all dynamic colors. Old keys not in `colors` are removed.                                                             |
| `Moon.updateColors(colors)`  | Merge new colors into existing dynamic colors (additive).                                                                     |
| `Moon.setColor(key, value)`  | Set a single color CSS variable                                                                                               |
| `Moon.removeColors(colors?)` | Remove specified colors or all dynamic colors if no arg                                                                       |
| `Moon.removeColor(key)`      | Remove a single dynamic color                                                                                                 |

### Theme Switching Example

```tsx
import Moon from "moon-style";
import { Theme } from "../Moon.Types";

const themes: Theme[] = ["dark", "light", "darker"];

function ThemeSwitcher() {
  const [theme, setTheme] = useState(Moon.currentTheme);

  return (
    <div className="row gap-lg">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => {
            Moon.setTheme(t);
            setTheme(t);
          }}
          className="bg-prince text-owl px-xl py-lg round-lg pointer">
          {t}
        </button>
      ))}
    </div>
  );
}
```

### Dynamic Colors Example

```tsx
import Moon from "moon-style";

// Override theme colors dynamically
Moon.setColors({
  prim: "#0b132b",
  prince: "#1c2541",
  lord: "#3a506b",
  owl: "#5bc0be",
});

// Single color update
Moon.setColor("prim", "#ff0000");

// Remove all dynamic overrides (theme colors take over)
Moon.removeColors();
```

### Theme Change Listener

```tsx
const unsubscribe = Moon.onThemeChange((newTheme) => {
  console.log("Theme changed to:", newTheme);
});

// Later: unsubscribe();
```

### SSR Safety

All `Moon` methods are **no-ops on the server** (checks `typeof window !== "undefined"`). Safe for SSR/Next.js.

---

## CLI Commands

Moon provides two CLI commands via `package.json` `bin`:

### `moon` — Build & Watch

```bash
npx moon
```

1. Reads `moon.config.json` (creates default if missing)
2. Runs full CSS build
3. Watches `moon.config.json` for changes → rebuilds (+ re-runs JIT if enabled)
4. If JIT enabled, runs initial JIT scan on `projectDir`, then watches `content[0]` for file changes → incrementally regenerates JIT CSS

> **Limitation:** The file watcher only monitors `content[0]` (the first glob pattern). If you have multiple content entries, only the first is watched for JIT.

### `moon-purge` — Purge Unused CSS

```bash
npx moon-purge
```

Runs PurgeCSS on generated files using all `content` globs.

---

## Type Generation

Moon auto-generates `Moon.Types.ts` at your project root:

```ts
// This file is generated by Moon Style. Do not edit it manually.
export const themes = ["light", "dark", "darker", "bad", "LOL"] as const;
export type Theme = (typeof themes)[number];
export const colors = ["prim", "prince", "lord", "owl", "goat", "red", "cyan", "nice", "cute", "green"] as const;
export type Color = (typeof colors)[number];
```

### Usage

```ts
import { Theme, Color } from "../Moon.Types";

// Type-safe theme switching
Moon.setTheme("dark" as Theme);

// Type-safe color access
Moon.setColor("prim" as Color, "#ff0000");
```

The `Moon.Types.d.ts` file in the package itself exports generic string types for package consumers:

```ts
export type Theme = string;
export type Color = string;
```

---

## Screens Configuration

The `screens` config defines named breakpoints for JIT media queries. They are **not used by the CSS builder** — only the JIT engine reads them.

### Default Screens

| Name      | Value    | Description  |
| --------- | -------- | ------------ |
| `xs`      | `0px`    | Extra small  |
| `sm`      | `600px`  | Small        |
| `md`      | `960px`  | Medium       |
| `lg`      | `1280px` | Large        |
| `xl`      | `1920px` | Extra large  |
| `phone`   | `0px`    | Alias for xs |
| `tablet`  | `600px`  | Alias for sm |
| `desktop` | `960px`  | Alias for md |
| `wide`    | `1280px` | Alias for lg |
| `ultra`   | `1920px` | Alias for xl |

You can add custom screens:

```json
{
  "screens": {
    "laptop": "1024px",
    "4k": "2560px"
  }
}
```

Usage in JIT: `laptop:[p-xl,bg-prince]` → `@media (max-width: 1024px) { ... }`

---

## Configuration Schema Reference

Full schema: `./node_modules/moon-style/dist/moon.config.schema.json`

### Required Fields

All top-level fields are required per the schema:

- `colors` (with `options`, `staticColors`, `themes`)
- `useStaticNumbers`
- `content`
- `projectDir`
- `useJit`
- `styles`
- `screens`

> **In practice**, the deep merge with built-in defaults means your config works even if you only override a few fields. But the schema marks all as required for explicit validation.

### Color Options Constraints

- `opacities`: Array of numbers between `0.01` and `1`
- `props`: Array of `"bg"`, `"text"`, `"fill"`, `"border"`, or `"stroke"`

---

## Property Short-Name Reference

All properties recognized by the JIT engine and style builder:

### Color Properties (JIT)

| Short Name | CSS Property          |
| ---------- | --------------------- |
| `bg`       | `background-color`    |
| `text`     | `color`               |
| `fill`     | `fill`                |
| `border`   | `border-color`        |
| `stroke`   | `stroke`              |
| `border-r` | `border-right-color`  |
| `border-l` | `border-left-color`   |
| `border-t` | `border-top-color`    |
| `border-b` | `border-bottom-color` |

### Full CSS Property Map (Builder)

The builder recognizes 80+ CSS properties for style generation. Key built-in mappings:

| Short Name      | Expands To                           |
| --------------- | ------------------------------------ |
| `p`             | `padding` + all directions           |
| `m`             | `margin` + all directions            |
| `w`             | `width`, `min-width`, `max-width`    |
| `h`             | `height`, `min-height`, `max-height` |
| `size`          | `width` + `height`                   |
| `round`         | `border-radius` + all corners        |
| `border`        | `border-width` + all sides           |
| `shadow`        | `box-shadow`                         |
| `blur`          | `filter: blur()`                     |
| `backdrop-blur` | `backdrop-filter: blur()`            |
| `content`       | `content: attr(data-...)`            |

All other CSS properties (e.g., `z-index`, `opacity`, `transition`, `animation`, `grid-*`, `flex-*`, etc.) are mapped 1:1 with their CSS name.

---

## Usage Examples

### HTML

```html
<div class="p-md m-custom bg-prim text-red"></div>
```

### CSS Variables

```css
.my-class {
  background-color: var(--prim);
  color: var(--red);
  padding: var(--spacing-md);
  margin: var(--spacing-custom);
}
```

### Complex Layout

```html
<div class="fixed inset-0 bg-prim col">
  <div class="bg-prince round-xl p-md shadow-lg size-5x m-auto">
    <div class="col-center p-xl font-mono">
      <p class="text-owl text-2x weight-bold">Hello Moon</p>
      <div class="row gap-lg wrap">
        <span class="bg-cyan text-owl px-xl py-lg round-lg">Tag 1</span>
        <span class="bg-red text-owl px-xl py-lg round-lg">Tag 2</span>
      </div>
    </div>
  </div>
</div>
```

### JIT Mixed Syntax

```html
<div
  class="
  bg:#1a1a2e
  p:24px
  round:12px
  hover:[bg-prince,shadow-lg]
  md:[p:48px,text-2x]
  before:[bg-red,h:4px,w-fill,display:block]
"
  data-before="">
  Content
</div>
```
