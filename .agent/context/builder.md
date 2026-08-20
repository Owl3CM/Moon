# Builder — Config, CSS Generation & JIT

Covers the build pipeline that reads `moon.config.json` and generates CSS files, utility classes, and TypeScript types.

## Configuration (`moon.config.json`)

Merged with defaults via `deepMerge()` in `Controller.init()`.

### Top-Level Keys

| Key                | Type       | Default                            | Purpose                                 |
| ------------------ | ---------- | ---------------------------------- | --------------------------------------- |
| `useJit`           | `boolean`  | `true`                             | Enable JIT CSS engine                   |
| `useStaticNumbers` | `boolean`  | `false`                            | Emit raw values instead of CSS vars     |
| `projectDir`       | `string`   | `"./src"`                          | Source directory for JIT scanning       |
| `content`          | `string[]` | `["./src/**/*.{html,js,jsx,tsx}"]` | Glob patterns for PurgeCSS + JIT        |
| `colors`           | `object`   | —                                  | Themes, static colors, options          |
| `styles`           | `array`    | —                                  | Spacing, sizing, typography definitions |
| `icons`            | `object`   | —                                  | Icon pipeline paths (see `icons.md`)    |
| `screens`          | `object`   | `{ xs: "0px", sm: "600px", ... }`  | Breakpoints for JIT responsive classes  |

### `colors` Section

```json
{
  "options": {
    "*": { "opacities": [0.05, 0.25], "props": ["bg", "text"] },
    "red": { "props": ["bg", "text", "border"] }
  },
  "staticColors": { "red": "#dd3643", "green": "#7bc74d" },
  "themes": {
    "light": { "prim": "#FFFFFF", "owl": "#1f1d2b" },
    "dark": { "prim": "#2d303e", "owl": "#ffffff" }
  }
}
```

- **`themes`** — each key becomes a CSS class on `:root` (e.g., `.light`, `.dark`). Colors become CSS vars.
- **`staticColors`** — theme-independent colors on `:root`.
- **`options`** — per-color config. `"*"` applies to all colors. `props` controls which utility classes are generated (`bg`, `text`, `fill`, `border`, `stroke`). `opacities` generates `rgba()` variants (e.g., `bg-red-250` for 0.25 opacity).

### `styles` Section

Array of style groups. Each group:

```json
{
  "props": { "padding": "p", "margin": "m", "gap": "gap" },
  "variableName": "spacing",
  "values": { "0": "0", "xs": "2px", "sm": "4px", "md": "8px" }
}
```

- **`props`** — CSS property → short name mapping. If empty, generates CSS variables only.
- **`variableName`** — prefix for CSS variables (e.g., `--spacing-xs`).
- **`values`** — value token map.
- Generates classes like `p-md`, `px-lg`, `gap-xl` etc. Short names expand via `PropsByName` in `utils.ts` (e.g., `p` → `p`, `pr`, `pl`, `pt`, `pb`, `px`, `py`, `ps`, `pe`).

## Controller Singleton (`builder/controller.ts`)

Central state for the build pipeline:

- `Controller.init(config)` — deep-merges user config into defaults
- `Controller.createStyles()` — orchestrates full build:
  1. `reset()` — clears generated state
  2. `getStyles()` → writes `moon/moon.styles.css`
  3. `getColors()` → writes `moon/moon.themes.css`
  4. `getStaticCss()` → writes `moon/moon.static.css`
  5. Creates `moon/moon.jit.css` placeholder (if missing)
  6. Generates `Moon.Types.ts`
  7. Generates `moon/main.css` (imports all above)

### State Fields

| Field               | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `GeneratedClasses`  | Map of class name → CSS value (for JIT lookups) |
| `StylesVariables`   | CSS variable declarations for `:root`           |
| `ColorsVariables`   | Array of all color names (for type generation)  |
| `PropsByShortNames` | Short name → CSS property mapping (for JIT)     |
| `config`            | Merged configuration object                     |

## Builder Modules

### `buildColors.ts` → `moon.themes.css`

1. Generates `:root` block with static colors as CSS vars (via `rgb()` wrapper)
2. Generates `.light`, `.dark`, etc. blocks with theme-specific RGB vars
3. Generates utility classes: `bg-{color}`, `text-{color}`, `border-{color}`, `fill-{color}`
4. Generates opacity variants: `bg-{color}-{opacity*1000}` (e.g., `bg-red-250`)
5. Default props per color: `["bg", "text", "fill", "border"]` (overridable via `options`)

### `buildStyles.ts` → `moon.styles.css`

1. Generates `:root` block with CSS variables for each value token
2. Generates utility classes per prop × value combination
3. Uses `PropsByName` from `utils.ts` for directional expansion (e.g., `padding` → `p`, `pr`, `pl`, `pt`, `pb`, `px`, `py`, `ps`, `pe`)
4. If `useStaticNumbers` is true, classes use raw values instead of `var()` references

