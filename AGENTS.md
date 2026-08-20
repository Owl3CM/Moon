# Moon-Style agent guide

Start with [`.agent/_index.md`](./.agent/_index.md). It routes theme/runtime,
builder/JIT, icon, and Vite-plugin work to focused context documents. The
published package includes those documents and the referenced TypeScript source,
so the guide remains usable directly from `node_modules/moon-style`.

Generated files under `dist/`, `moon/`, and `Moon.Types.ts` must not be edited
by hand. Run `pnpm test`, `pnpm typecheck`, and `pnpm prepack` before release.
