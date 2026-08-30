# Moon-Style — Manual Tests

> Runtime behaviors that can't be verified from source alone.

## Theme System

### T1 — Moon.init() picks system theme

1. Clear `localStorage.removeItem("theme")`
2. Reload page
3. **Pass:** `<html>` has class `dark` or `light` matching OS preference

### T2 — Moon.init() reads stored theme

1. `localStorage.setItem("theme", "dark")`
2. Reload page
3. **Pass:** `<html>` has class `dark` regardless of OS preference

### T3 — Moon.setTheme() persists and applies

1. In console: `Moon.setTheme("light")`
2. **Pass:** `<html>` class changes to `light`, `localStorage.getItem("theme")` === `"light"`

### T4 — onThemeChange fires and unsubscribes

1. `const unsub = Moon.onThemeChange(t => console.log("theme:", t))`
2. `Moon.setTheme("dark")` → console logs `theme: dark`
3. `unsub()`
4. `Moon.setTheme("light")` → no log
5. **Pass:** callback fires before unsub, silent after

## Dynamic Colors

### T5 — setColors replaces (removes old keys)

1. `Moon.setColors({ accent: "#ff0000" })`
2. Check `getComputedStyle(document.documentElement).getPropertyValue("--accent")` → `#ff0000`
3. `Moon.setColors({ info: "#0000ff" })`
4. Check `--accent` → empty, `--info` → `#0000ff`
5. **Pass:** old keys removed, new keys set

### T6 — updateColors merges

1. `Moon.setColors({ accent: "#ff0000" })`
2. `Moon.updateColors({ info: "#0000ff" })`
3. Check `--accent` → `#ff0000`, `--info` → `#0000ff`
4. **Pass:** both keys present

### T7 — setColor does not track in dynamicColors

1. `Moon.setColor("accent", "#ff0000")`
2. `Moon.setColors({})` — should NOT remove `--accent` (since it wasn't tracked)
3. **Pass:** `--accent` still present after `setColors({})`
   > Actually, `setColors({})` iterates `dynamicColors` (which has no `accent`), so it won't remove it. This is correct but surprising behavior.

### T8 — removeColors clears all

1. `Moon.setColors({ accent: "#ff0000", info: "#0000ff" })`
2. `Moon.removeColors()`
3. Check `--accent` and `--info` → both empty
4. **Pass:** all dynamic colors removed

## CSS Builder

### T9 — moon.config.json change triggers rebuild

1. Start `moon` CLI or Vite dev server
2. Edit `moon.config.json` (e.g., add a new spacing value)
3. **Pass:** `moon/moon.styles.css` updates within seconds

### T10 — JIT generates class on save

1. With JIT enabled, add `hover:[bg-red,text-white]` to a `.tsx` file
2. Save
3. **Pass:** `moon/moon.jit.css` contains the generated hover class

## Icon System

### T11 — icons:ui opens browser UI

1. Run `moon icons:ui`
2. **Pass:** Browser opens at `http://localhost:8293`, shows icon grid

### T12 — icons:add copies to project

1. Run `moon icons:add "Arrows" --style=Outline`
2. **Pass:** SVG files appear in the project icon directory under `outline/`

### T13 — SVG sprite rebuilds on icon add/remove

1. Dev server running
2. Add/remove an SVG in the icon source directory
3. **Pass:** `public/icons/sprite.svg` updates, browser hot-reloads

### T14 — Colored icons preserve exact colors

1. Add a colored/brand SVG to the `colored/` variant folder
2. Check sprite output
3. **Pass:** colors are NOT replaced with `currentColor`

## Vite Plugin

### T15 — init.ts auto-created

1. Delete `moon/init.ts` if it exists
2. Start Vite dev server
3. **Pass:** `moon/init.ts` is recreated

### T16 — HTML injection

1. Start Vite dev server
2. View page source
3. **Pass:** `<script type="module" src="/moon/init.ts"></script>` appears before `</head>`

### T17 — PurgeCSS in production build

1. Run `NODE_ENV=production` Vite build
2. **Pass:** `moon/moon.styles.css`, `moon.themes.css`, `moon.static.css` contain only used classes
