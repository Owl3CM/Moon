---
description: Take browser screenshots of local or remote pages using Playwright webkit
---

// turbo-all

## Setup (one-time)

Playwright webkit should already be installed. If not:

1. Install playwright webkit browser:

```
npx playwright install webkit
```

## Taking Screenshots

1. Take a screenshot of a page:

```
npx playwright screenshot --browser webkit --full-page --viewport-size "1400,900" <URL> /tmp/screenshot.png
```

2. View the screenshot using `view_file`:

```
view_file /tmp/screenshot.png
```

## Notes

- Use `--full-page` for full page screenshot, remove it for viewport-only
- Change viewport size as needed: `"1400,900"`, `"375,812"` (mobile), etc.
- The browser subagent tool is unreliable in this environment — use this workflow instead
- Arc browser is installed at `/Applications/Arc.app` but cannot run headless while already open
- No Chrome/Firefox installed on this Mac
