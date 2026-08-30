# Vite Plugin

`moonPlugin()` — Vite plugin providing CSS build watcher, icon sprite builder, HTML injection, and virtual module for sprite URLs.

Exported from `moon-style/vite`:

```ts
import moonPlugin from "moon-style/vite";
export default defineConfig({ plugins: [moonPlugin()] });
```

## Plugin Lifecycle

### `buildStart()` (Production + Dev)

1. Runs `PurgeCSS()` if `NODE_ENV === "production"`
2. `ensureGitignore()` — adds `moon/` to `.gitignore` if missing
3. `ensureInitFile()` — creates `moon/init.ts` if missing
4. `buildIcons(iconsConfig)` — builds SVG sprite

### `configureServer(server)` (Dev Only)

1. `ensureInitFile()`
2. Starts `Watcher()` (CSS rebuild on config change + JIT file watcher) — only if `NODE_ENV` is not set or is `"development"`
3. Watches `{svgDir}/**/*.svg` via Vite's watcher
4. On SVG add/change/unlink → debounced rebuild (300ms):
   - `buildIcons(iconsConfig)`
   - Bumps `spriteVersion` (cache-buster)
   - Invalidates virtual module + names module in `moduleGraph`
   - Triggers `full-reload` via WebSocket

### `transformIndexHtml()` (Order: `"pre"`)

Injects `<script type="module" src="/moon/init.ts"></script>` before `</head>`.

### `resolveId()` / `load()`

Resolves the virtual module `virtual:moon-icons/sprite-url`:

```ts
import { spriteUrl } from "virtual:moon-icons/sprite-url";
// → "/icons/sprite.svg?v=1709337600000"
```

Prefixed with `\0` per Vite convention. Cache-busted with `Date.now()` on every icon rebuild.

## Init File (`moon/init.ts`)

Auto-created if missing:

```ts
import Moon from "moon-style";
import "./main.css";
Moon.init();
```

This is the entry point injected into `index.html` by the plugin.

## Watcher (`workflow.ts`)

Started by the Vite plugin in dev mode. Watches:

1. **`moon.config.json`** — full rebuild via `buildConfig()` on change. If JIT enabled, also runs `Jit_Start()`.
2. **`content` glob** (if `useJit: true`) — `Sync_Changes(path)` on file change for incremental JIT.
3. **SIGINT** — clean exit handler.

### Build Flow

`ensureConfig()` → copies `moon.config.default.json` from the package if `moon.config.json` doesn't exist.

`buildConfig()` → reads `moon.config.json` → `Controller.init(config)` → `Controller.createStyles()`.

## Source

- [vite-plugin-moon.ts](../../lib/vite-plugin-moon.ts)
- [workflow.ts](../../lib/workflow.ts)
- [vite-plugin-icons.ts](../../lib/vite-plugin-icons.ts)
