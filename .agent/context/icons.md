# Icon System

SVG icon pipeline: cache management, CLI commands, sprite builder, and a headless React component.

## Icon Cache (`icons-utils.ts`)

Icons cached at `~/.moon-icons/` (home directory). Sources:

1. **Solar Icon Set** — cloned from `https://github.com/480-Design/Solar-Icon-Set.git`
2. **Simple Icons** — brand logos cloned from `https://github.com/simple-icons/simple-icons.git`, copied into `SVG/Outline/Simple Icons/`

### Available Styles

`Bold`, `Outline`, `Line Duotone`, `Broken`, `Linear`, `Bold Duotone`, `Colored`

### Cache Management

- `ensureIconsCache()` — downloads if not present, waits if another process is downloading (PID-based lock via `~/.moon-icons-status.json`)
- `readCacheStatus()` → `{ status: "downloading" | "done" | "failed", ... }`
- Cache status file: `~/.moon-icons-status.json` (outside clone target)
- Uses `git clone --depth 1` for efficient download

### Utilities

- `slugify(name)` — `name.toLowerCase().replace(/[\s_]+/g, "-")`
- `resolveProjectIconsDir()` — reads `moon.config.json` → `icons.svgDir`, defaults to `src/assets/icons/qaseh`
- `ICONS_SVG_DIR` — `~/.moon-icons/Icons/SVG`

## CLI Commands (`icons.ts`)

Entry point: `handleIconsCommand(args)` — called from `moon.ts` when first arg starts with `icons:`.

### `moon icons:groups`

Lists all icon groups (subdirectories of the first available style directory).

### `moon icons:list [group]`

Lists icons. Without `group`: lists all unique icon names across groups. With `group`: lists icons in that group only.

### `moon icons:add [targets] --style=<Style>`

Copies icons from cache to project's icon directory.

| Target Format | Behavior                              |
| ------------- | ------------------------------------- |
| (none)        | Adds ALL icons for the style          |
| `group`       | Adds all icons in the group           |
| `group/icon`  | Adds a single icon (force-overwrites) |

- `--style` is required (e.g., `--style=Bold`)
- Destination: `{projectIconsDir}/{style-lowercase}/`
- Filenames are slugified
- Skips existing files unless target is `group/icon` (force)

### `moon icons:ui`

Opens an HTTP server (Node `http` module) with a browser-based icon picker (`icons-server.ts` + `icons-client.html`).

## Sprite Builder (`vite-plugin-icons.ts`)

Builds the SVG sprite from project icon files at dev server startup and on HMR.

### Configuration (`IconsConfig`)

Read from `moon.config.json` → `icons` section:

| Key         | Default                              | Purpose                    |
| ----------- | ------------------------------------ | -------------------------- |
| `svgDir`    | `"src/assets/icons"`                 | Source SVG directory       |
| `namesOut`  | `"src/design-system/icons/names.ts"` | Generated TypeScript types |
| `spriteOut` | `"public/icons/sprite.svg"`          | Output sprite file         |

### `buildIcons(config)`

1. `walkIcons(svgDir)` — recursively finds all `.svg` files, returns `{ variant, name, filePath }[]`
2. Variant = immediate parent folder name (lowercase)
3. ID resolution: `outline` variant → plain name (e.g., `"key"`), all others → `"{name}-{variant}"` (e.g., `"key-bold"`)
4. `toSymbol(raw, id, variant, optimize)` — per-icon processing:
   - Strips `<script>` tags (security)
   - SVGO optimization (preserves colors for `colored` variant, normalizes to `currentColor` for others)
   - Extracts `viewBox` from raw SVG (before SVGO strips it)
   - Unwraps root `<svg>`, strips namespaces, replaces `xlink:href` with `href`
   - Sets symbol `fill` based on root `<svg>` fill attribute
5. Outputs `sprite.svg` with `<symbol>` per icon
6. Outputs `names.ts`:

```ts
export const ICONS = {
  key: "2026-03-01T...",
  "key-bold": "2026-03-01T...",
} as const;
export type IconName = keyof typeof ICONS;
export const ALL_ICON_NAMES = Object.keys(ICONS) as IconName[];
```

## IconBase Component (`icon.tsx`)

Headless SVG sprite icon — zero styling, zero DS tokens.

```tsx
import { IconBase } from "moon-style/icon";

<IconBase name="icon-name" href={spriteUrl} size={18} {...props} />;
```

### `IconBaseProps`

| Prop      | Type               | Default | Purpose                                |
| --------- | ------------------ | ------- | -------------------------------------- |
| `name`    | `string`           | —       | Symbol ID in the sprite                |
| `href`    | `string`           | —       | Sprite URL (e.g., from virtual module) |
| `size`    | `number \| string` | `18`    | `width` and `height` on `<svg>`        |
| `...rest` | `any`              | —       | Spread onto `<svg>` element            |

Renders: `<svg width={size} height={size} focusable="false" {...props}><use href="${href}#${name}" /></svg>`

The DS layer wraps this with class names, size tokens, and aria defaults.

## Source

- [icon.tsx](../../lib/icon.tsx)
- [icons.ts](../../lib/icons.ts)
- [icons-utils.ts](../../lib/icons-utils.ts)
- [icons-server.ts](../../lib/icons-server.ts)
- [vite-plugin-icons.ts](../../lib/vite-plugin-icons.ts)