### `buildStaticClasses.ts` → `moon.static.css`

Hardcoded utility classes:

- **Flexbox:** `flex`, `row`, `col`, `wrap`, `center`, `row-center`, `col-center`, `items-center`, `justify-between`, etc.
- **Grid:** `col-span-1..3`, `col-span-full`, `row-span-1..3`, `row-span-full`
- **Display:** `display-none`, `display-block`, `display-flex`, `display-grid`, etc.
- **Position:** `fixed`, `absolute`, `relative`, `sticky`, `static`
- **Overflow:** `overflow-auto`, `overflow-hidden`, `overflow-scroll`, with `-x` and `-y` variants
- **Sizing:** `w-screen`, `h-screen`, `w-fill`, `h-fill`, `min-w-max`
- **Other:** `pointer`, `pointer-none`, `text-center`, `text-left`, `text-right`, `select-none`, `flex-grow`, `opacity-0..100`, `m-auto` variants

### `utils.ts` — CSS Property Mapping

`PropsByName`: maps CSS properties to directional variants. Key mappings:

| Property        | Short   | Variants                                                                |
| --------------- | ------- | ----------------------------------------------------------------------- |
| `padding`       | `p`     | `p`, `pr`, `pl`, `pt`, `pb`, `px`, `py`, `ps`, `pe`                     |
| `margin`        | `m`     | `m`, `mr`, `ml`, `mt`, `mb`, `mx`, `my`, `ms`, `me`                     |
| `width`         | `w`     | `w`, `min-w`, `max-w`                                                   |
| `height`        | `h`     | `h`, `min-h`, `max-h`                                                   |
| `border`        | —       | `border`, `-t`, `-r`, `-b`, `-l`, `-x`, `-y`, `-s`, `-e`                |
| `border-radius` | `round` | `round`, `-t`, `-r`, `-b`, `-l`, `-tl`, `-tr`, `-br`, `-bl`, `-s`, `-e` |

Also maps: `font-size`, `line-height`, `letter-spacing`, `font-weight`, `font-family`, `box-shadow`, `blur`, `backdrop-blur`, `z-index`, all grid properties, all animation properties, filters, scrollbar, transitions, etc.

`getDefaultName()`: maps CSS property names to short names (e.g., `"padding"` → `"p"`, `"background-color"` → `"bg"`).

## JIT Engine (`jit/jit.ts`)

On-demand CSS generation by scanning source files.

### Entry Points

- `Jit_Start()` — full scan: reads `moon.config.json`, recursively scans `projectDir`, writes `moon.jit.css`
- `Sync_Changes(filePath)` — incremental: scans single file, writes if changed

### Patterns Matched

| Pattern                | Example                     | Generated CSS                                            |
| ---------------------- | --------------------------- | -------------------------------------------------------- |
| `{action}:[classes]`   | `hover:[bg-red,text-white]` | `.hover\:\[...\]:hover{background-color:...; color:...}` |
| `{prop}:#{color}`      | `bg:#ff0000`                | `.bg\:\#ff0000{background-color:#ff0000}`                |
| `{prop}:{value}{unit}` | `p:12px`                    | `.p\:12px{padding:12px}`                                 |

### Action Pattern Details

- Supports pseudo-classes: `hover`, `focus`, `active`, etc.
- Supports pseudo-elements: `before`, `after` (auto-adds `content:attr(data-...)`)
- Supports responsive: `sm`, `md`, `lg` etc. from `config.screens` → wraps in `@media`
- Multiple actions chainable: `sm:hover:[bg-red]`
- Class values resolve through `Controller.GeneratedClasses` first, then `Controller.PropsByShortNames`

### Color Props in JIT

`ColorsPropsByShortNames` map: `bg`, `text`, `fill`, `border`, `stroke`, `border-r`, `border-l`, `border-t`, `border-b`.

## PurgeCSS (`workflow.ts`)

Production-only — runs `PurgeCSS` library against `content` glob patterns:

1. `buildConfig()` — full CSS build
2. `Jit_Start()` — JIT pass
3. PurgeCSS runs on `moon.styles.css`, `moon.themes.css`, `moon.static.css`
4. Writes purged CSS back to same files

Requires `content` in `moon.config.json` or throws.

## Source

- [build.ts](../../lib/builder/build.ts)
- [controller.ts](../../lib/builder/controller.ts)
- [buildColors.ts](../../lib/builder/buildColors.ts)
- [buildStyles.ts](../../lib/builder/buildStyles.ts)
- [buildStaticClasses.ts](../../lib/builder/buildStaticClasses.ts)
- [utils.ts](../../lib/builder/utils.ts)
- [jit.ts](../../lib/jit/jit.ts)
- [workflow.ts](../../lib/workflow.ts)
