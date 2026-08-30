# Moon-Style

**Purpose:** CSS design system — config-driven CSS generation (themes, colors, spacing, static utility classes), JIT CSS engine, SVG icon pipeline (sprite generation, CLI management, browser UI), Vite plugin for dev HMR, and a runtime API for theme switching and dynamic color management.

## Quick Map

| Concept          | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **Moon Runtime** | Theme switching, dynamic color management via CSS custom properties |
| **Builder**      | Config → CSS generation (colors, styles, static classes, types)     |
| **JIT Engine**   | On-demand CSS class generation from source file scanning            |
| **Icon System**  | SVG → sprite pipeline, CLI management, React `IconBase` primitive   |
| **Vite Plugin**  | `moonPlugin()` — dev HMR, icon watching, CSS purge, init file       |
| **Config**       | `moon.config.json` — themes, colors, styles, JIT, icons, screens    |

## Area Guide — Read Only What You Need

| Working on...                  | Read this                |
| ------------------------------ | ------------------------ |
| Theme API / dynamic colors     | [`context/runtime.md`](./context/runtime.md)         |
| CSS builder / config / JIT     | [`context/builder.md`](./context/builder.md)         |
| Icons (CLI, sprite, component) | [`context/icons.md`](./context/icons.md)             |
| Vite plugin / workflow         | [`context/vite-plugin.md`](./context/vite-plugin.md) |

> **Need everything?** Read all `context/*.md` files — each is self-contained.

## API Surface

Entry point: [`lib/index.ts`](../lib/index.ts) (runtime export)

**Runtime (default export):**

- `Moon.init(theme?)` — read stored/system theme, apply
- `Moon.setTheme(theme)` — apply theme class to `<html>`, persist, notify listeners
- `Moon.onThemeChange(cb)` → unsubscribe function
- `Moon.currentTheme` — current theme string
- `Moon.setColors(colors)` — **replace** all dynamic colors (removes old keys not in new object)
- `Moon.updateColors(colors)` — **merge** into existing dynamic colors
- `Moon.setColor(key, value)` — set single color
- `Moon.removeColors(colors?)` — remove specific keys, or all if no argument
- `Moon.removeColor(key)` — remove single color

**Icons (`moon-style/icon`):**

- `IconBase({ name, href, size?, ...props })` — headless SVG sprite `<use>` component

**Vite Plugin (`moon-style/vite`):**

- `moonPlugin()` — full Vite plugin (CSS watcher, icon builder, HTML injection, virtual module)

**CLI (`moon` binary):**

- `moon` — starts CSS watcher (+ JIT if enabled)
- `moon icons:groups` — list icon groups
- `moon icons:list [group]` — list icons
- `moon icons:add [targets] --style=<Style>` — copy icons to project
- `moon icons:ui` — open browser icon picker

**Types (generated `Moon.Types.ts`):**

- `Theme` — union of theme names from config
- `Color` — union of color variable names
- `themes` / `colors` — const arrays

## Anti-Patterns

- ❌ Don't call any `Moon` method on the server — all methods guard with `isBrowser` and return silently
- ❌ Don't manually edit `moon/` folder or `Moon.Types.ts` — generated, gitignored
- ❌ Don't use `Moon.setColors()` when you want to add — it removes old keys not in the new object. Use `Moon.updateColors()` instead.
- ❌ Don't forget to add `content` to `moon.config.json` for production — PurgeCSS needs it

## Source Structure

```
lib/
├── index.ts                 # Moon runtime: theme/color API (default export)
├── moon.ts                  # CLI entry point (bin: moon)
├── purge.ts                 # CLI: production CSS purge (bin: moon-purge)
├── workflow.ts              # Watcher, PurgeCSS function
├── icon.tsx                 # IconBase React component (headless)
├── icons.ts                 # CLI icon commands (add, list, groups, ui)
├── icons-utils.ts           # Slugify, paths, cache management
├── icons-server.ts          # Browser UI for icon picker (Node http server)
├── icons-client.html        # Frontend for icon picker UI
├── vite-plugin-moon.ts      # Vite plugin: watcher, icons, virtual module
├── vite-plugin-icons.ts     # Icon sprite builder (SVG → sprite.svg + names.ts)
├── builder/
│   ├── build.ts             # buildConfig() entry point
│   ├── controller.ts        # Controller singleton: config, state, file generation
│   ├── buildColors.ts       # Theme CSS variables + static color classes
│   ├── buildStyles.ts       # Spacing/sizing CSS variables + utility classes
│   ├── buildStaticClasses.ts # Layout utilities, flex, grid, display, etc.
│   └── utils.ts             # CSS generation helpers, PropsByName mapping
├── jit/
│   └── jit.ts               # JIT CSS engine: scan source → generate on-demand classes
├── helpers/
│   └── owlFs.ts             # File system helpers
```

Repository tests are intentionally excluded from the published package.

## Testing

```bash
pnpm test    # Vitest
```
